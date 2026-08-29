import { Context, Next } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { kv } from '@vercel/kv'
import { getClientIp } from './_ipUtils.js'
import { adminErrorResponse, requestIdMiddleware } from './_adminErrors.js'
export { requestIdMiddleware }

// Production origins only. localhost is added for non-production deployments
// below: shipping a dev origin in the production allowlist widens CORS for no
// operational benefit.
const allowedOrigins = [
  'https://xaujournal.vercel.app',
  'https://www.xaujournal.com',
  'https://xaujournal.com',
]

// The admin console is deployed separately and may call only /api/admin. Keep
// its origin out of the general API allowlist so a compromise of the console
// does not widen browser access to unrelated webhook and account routes.
const adminAllowedOrigins = ['https://admin.xaujournal.com']
if (process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173')
  adminAllowedOrigins.push(
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4174',
    'http://127.0.0.1:4174',
  )
}
if (process.env.ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.ALLOWED_ORIGIN)
}

/**
 * CORS headers middleware.
 */
export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('Origin')
  const isAdminRoute = c.req.path === '/api/admin' || c.req.path.startsWith('/api/admin/')
  const routeOrigins = isAdminRoute ? adminAllowedOrigins : allowedOrigins

  // Every origin-dependent response must vary, including denied preflights.
  c.header('Vary', 'Origin')
  if (origin && routeOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  }
  c.header(
    'Access-Control-Allow-Headers',
    isAdminRoute ? 'Authorization, Content-Type, X-Request-Id' : 'Authorization, Content-Type, X-Api-Key, x-api-key',
  )
  if (isAdminRoute) c.header('Access-Control-Expose-Headers', 'X-Request-Id, Retry-After')
  c.header('Access-Control-Allow-Methods', isAdminRoute ? 'GET, POST, PATCH, DELETE, OPTIONS' : 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  if (c.req.method === 'OPTIONS') {
    if (isAdminRoute && origin && !routeOrigins.includes(origin)) {
      return adminErrorResponse(c, 403, 'ORIGIN_NOT_ALLOWED', 'Origin not allowed', 'authorization')
    }
    return c.body(null, 204 as any)
  }
  await next()
}

/**
 * Secure headers middleware wrapping hono's secureHeaders.
 */
export const secureHeadersMiddleware = secureHeaders()

/**
 * Per-scope limits, in requests per window.
 *
 * `contact` is deliberately far below the generic `api` bucket: it is a
 * human-driven form that writes a Firestore document and sends an email on
 * every call, so the generic 100/min allowance was three orders of magnitude
 * more than any real user needs.
 */
const RATE_LIMIT_SCOPES: Array<{ scope: string; limit: number; windowSeconds: number; match: (path: string) => boolean }> = [
  { scope: 'contact', limit: 5, windowSeconds: 3600, match: (p) => p.includes('/contact') },
  { scope: 'auth', limit: 20, windowSeconds: 3600, match: (p) => p.includes('/auth-utils') },
  // /sync-trade (MT5 EA) shares the handler AND the traffic profile of
  // /tv-webhook: many users' EAs can sit behind one prop-firm VPS IP, so the
  // generic 100/min bucket drops real trade events.
  { scope: 'webhook', limit: 500, windowSeconds: 60, match: (p) => p.includes('/tv-webhook') || p.includes('/sync-trade') },
  { scope: 'broker', limit: 10, windowSeconds: 60, match: (p) => p.includes('/broker-') || p.includes('/connect-broker') },
  { scope: 'market', limit: 120, windowSeconds: 60, match: (p) => p.includes('/yahoo-chart') || p.includes('/spot-price') },
  { scope: 'vitals', limit: 60, windowSeconds: 60, match: (p) => p.includes('/vitals') },
]

const DEFAULT_SCOPE = { scope: 'api', limit: 100, windowSeconds: 60 }

/**
 * IP-based rate limiting using Vercel KV.
 * Bypass rate limiting for CORS preflight (OPTIONS) requests.
 */
export async function rateLimitMiddleware(c: Context, next: Next) {
  if (c.req.method === 'OPTIONS') {
    return await next()
  }

  const path = c.req.path
  const matched = RATE_LIMIT_SCOPES.find((entry) => entry.match(path)) || DEFAULT_SCOPE
  const { scope, limit, windowSeconds } = matched
  const isBroker = scope === 'broker'
  const ip = getClientIp(c)
  const key = 'rl:' + scope + ':' + ip

  let current = 0
  try {
    const p = kv.pipeline()
    p.incr(key)
    p.ttl(key)
    const [incrResult, ttlResult] = await p.exec() as [number, number]
    current = incrResult
    if (ttlResult === -1) {
      await kv.expire(key, windowSeconds)
    }
  } catch (kvErr: any) {
    console.error('[RateLimit] Vercel KV error:', kvErr.message)
    if (isBroker) return c.json({ error: 'Broker service temporarily unavailable' }, 503)
    return await next()
  }

  c.header('X-RateLimit-Limit', limit.toString())
  c.header('X-RateLimit-Remaining', Math.max(0, limit - current).toString())

  if (current > limit) {
    let ttl = windowSeconds
    try {
      const remainingTtl = await kv.ttl(key)
      if (remainingTtl > 0) {
        ttl = remainingTtl
      }
    } catch {
      // ignore TTL error
    }
    c.header('Retry-After', ttl.toString())
    if (path === '/api/admin' || path.startsWith('/api/admin/')) {
      return adminErrorResponse(c, 429, 'RATE_LIMITED', 'Rate limit exceeded. Please try again later.', 'rate_limit')
    }
    return c.json({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' }, 429)
  }

  await next()
}

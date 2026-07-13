import { Context, Next } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { kv } from '@vercel/kv'
import { getClientIp } from './_ipUtils.js'

// Allowed Origins setup
const allowedOrigins = [
  'https://xaujournal.vercel.app',
  'https://www.xaujournal.com',
  'https://xaujournal.com',
  'http://localhost:5173',
]
if (process.env.ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.ALLOWED_ORIGIN)
}

/**
 * CORS headers middleware.
 */
export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('Origin')
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  }
  c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Api-Key, x-api-key')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204 as any)
  }
  await next()
}

/**
 * Secure headers middleware wrapping hono's secureHeaders.
 */
export const secureHeadersMiddleware = secureHeaders()

/**
 * IP-based rate limiting using Vercel KV.
 * Bypass rate limiting for CORS preflight (OPTIONS) requests.
 */
export async function rateLimitMiddleware(c: Context, next: Next) {
  if (c.req.method === 'OPTIONS') {
    return await next()
  }

  const path = c.req.path
  const isWebhook = path.includes('/tv-webhook')
  const isBroker = path.includes('/broker-') || path.includes('/connect-broker')
  const isMarket = path.includes('/yahoo-chart') || path.includes('/spot-price')
  const isVitals = path.includes('/vitals')
  const ip = getClientIp(c)
  const scope = isWebhook ? 'webhook' : isBroker ? 'broker' : isMarket ? 'market' : isVitals ? 'vitals' : 'api'
  const key = 'rl:' + scope + ':' + ip
  const limit = isWebhook ? 500 : isBroker ? 10 : isMarket ? 120 : isVitals ? 60 : 100
  const windowSeconds = 60

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
    return c.json({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' }, 429)
  }

  await next()
}

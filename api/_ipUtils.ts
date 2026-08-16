import { Context } from 'hono'

/**
 * Resolves the client IP from headers that the client cannot forge.
 *
 * Provenance is the whole problem here. Proxies *append* to `x-forwarded-for`,
 * so the leftmost entry is whatever the original caller chose to send — reading
 * it, or trusting a bare `x-real-ip`, lets any request pick its own rate-limit
 * bucket. This is the only abuse control on the unauthenticated endpoints, so
 * spoofing it makes /contact, /vitals and the market proxies unbounded.
 *
 * Order of preference:
 *   1. `x-vercel-forwarded-for` — set by Vercel's edge, which strips any
 *      client-supplied copy. Authoritative on this platform.
 *   2. Rightmost `x-forwarded-for` entry — the address our own trusted proxy
 *      observed, rather than the value the caller prepended.
 *   3. 'unknown' — its own bucket. Never 127.0.0.1, which would merge every
 *      header-less caller into whatever bucket local traffic uses.
 */
export function getClientIp(c: Context): string {
  const vercelForwarded = c.req.header('x-vercel-forwarded-for')
  if (vercelForwarded) {
    const first = vercelForwarded.split(',')[0]?.trim()
    if (first) return first
  }

  const xForwardedFor = c.req.header('x-forwarded-for')
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',').map((part) => part.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }

  return 'unknown'
}

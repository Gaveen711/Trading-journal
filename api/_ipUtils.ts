import { Context } from 'hono'

/**
 * Extracts client IP address securely from request headers.
 */
export function getClientIp(c: Context): string {
  const xRealIp = c.req.header('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }
  const xForwardedFor = c.req.header('x-forwarded-for')
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',')
    return parts[0].trim()
  }
  return '127.0.0.1'
}

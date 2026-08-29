import crypto from 'crypto'
import type { Context, MiddlewareHandler } from 'hono'

export type AdminErrorCategory =
  | 'session'
  | 'authorization'
  | 'not_found'
  | 'validation'
  | 'rate_limit'
  | 'backend'

export class AdminHttpError extends Error {
  status: number
  code: string

  constructor(status: number, message: string, code = defaultCode(status)) {
    super(message)
    this.name = 'AdminHttpError'
    this.status = status
    this.code = code
  }
}

function defaultCode(status: number): string {
  if (status === 401) return 'INVALID_SESSION'
  if (status === 403) return 'ACCESS_DENIED'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMITED'
  if (status >= 400 && status < 500) return 'INVALID_REQUEST'
  return 'BACKEND_ERROR'
}

export function categoryForStatus(status: number): AdminErrorCategory {
  if (status === 401) return 'session'
  if (status === 403) return 'authorization'
  if (status === 404) return 'not_found'
  if (status === 429) return 'rate_limit'
  if (status >= 400 && status < 500) return 'validation'
  return 'backend'
}

function validRequestId(value: string | undefined): string | null {
  const candidate = String(value || '').trim()
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(candidate) ? candidate : null
}

export function ensureRequestId(c: Context): string {
  const stored = (c as any).get?.('requestId')
  const requestId = validRequestId(stored)
    || validRequestId(c.req.header('x-request-id'))
    || crypto.randomUUID()
  ;(c as any).set?.('requestId', requestId)
  c.header('X-Request-Id', requestId)
  return requestId
}

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  ensureRequestId(c)
  await next()
}

export function adminErrorResponse(
  c: Context,
  status: number,
  code: string,
  message: string,
  category: AdminErrorCategory = categoryForStatus(status),
) {
  return c.json({
    error: {
      code,
      message,
      category,
      requestId: ensureRequestId(c),
    },
  }, status as any)
}

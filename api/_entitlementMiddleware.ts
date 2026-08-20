import type { Context, MiddlewareHandler } from 'hono'
// @ts-ignore
import { db as _db } from './_firebase.js'
import { getUidFromContext, isSyncAllowed, assertEmailVerified } from './_auth.js'

const db: any = _db

/**
 * Composable entitlement middleware (spec §3.5).
 *
 * Context keys the chain shares (set with c.set / read with c.get):
 *   'uid'           — string, set by requireAuth
 *   'userData'      — user doc data, set by withUserDoc
 *   'emailVerified' — boolean, set inside getUidFromContext (token claim)
 *
 * Stable error codes ('auth-required', 'email-unverified', 'pro-required')
 * exist so featureGate.js can route 403s to the pricing modal instead of a
 * generic toast — the message text stays per-route and human-facing.
 */

export type ProGateOptions = {
  error?: string
  message?: string
}

/**
 * Verifies the Bearer token and stores the uid on context. Delegates to
 * getUidFromContext so token handling (and the emailVerified claim capture
 * that assertEmailVerified depends on) has exactly one implementation.
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  try {
    const uid = await getUidFromContext(c)
    c.set('uid', uid)
  } catch (err: any) {
    // Verifier internals stay in the server log — the 401 body is uniform
    // across routes so error text can't leak token-validation details.
    console.error('[auth] verifyIdToken failed:', err?.message || err)
    return c.json({ error: 'Invalid or expired token', code: 'auth-required' }, 401)
  }
  await next()
}

/**
 * Fetches users/{uid} and stores its data on context. Requires requireAuth
 * to have run first.
 */
export const withUserDoc: MiddlewareHandler = async (c, next) => {
  const uid = String(c.get('uid'))
  let snap: any
  try {
    snap = await db.collection('users').doc(uid).get()
  } catch (err: any) {
    // Mirror handleRouteError's discipline: never log whole provider errors
    // (SDK errors may embed request details), never leak them to the client.
    console.error('[withUserDoc] Error', { name: err?.constructor?.name, code: err?.code })
    return c.json({ error: 'Internal Server Error', message: 'Database operation failed. Try again.' }, 500)
  }
  if (!snap.exists) {
    return c.json({ error: 'User not found' }, 404)
  }
  c.set('userData', snap.data() || {})
  await next()
}

/**
 * Enforces email verification via the shared assertEmailVerified — the
 * grandfathering rules (only requiresEmailVerification === true accounts are
 * gated) live there and only there. Requires withUserDoc to have run first.
 */
export const requireEmailVerified: MiddlewareHandler = async (c, next) => {
  const denied = assertEmailVerified(c, c.get('userData'))
  if (denied) return denied
  await next()
}

/**
 * Non-middleware Pro check for routes that gate per-action after parsing the
 * body (broker-login-sync). Returns the 403 Response, or null to proceed.
 * The message is per-route (existing copy preserved); the code is stable.
 */
export function assertPro(c: Context, options: ProGateOptions = {}): Response | null {
  if (isSyncAllowed(c.get('userData'))) return null
  const body: Record<string, string> = {
    error: options.error ?? 'Pro subscription required',
    code: 'pro-required',
  }
  if (options.message) body.message = options.message
  return c.json(body, 403 as any)
}

/**
 * Middleware form of assertPro for routes gated wholesale.
 */
export const requirePro = (options: ProGateOptions = {}): MiddlewareHandler => async (c, next) => {
  const denied = assertPro(c, options)
  if (denied) return denied
  await next()
}

/**
 * Convenience stack for the common chain: auth → user doc → email-verified →
 * Pro. Spread into a route registration:
 *   app.post('/x', ...requireProUser({ message: '…' }), handler)
 */
export const requireProUser = (
  options: ProGateOptions = {},
): [MiddlewareHandler, MiddlewareHandler, MiddlewareHandler, MiddlewareHandler] => [
  requireAuth,
  withUserDoc,
  requireEmailVerified,
  requirePro(options),
]

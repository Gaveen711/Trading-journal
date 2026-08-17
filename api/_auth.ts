import { Context } from 'hono'
// @ts-ignore
import { admin } from './_firebase.js'

import { hasPaidAccess } from '../src/lib/entitlements.js'

/**
 * Checks if a user is permitted to perform broker trade synchronization.
 *
 * Delegates to the shared entitlements predicate so the client and the API
 * can never disagree about who has paid access — the exact drift that used
 * to show Pro UI whose broker calls then 403'd.
 */
export function isSyncAllowed(userData: any): boolean {
  return hasPaidAccess(userData)
}

/**
 * Verifies the Bearer Authorization ID Token and returns the authenticated user's UID.
 * Throws an error if authentication fails.
 *
 * Also records whether the token's email is verified on the request context, so
 * a route can enforce verification (via assertEmailVerified) after it has
 * fetched the user document, without re-verifying the token.
 */
export async function getUidFromContext(c: Context): Promise<string> {
  const authHeader = c.req.header('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header')
  }
  const token = authHeader.substring(7)
  const decoded = await admin.auth().verifyIdToken(token)
  if (!decoded.uid) {
    throw new Error('UID missing from token claims')
  }
  ;(c as any).set('emailVerified', decoded.email_verified === true)
  return decoded.uid
}

/**
 * Whether unverified accounts are blocked from privileged (broker / API-key)
 * routes. Default ON.
 *
 * This is safe to leave on because verification is *required* only for accounts
 * that carry `requiresEmailVerification` — a flag /init-user sets on accounts
 * created after verification was introduced. Accounts that predate it never got
 * the flag, so they are grandfathered and cannot be locked out mid-subscription
 * — the exact failure that previously kept this control disabled. Set
 * REQUIRE_EMAIL_VERIFICATION=false to disable entirely.
 */
export function isEmailVerificationEnforced(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION !== 'false'
}

/**
 * Returns a 403 response when the account must verify its email and has not,
 * or null when the request may proceed.
 *
 * Grandfathering is the whole point: only accounts with requiresEmailVerification
 * === true are gated. That flag is server-written (by /init-user) and absent
 * from the client rules allowlist, so a browser cannot clear it to dodge the
 * check, and legacy accounts never carry it. Google sign-ins satisfy the check
 * outright — Google returns email_verified true.
 */
export function assertEmailVerified(c: Context, userData: any): Response | null {
  if (!isEmailVerificationEnforced()) return null
  if (!userData || userData.requiresEmailVerification !== true) return null // grandfathered
  if ((c as any).get('emailVerified') === true) return null
  return c.json({
    error: 'Email verification required',
    message: 'Verify your email to connect or sync a broker. We sent a link when you signed up — check your inbox, or resend it from Settings.',
    code: 'email-unverified',
  }, 403 as any)
}

/**
 * Verifies a token directly (useful for custom flows like email alerts).
 */
export async function verifyIdToken(token: string): Promise<any> {
  return await admin.auth().verifyIdToken(token)
}

import { Context } from 'hono'
// @ts-ignore
import { admin } from './_firebase.js'

/**
 * Checks if a user is permitted to perform broker trade synchronization.
 * Supports both standard 'pro' and active 'grace' plan states.
 */
export function isSyncAllowed(userData: any): boolean {
  const { plan, planExpiry, graceUntil } = userData || {}

  if (plan === 'pro' || plan === 'grace') {
    // If Pro and no expiry (infinite/lifetime), allowed
    if (plan === 'pro' && !planExpiry) return true

    // Check if the plan is active based on expiry date
    if (planExpiry) {
      const expiry = new Date(planExpiry)
      if (expiry.getTime() > Date.now()) return true
    }

    // Check if within grace period
    if (graceUntil) {
      const grace = new Date(graceUntil)
      if (grace.getTime() > Date.now()) return true
    }
  }

  return false
}

/**
 * Verifies the Bearer Authorization ID Token and returns the authenticated user's UID.
 * Throws an error if authentication fails.
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
  return decoded.uid
}

/**
 * Verifies a token directly (useful for custom flows like email alerts).
 */
export async function verifyIdToken(token: string): Promise<any> {
  return await admin.auth().verifyIdToken(token)
}

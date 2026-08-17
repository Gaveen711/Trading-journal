/**
 * Single source of truth for paid access.
 *
 * Imported by BOTH the client (useSubscription, featureGate, page gates) and
 * the server (api/_auth.ts re-exports hasPaidAccess as isSyncAllowed), the
 * same way api modules already import tradeAnalytics.js. Semantics are the
 * server's: plan 'pro' | 'grace', honoring planExpiry and the server-written
 * graceUntil. No client-side synthetic grace windows.
 */
export function hasPaidAccess(userData, nowMs = Date.now()) {
  const { plan, planExpiry, graceUntil } = userData || {};
  if (plan !== 'pro' && plan !== 'grace') return false;
  if (plan === 'pro' && !planExpiry) return true; // lifetime pro
  if (planExpiry && new Date(planExpiry).getTime() > nowMs) return true;
  if (graceUntil && new Date(graceUntil).getTime() > nowMs) return true;
  return false;
}

/**
 * String-level check for UI gates that only receive the plan value published
 * by useSubscription. That plan is already expiry-validated (useSubscription
 * downgrades lapsed accounts to 'free' via hasPaidAccess), so 'pro' and
 * 'grace' can be trusted here. For RAW user documents, always use
 * hasPaidAccess — a raw doc's plan string may be stale.
 */
export function isPaidPlan(plan) {
  return plan === 'pro' || plan === 'grace';
}

/**
 * UI affordances derived in one place, so every gate agrees. Grace users get
 * the same paid affordances as pro — the grace state exists to avoid cutting
 * a paying customer off mid-billing-hiccup, not to degrade the product.
 */
export function getEntitlements(userData, nowMs = Date.now()) {
  const isPaid = hasPaidAccess(userData, nowMs);
  return {
    isPaid,
    canSyncBroker: isPaid,
    canExportCsv: isPaid,
    canUseApiKeys: isPaid,
    isGrace:
      userData?.plan === 'grace' ||
      (isPaid && !!userData?.graceUntil && new Date(userData.graceUntil).getTime() > nowMs),
  };
}

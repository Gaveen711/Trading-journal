import { isPaidPlan } from '../lib/entitlements.js';

export function isProPlan(plan) {
  return isPaidPlan(plan);
}

export function getRemainingFreeTrades() {
  return Number.POSITIVE_INFINITY;
}


/**
 * Submits a trade using the provided addTrade function.
 * Free users can log unlimited manual trades; Pro remains required for automation.
 */
export async function submitTrade({ addTrade, tradeData }) {
  if (!addTrade) throw new Error('addTrade not provided');
  return addTrade(tradeData);
}

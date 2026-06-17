import { FREE_TRADE_LIMIT, TRADE_LOCK_LOCALSTORAGE_KEY, TRADE_LOCK_DURATION_MS } from '../config/tradeConfig';

export function isProPlan(plan) {
  return plan === 'pro' || plan === 'grace';
}

export function getRemainingFreeTrades(trades = []) {
  const totalTrades = trades ? trades.length : 0;
  return Math.max(0, FREE_TRADE_LIMIT - totalTrades);
}

/**
 * Submits a trade using the provided addTrade function and applies
 * client-side lock behavior for free users when the free limit is reached.
 * Returns the result of addTrade or throws the error.
 */
export async function submitTrade({ addTrade, tradeData, plan, trades }) {
  if (!addTrade) throw new Error('addTrade not provided');

  const result = await addTrade(tradeData);

  // After successful submission, if user is free and reached limit, set lock timestamp
  const totalTradesCount = trades ? trades.length : 0;
  if (!isProPlan(plan) && totalTradesCount >= FREE_TRADE_LIMIT) {
    const oneHourFromNow = Date.now() + TRADE_LOCK_DURATION_MS;
    try {
      localStorage.setItem(TRADE_LOCK_LOCALSTORAGE_KEY, String(oneHourFromNow));
    } catch (err) {
      // ignore localStorage errors (e.g., in private mode)
      console.warn('Could not persist trade lock timestamp:', err?.message || err);
    }
  }

  return result;
}

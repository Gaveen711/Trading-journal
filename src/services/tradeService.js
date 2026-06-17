import { FREE_TRADE_LIMIT, TRADE_LOCK_LOCALSTORAGE_KEY, TRADE_LOCK_DURATION_MS } from '../config/tradeConfig';

export function isProPlan(plan) {
  return plan === 'pro' || plan === 'grace';
}

export function getRemainingFreeTrades(trades = []) {
  const totalTrades = trades ? trades.length : 0;
  return Math.max(0, FREE_TRADE_LIMIT - totalTrades);
}

/**
 * Returns the number of ms remaining on the 30-day reset lock.
 * Returns 0 if no lock is active or the lock has expired.
 */
export function getLockMsRemaining() {
  try {
    const target = localStorage.getItem(TRADE_LOCK_LOCALSTORAGE_KEY);
    if (!target) return 0;
    const remaining = Number(target) - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(TRADE_LOCK_LOCALSTORAGE_KEY);
      return 0;
    }
    return remaining;
  } catch {
    return 0;
  }
}

/**
 * Formats ms remaining into a human-readable HH:MM:SS string.
 * Used for the 1-hour reset countdown.
 */
export function formatLockCountdown(ms) {
  if (ms <= 0) return '';
  const totalSecs = Math.floor(ms / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

/**
 * Submits a trade using the provided addTrade function and applies
 * client-side lock behavior for free users when the free limit is reached.
 * Returns the result of addTrade or throws the error.
 */
export async function submitTrade({ addTrade, tradeData, plan, trades }) {
  if (!addTrade) throw new Error('addTrade not provided');

  const result = await addTrade(tradeData);

  // After successful submission, if user is free and has now reached the limit,
  // set a 30-day reset timestamp so they must wait before logging more trades.
  const totalTradesCount = trades ? trades.length : 0;
  if (!isProPlan(plan) && totalTradesCount >= FREE_TRADE_LIMIT) {
    const thirtyDaysFromNow = Date.now() + TRADE_LOCK_DURATION_MS;
    try {
      localStorage.setItem(TRADE_LOCK_LOCALSTORAGE_KEY, String(thirtyDaysFromNow));
    } catch (err) {
      // ignore localStorage errors (e.g., in private mode)
      console.warn('Could not persist trade lock timestamp:', err?.message || err);
    }
  }

  return result;
}

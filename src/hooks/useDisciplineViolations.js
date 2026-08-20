// Discipline flags for the loaded trade window. Pure derivation — no listener,
// no write, nothing stored: violations are computed on read by design (a stored
// flag would survive a threshold edit and be wrong).
import { useMemo } from 'react';
import { evaluateRules, tradeDayKey, violationsByTradeId } from '../lib/disciplineRules.js';

const EMPTY_TRADES = Object.freeze([]);

/**
 * The earliest calendar day present in the loaded window.
 *
 * Computed by scanning, not by reading the last element: the paged query orders
 * by the `date` field, so a doc with no date at all sorts unpredictably and
 * would otherwise be mistaken for the boundary day. Dateless trades have no day
 * to be truncated on and are skipped here.
 */
function earliestDayKey(trades) {
  let earliest = null;
  for (const trade of trades) {
    const dayKey = tradeDayKey(trade);
    if (!dayKey) continue;
    if (earliest === null || dayKey < earliest) earliest = dayKey;
  }
  return earliest;
}

/**
 * Violations over COMPLETE days only.
 *
 * `subscribeToTrades` pages at 100 docs ordered by date desc, so while
 * `hasMore` is true the earliest loaded day holds an arbitrary subset of that
 * day's trades. Every rule here is order- and count-sensitive: judged on a
 * partial day, "4th trade of 3 allowed" is not merely early, it is wrong, and
 * it would silently renumber when the user clicks "Load more trades". So that
 * day is excluded from evaluation entirely and named in `indeterminateDayKey`
 * — its rows render `—` (indeterminate), never a chip.
 *
 * The residual: the revenge-window rule looks backwards across midnight, so a
 * cooldown opened by a loss on the truncated day cannot flag the first trades
 * of the day after it until that day finishes loading. Flags only ever appear
 * as more history arrives, never disappear.
 *
 * @param {{trades?: object[], hasMore?: boolean, rules?: object, accountBalance?: number}} input
 * @returns {{violations: object[], byTradeId: Map<string, object[]>, indeterminateDayKey: string|null}}
 */
export function useDisciplineViolations({ trades, hasMore, rules, accountBalance } = {}) {
  const tradeList = Array.isArray(trades) ? trades : EMPTY_TRADES;

  const indeterminateDayKey = useMemo(
    () => (hasMore ? earliestDayKey(tradeList) : null),
    [hasMore, tradeList],
  );

  const violations = useMemo(() => {
    const complete = indeterminateDayKey === null
      ? tradeList
      : tradeList.filter((trade) => tradeDayKey(trade) !== indeterminateDayKey);
    return evaluateRules(complete, rules, { accountBalance });
  }, [accountBalance, indeterminateDayKey, rules, tradeList]);

  const byTradeId = useMemo(() => violationsByTradeId(violations), [violations]);

  return { violations, byTradeId, indeterminateDayKey };
}

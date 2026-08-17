/**
 * The XAUUSD contract, defined once.
 *
 * Consumed by the client (Trade entity, tradeUtils, tradeAnalytics) AND the
 * server (api/_tradeService.ts, api/_metaapi-broker.js) through the same
 * api → src/lib import lane tradeAnalytics.js established.
 *
 * firestore.rules cannot import JS — its expectedPnl check mirrors
 * XAUUSD_OZ_PER_LOT; if you change a constant here, update the rules formula
 * in the same commit.
 */
export const XAUUSD_OZ_PER_LOT = 100; // ounces per 1.0 standard lot
export const XAUUSD_PIP_SIZE = 0.1;   // 1 pip = $0.10 price move
export const OUTCOME_EPSILON = 0.01;  // |netPnl| ≤ this is a break-even trade

/**
 * Pips from a price move, one decimal. Sign follows the sign of `priceDiff`
 * (callers pass an absolute move where display should always be positive).
 * The server paths used to round to integers while the client kept one
 * decimal — this is the single rule now.
 */
export function computePips(priceDiff) {
  // Explicit empty checks first: Number(null) coerces to 0, which would
  // silently turn "no price data" into "0 pips".
  if (priceDiff === null || priceDiff === undefined || priceDiff === '') return null;
  const diff = Number(priceDiff);
  if (!Number.isFinite(diff)) return null;
  return parseFloat((diff / XAUUSD_PIP_SIZE).toFixed(1));
}

/** WIN/LOSS/BE from net P&L, using the shared break-even band. */
export function outcomeForPnl(netPnl) {
  const value = Number(netPnl) || 0;
  return value > OUTCOME_EPSILON ? 'WIN' : value < -OUTCOME_EPSILON ? 'LOSS' : 'BE';
}

/**
 * Broker accounts can contain deals for any symbol; gold math only applies
 * to gold. Non-gold deals must not get gold pip values.
 */
export function isGoldSymbol(symbol) {
  return String(symbol || '').toUpperCase().startsWith('XAU');
}

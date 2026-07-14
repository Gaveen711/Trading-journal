export const ANALYTICS_VERSION = 2;

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Returns canonical strategy tags across current and legacy trade schemas. */
export function getTradeStrategyTags(trade) {
  if (!trade) return [];
  const source = Array.isArray(trade.strategies) && trade.strategies.length
    ? trade.strategies
    : trade.strategy
      ? [trade.strategy]
      : trade.setup
        ? [trade.setup]
        : [];
  return [...new Set(source.map((tag) => String(tag).trim()).filter(Boolean))];
}

/** Net P&L is preferred for broker trades; manual trades fall back to P&L. */
export function tradePnlValue(trade) {
  return number(trade?.netPnl ?? trade?.pnl);
}

/** Uses stored outcome when present and derives it for older broker records. */
export function getTradeOutcome(trade) {
  const provided = String(trade?.outcome || '').toUpperCase();
  if (['WIN', 'LOSS', 'BE'].includes(provided)) return provided;
  const pnl = tradePnlValue(trade);
  return pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE';
}
const emptyDelta = () => ({
  tradeCount: 0, totalPnl: 0, totalPips: 0, wins: 0, losses: 0,
  breakEven: 0, longs: 0, shorts: 0, grossProfit: 0, grossLoss: 0,
});

export function emptyTradeAnalytics() {
  return { version: ANALYTICS_VERSION, ...emptyDelta() };
}

export function isTradeAnalyticsEligible(trade) {
  if (!trade) return false;
  return String(trade.status || '').toLowerCase() !== 'open';
}

export function tradeAnalyticsDelta(trade, multiplier = 1) {
  const delta = emptyDelta();
  if (!isTradeAnalyticsEligible(trade)) return delta;
  const pnl = tradePnlValue(trade);
  const inferredOutcome = pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE';
  const providedOutcome = String(trade.outcome || '').toUpperCase();
  const outcome = ['WIN', 'LOSS', 'BE'].includes(providedOutcome) ? providedOutcome : inferredOutcome;
  const direction = String(trade.direction || trade.type || '').toUpperCase();
  const isLong = direction === 'BUY' || direction === 'LONG';
  const isShort = direction === 'SELL' || direction === 'SHORT';
  delta.tradeCount = multiplier;
  delta.totalPnl = pnl * multiplier;
  delta.totalPips = number(trade.pips) * multiplier;
  delta.wins = (outcome === 'WIN' ? 1 : 0) * multiplier;
  delta.losses = (outcome === 'LOSS' ? 1 : 0) * multiplier;
  delta.breakEven = (outcome === 'BE' ? 1 : 0) * multiplier;
  delta.longs = (isLong ? 1 : 0) * multiplier;
  delta.shorts = (isShort ? 1 : 0) * multiplier;
  delta.grossProfit = (pnl > 0 ? pnl : 0) * multiplier;
  delta.grossLoss = (pnl < 0 ? Math.abs(pnl) : 0) * multiplier;
  return delta;
}

export function subtractTradeAnalytics(previous, next) {
  const before = tradeAnalyticsDelta(previous);
  const after = tradeAnalyticsDelta(next);
  return Object.fromEntries(Object.keys(after).map((key) => [key, after[key] - before[key]]));
}

export function analyticsDeltaForTrades(trades) {
  return trades.reduce((total, trade) => {
    const delta = tradeAnalyticsDelta(trade);
    Object.keys(total).forEach((key) => { total[key] += delta[key]; });
    return total;
  }, emptyDelta());
}

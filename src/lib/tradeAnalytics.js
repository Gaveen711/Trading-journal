const number = (value) => Number(value) || 0;

export function tradeAnalyticsDelta(trade, multiplier = 1) {
  const outcome = String(trade?.outcome || '').toUpperCase();
  const direction = String(trade?.direction || '').toUpperCase();
  const pnl = number(trade?.netPnl ?? trade?.pnl);
  return {
    tradeCount: multiplier, totalPnl: pnl * multiplier, totalPips: number(trade?.pips) * multiplier,
    wins: (outcome === 'WIN' ? 1 : 0) * multiplier,
    losses: (outcome === 'LOSS' ? 1 : 0) * multiplier,
    breakEven: (outcome === 'BE' ? 1 : 0) * multiplier,
    longs: (direction === 'BUY' ? 1 : 0) * multiplier,
    shorts: (direction === 'SELL' ? 1 : 0) * multiplier,
    grossProfit: (pnl > 0 ? pnl : 0) * multiplier,
    grossLoss: (pnl < 0 ? Math.abs(pnl) : 0) * multiplier,
  };
}

export function subtractTradeAnalytics(previous, next) {
  const before = tradeAnalyticsDelta(previous);
  const after = tradeAnalyticsDelta(next);
  return Object.fromEntries(Object.keys(after).map((key) => [key, after[key] - before[key]]));
}
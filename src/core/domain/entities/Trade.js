const XAUUSD_CONTRACT_SIZE = 100;
const XAUUSD_PIP_SIZE = 0.01;

export class TradeEntity {
  static calcPnl(entry, exit, lots, actualPnl, sl, tp, dir = null, swap = 0) {
    if (!entry || !exit || !dir) return { pnl: null, rr: null, pips: null };

    const swapNum = Number(swap) || 0;
    const diff = dir === 'BUY' ? exit - entry : entry - exit;
    const absDiff = Math.abs(exit - entry);
    const pips = parseFloat((absDiff / XAUUSD_PIP_SIZE).toFixed(1));

    // If actual broker P&L is provided, trust it directly
    let pnl;
    if (actualPnl !== null && actualPnl !== undefined && !isNaN(actualPnl) && actualPnl !== 0) {
      pnl = parseFloat(actualPnl) + swapNum;
    } else if (lots && !isNaN(lots) && lots > 0) {
      pnl = (diff * lots * XAUUSD_CONTRACT_SIZE) + swapNum;
    } else {
      return { pnl: null, rr: null, pips };
    }

    let rr = null;
    if (sl && tp) {
      const risk = Math.abs(dir === 'BUY' ? entry - sl : sl - entry);
      const reward = Math.abs(dir === 'BUY' ? tp - entry : entry - tp);
      if (risk > 0) rr = parseFloat((reward / risk).toFixed(2));
    }

    return {
      pnl: parseFloat(pnl.toFixed(2)),
      rr,
      pips,
      swap: parseFloat(swapNum.toFixed(2))
    };
  }

  static validate(tradeData) {
    if (!tradeData.date || !tradeData.direction || isNaN(tradeData.entry) || isNaN(tradeData.exit) || isNaN(tradeData.lots)) {
      throw new Error('Please complete all required fields.');
    }
    if (tradeData.note && typeof tradeData.note === 'string' && tradeData.note.length > 4000) {
      throw new Error('Note exceeds maximum length of 4000 characters.');
    }
  }
}

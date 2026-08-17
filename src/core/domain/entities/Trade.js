// Gold (XAUUSD) math. Constants and pip/outcome rules live in one shared
// module (src/lib/goldContract.js) used by client and server alike; only
// firestore.rules still mirrors the PnL formula by hand.
import { XAUUSD_OZ_PER_LOT, computePips } from '../../../lib/goldContract.js';

export class TradeEntity {
  static calcPnl(entry, exit, lots, actualPnl, sl, tp, dir = null, swap = 0) {
    if (!entry || !exit || !dir) return { pnl: null, rr: null, pips: null };

    const swapNum = Number(swap) || 0;
    const diff = dir === 'BUY' ? exit - entry : entry - exit;
    const absDiff = Math.abs(exit - entry);

    // Pips: price move / pip size (e.g. $5.00 / $0.10 = 50 pips).
    // Absolute on purpose — manually logged trades display pips unsigned.
    const pips = computePips(absDiff);

    // If actual broker P&L is provided, trust it directly
    let pnl;
    if (actualPnl !== null && actualPnl !== undefined && !isNaN(actualPnl) && actualPnl !== 0) {
      pnl = parseFloat(actualPnl) + swapNum;
    } else if (lots && !isNaN(lots) && lots > 0) {
      // PnL = price_move × ounces  (ounces = lots × 100)
      pnl = (diff * lots * XAUUSD_OZ_PER_LOT) + swapNum;
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

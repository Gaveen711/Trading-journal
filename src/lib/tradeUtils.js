import { OUTCOME_EPSILON, XAUUSD_OZ_PER_LOT, computePips } from './goldContract.js';

export const pad2 = n => String(n).padStart(2, '0');

/**
 * The only sanctioned P&L color rule, on the same break-even band as the
 * stored WIN/LOSS/BE outcome — so color always agrees with the ledger.
 * Pass { zero } to override the neutral class (the trade form dims zeros).
 */
export const pnlToneClass = (value, { zero = 'text-foreground' } = {}) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return zero;
  if (num > OUTCOME_EPSILON) return 'text-win';
  if (num < -OUTCOME_EPSILON) return 'text-loss';
  return zero;
};

/**
 * One coercion ladder for every timestamp shape this app stores or caches:
 * Firestore Timestamp (.toDate), Date, ISO string, epoch millis, and the
 * serialized {seconds} form that survives JSON round-trips.
 */
export const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toMillis = (value) => toDate(value)?.getTime() ?? null;
export const toIsoString = (value) => toDate(value)?.toISOString() ?? null;

export const todayStr = () => {
  const today = new Date();
  return `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
};

export const formatNumber = (val, decimals = 2) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return '—';
  const num = Number(val);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCurrency = (val, showPlusSign = false, decimals = 2) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return '—';
  const num = Number(val);
  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  if (num < 0) {
    return `-$${formatted}`;
  }
  if (num > 0 && showPlusSign) {
    return `+$${formatted}`;
  }
  return `$${formatted}`;
};

// Signed currency for Console figures: always-signed, U+2212 minus (aligns in
// tabular-nums where ASCII hyphen does not), em dash for missing data.
export const formatSigned = (val, decimals = 2) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return '—';
  const num = Number(val);
  if (num === 0) return formatCurrency(0, false, decimals);
  const abs = formatCurrency(Math.abs(num), false, decimals);
  return num > 0 ? `+${abs}` : `−${abs}`;
};

export const formatPrice = (val) => {
  if (val === null || val === undefined || isNaN(val) || val === '') return '—';
  const num = Number(val);
  const parts = String(val).split('.');
  const decimals = parts.length > 1 ? parts[1].length : 2;
  const finalDecimals = Math.min(Math.max(decimals, 2), 5);
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: finalDecimals,
    maximumFractionDigits: finalDecimals
  });
};

export const formatCompact = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  
  if (absVal >= 1000000) {
    return sign + (absVal / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (absVal >= 10000) {
    return sign + (absVal / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  const formattedAbs = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/\.00$/, '');
  return sign + formattedAbs;
};

export const formatCurrencyCompact = (val) => {
  const formatted = formatCompact(val);
  if (formatted === '—') return '—';
  if (formatted.startsWith('-')) {
    return `-$${formatted.substring(1)}`;
  }
  return `$${formatted}`;
};

// Compact currency with the Console sign treatment: always-signed, U+2212
// minus (formatCurrencyCompact alone renders an ASCII hyphen, no plus).
export const formatSignedCompact = (val) => {
  if (val > 0) return `+${formatCurrencyCompact(val)}`;
  if (val < 0) return `−${formatCurrencyCompact(Math.abs(val))}`;
  return formatCurrencyCompact(val);
};

// Signed plain number (no currency symbol): always-signed, U+2212 minus,
// em dash for missing. For measurements like pips that are not P&L.
export const formatSignedNumber = (val, decimals) => {
  const num = Number(val);
  if (val === null || val === undefined || val === '' || isNaN(num)) return '—';
  const options =
    decimals !== undefined
      ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
      : undefined;
  const abs = Math.abs(num).toLocaleString('en-US', options);
  if (num > 0) return `+${abs}`;
  if (num < 0) return `−${abs}`;
  return abs;
};

// ─── XAUUSD (Gold) Trading Math ─────────────────────────────────────────────
//
//  Gold is traded in OUNCES via lots:
//    1.0  lot  = 100 oz   ·  $1 price move = $100 profit/loss
//    0.10 lot  =  10 oz   ·  $1 price move = $10  profit/loss
//    0.01 lot  =   1 oz   ·  $1 price move = $1   profit/loss
//
//  Formula:  PnL = price_move ($) × ounces_traded
//                = price_move × (lots × 100)
//
//  Points / Pips display:
//    Brokers quote Gold to 2 decimal places (e.g. 2600.00).
//    1 point = $0.01 price move  →  points = price_move / 0.01
//    Example: $5.00 move  = 500 points
//             $25.00 move = 2500 points
//
//  Verification (from screenshot — 0.01 lot, $25 move):
//    ounces = 0.01 × 100 = 1 oz
//    PnL    = $25 × 1 oz = $25  ✓
//    points = $25 / $0.01 = 2500 pts  ✓

export const calcPnl = (entry, exit, lots, actualPnl, sl, tp, dir = null, swap = 0) => {
  if (!entry || !exit || !dir) return { pnl: null, rr: null, pips: null };

  const swapNum = Number(swap) || 0;
  const diff    = dir === 'BUY' ? exit - entry : entry - exit;

  // Pips (displayed in the UI): price move / pip size
  // e.g. $25.00 move → 25 / 0.1 = 250 pips
  const pips = computePips(diff);

  // If actual broker P&L is provided, trust it directly
  let pnl;
  if (actualPnl !== null && actualPnl !== undefined && !isNaN(actualPnl) && actualPnl !== 0) {
    pnl = parseFloat(actualPnl) + swapNum;
  } else if (lots && !isNaN(lots) && lots > 0) {
    // PnL = price_move × ounces_traded
    // ounces = lots × 100  →  PnL = diff × lots × 100
    const ounces = lots * XAUUSD_OZ_PER_LOT;
    pnl = (diff * ounces) + swapNum;
  } else {
    return { pnl: null, rr: null, pips };
  }

  let rr = null;
  if (sl && tp) {
    const risk   = Math.abs(dir === 'BUY' ? entry - sl : sl - entry);
    const reward = Math.abs(dir === 'BUY' ? tp - entry : entry - tp);
    if (risk > 0) rr = parseFloat((reward / risk).toFixed(2));
  }

  return {
    pnl:  parseFloat(pnl.toFixed(2)),
    rr,
    pips,
    swap: parseFloat(swapNum.toFixed(2))
  };
};

export const storage = {
  async get(key, defaultValue = null) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : defaultValue;
    } catch { return defaultValue; }
  },
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  },
  async remove(key) {
    localStorage.removeItem(key);
    return true;
  }
};


export const pad2 = n => String(n).padStart(2, '0');

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

// XAUUSD only: 1 pip = $1.00 per 1.00 lot (contract size 100, pip size 0.1)
const XAUUSD_CONTRACT_SIZE = 100;
const XAUUSD_PIP_SIZE      = 0.1;

export const calcPnl = (entry, exit, lots, actualPnl, sl, tp, dir = null, swap = 0) => {
  if (!entry || !exit || !dir) return { pnl: null, rr: null, pips: null };

  const swapNum = Number(swap) || 0;
  const diff    = dir === 'BUY' ? exit - entry : entry - exit;
  const pips    = parseFloat((diff / XAUUSD_PIP_SIZE).toFixed(1));

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


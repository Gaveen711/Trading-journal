import { describe, it, expect } from 'vitest';
import { calcPnl, formatNumber, formatCurrency, formatPrice, formatCompact } from './tradeUtils';

describe('Trade Logic (calcPnl)', () => {
  it('calculates correct P&L for a BUY trade (diff * lots * 100)', () => {
    // BUY 1 lot at 2000, exit at 2010. Diff = 10.
    // PNL = 10 * 1 * 100 = 1000
    const result = calcPnl(2000, 2010, 1, null, null, null, 'BUY');
    expect(result.pnl).toBe(1000);
    expect(result.pips).toBe(1000); // (2010 - 2000) / 0.01 = 10 / 0.01 = 1000
  });

  it('calculates correct P&L for a SELL trade (diff * lots * 100)', () => {
    // SELL 0.5 lot at 2010, exit at 2000. Diff = 10.
    // PNL = 10 * 0.5 * 100 = 500
    const result = calcPnl(2010, 2000, 0.5, null, null, null, 'SELL');
    expect(result.pnl).toBe(500);
    expect(result.pips).toBe(1000); // (2010 - 2000) / 0.01 = 10 / 0.01 = 1000
  });

  it('calculates correct P&L for a losing BUY trade', () => {
    // BUY 2 lots at 2010, exit at 2000. Diff = -10.
    // PNL = -10 * 2 * 100 = -2000
    const result = calcPnl(2010, 2000, 2, null, null, null, 'BUY');
    expect(result.pnl).toBe(-2000);
    expect(result.pips).toBe(1000); 
  });

  it('calculates correct P&L with swap applied', () => {
    // BUY 1 lot at 2000, exit at 2010. Diff = 10. Swap = -5
    // PNL = (10 * 1 * 100) + (-5) = 995
    const result = calcPnl(2000, 2010, 1, null, null, null, 'BUY', -5);
    expect(result.pnl).toBe(995);
    expect(result.swap).toBe(-5);
  });

  it('trusts actual broker PNL if provided over calculation', () => {
    // Even if diff is large, if actual broker PNL is given, use it + swap
    const result = calcPnl(2000, 2010, 1, 950, null, null, 'BUY', -10);
    expect(result.pnl).toBe(940); // 950 + -10
  });

  it('calculates Risk:Reward ratio correctly', () => {
    // BUY at 2000. SL at 1990 (Risk = 10). TP at 2020 (Reward = 20).
    // RR = 20 / 10 = 2.0
    const result = calcPnl(2000, 2010, 1, null, 1990, 2020, 'BUY');
    expect(result.rr).toBe(2);
  });
});

describe('Formatting Utilities', () => {
  describe('formatNumber', () => {
    it('formats numbers with thousands separators and default decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(1234567.89)).toBe('1,234,567.89');
      expect(formatNumber(99.9, 0)).toBe('100');
      expect(formatNumber(1234.5, 3)).toBe('1,234.500');
    });

    it('returns em-dash for null, undefined, NaN, and empty string', () => {
      expect(formatNumber(null)).toBe('—');
      expect(formatNumber(undefined)).toBe('—');
      expect(formatNumber(NaN)).toBe('—');
      expect(formatNumber('')).toBe('—');
    });
  });

  describe('formatCurrency', () => {
    it('formats currencies with dollar sign and commas', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('displays plus sign when showPlusSign is true and value > 0', () => {
      expect(formatCurrency(1234.56, true)).toBe('+$1,234.56');
      expect(formatCurrency(-1234.56, true)).toBe('-$1,234.56');
      expect(formatCurrency(0, true)).toBe('$0.00');
    });

    it('returns em-dash for invalid input', () => {
      expect(formatCurrency(null)).toBe('—');
    });
  });

  describe('formatPrice', () => {
    it('formats prices with commas and keeps correct precision (2 to 5 decimals)', () => {
      expect(formatPrice(2000.5)).toBe('2,000.50');
      expect(formatPrice(2000)).toBe('2,000.00');
      expect(formatPrice(2000.123)).toBe('2,000.123');
      expect(formatPrice(2000.123456)).toBe('2,000.12346');
    });
  });

  describe('formatCompact', () => {
    it('abbreviates values >= 10,000', () => {
      expect(formatCompact(1500000)).toBe('1.5m');
      expect(formatCompact(-1500000)).toBe('-1.5m');
      expect(formatCompact(25000)).toBe('25k');
    });

    it('uses thousands separators for values < 10,000', () => {
      expect(formatCompact(9999.5)).toBe('9,999.50');
      expect(formatCompact(9999)).toBe('9,999');
      expect(formatCompact(-9999)).toBe('-9,999');
      expect(formatCompact(123)).toBe('123');
    });
  });
});


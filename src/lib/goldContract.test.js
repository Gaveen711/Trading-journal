import { describe, expect, it } from 'vitest';
import { computePips, isGoldSymbol, outcomeForPnl, OUTCOME_EPSILON } from './goldContract.js';

describe('computePips', () => {
  it('converts a price move to pips at one decimal', () => {
    expect(computePips(25)).toBe(250);
    expect(computePips(0.25)).toBe(2.5);
    expect(computePips(-1.55)).toBe(-15.5);
  });

  it('returns null for non-numeric input', () => {
    expect(computePips(null)).toBeNull();
    expect(computePips(undefined)).toBeNull();
    expect(computePips('not a number')).toBeNull();
  });
});

describe('outcomeForPnl', () => {
  it('classifies around the shared break-even band', () => {
    expect(outcomeForPnl(5)).toBe('WIN');
    expect(outcomeForPnl(-5)).toBe('LOSS');
    expect(outcomeForPnl(0)).toBe('BE');
    expect(outcomeForPnl(OUTCOME_EPSILON)).toBe('BE');
    expect(outcomeForPnl(-OUTCOME_EPSILON)).toBe('BE');
    expect(outcomeForPnl(OUTCOME_EPSILON + 0.001)).toBe('WIN');
  });

  it('treats non-numeric input as break-even, matching the old inline checks', () => {
    expect(outcomeForPnl(undefined)).toBe('BE');
    expect(outcomeForPnl(null)).toBe('BE');
  });
});

describe('isGoldSymbol', () => {
  it('accepts XAU pairs in any casing and rejects everything else', () => {
    expect(isGoldSymbol('XAUUSD')).toBe(true);
    expect(isGoldSymbol('xauusd')).toBe(true);
    expect(isGoldSymbol('XAUUSD.m')).toBe(true);
    expect(isGoldSymbol('EURUSD')).toBe(false);
    expect(isGoldSymbol('')).toBe(false);
    expect(isGoldSymbol(null)).toBe(false);
  });
});

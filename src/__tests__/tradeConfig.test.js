import { describe, it, expect } from 'vitest';
import { FREE_TRADE_LIMIT } from '../config/tradeConfig';

describe('tradeConfig', () => {
  it('exports FREE_TRADE_LIMIT as a number', () => {
    expect(typeof FREE_TRADE_LIMIT).toBe('number');
    expect(FREE_TRADE_LIMIT).toBeGreaterThan(0);
  });
});

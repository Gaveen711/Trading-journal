import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRemainingFreeTrades, submitTrade, isProPlan } from '../services/tradeService';
import { FREE_TRADE_LIMIT } from '../config/tradeConfig';

beforeEach(() => {
  // reset localStorage mock
  globalThis.localStorage = {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn()
  };
});

describe('tradeService', () => {
  it('calculates remaining free trades', () => {
    expect(getRemainingFreeTrades([])).toBe(FREE_TRADE_LIMIT);
    expect(getRemainingFreeTrades(new Array(5))).toBe(FREE_TRADE_LIMIT - 5);
  });

  it('identifies pro plans', () => {
    expect(isProPlan('pro')).toBe(true);
    expect(isProPlan('grace')).toBe(true);
    expect(isProPlan('free')).toBe(false);
  });

  it('submits trade and sets lock for free users when limit reached', async () => {
    const addTrade = vi.fn().mockResolvedValue({ id: 't1' });
    const trades = new Array(FREE_TRADE_LIMIT);
    const plan = 'free';
    const tradeData = { foo: 'bar' };

    const res = await submitTrade({ addTrade, tradeData, plan, trades });
    expect(addTrade).toHaveBeenCalledWith(tradeData);
    expect(globalThis.localStorage.setItem).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it('does not set lock for pro users', async () => {
    const addTrade = vi.fn().mockResolvedValue({ id: 't2' });
    const trades = new Array(FREE_TRADE_LIMIT + 1);
    const plan = 'pro';
    const tradeData = { foo: 'baz' };

    const res = await submitTrade({ addTrade, tradeData, plan, trades });
    expect(addTrade).toHaveBeenCalledWith(tradeData);
    expect(globalThis.localStorage.setItem).not.toHaveBeenCalled();
    expect(res).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRemainingFreeTrades, submitTrade, isProPlan } from '../services/tradeService';

beforeEach(() => {
  globalThis.localStorage = {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn()
  };
});

describe('tradeService', () => {
  it('allows unlimited manual trades for free users', () => {
    expect(getRemainingFreeTrades([])).toBe(Number.POSITIVE_INFINITY);
    expect(getRemainingFreeTrades(new Array(50))).toBe(Number.POSITIVE_INFINITY);
  });

  it('identifies pro plans', () => {
    expect(isProPlan('pro')).toBe(true);
    expect(isProPlan('grace')).toBe(true);
    expect(isProPlan('free')).toBe(false);
  });

  it('submits manual trades without setting a free-user lock', async () => {
    const addTrade = vi.fn().mockResolvedValue({ id: 't1' });
    const plan = 'free';
    const tradeData = { foo: 'bar' };

    const res = await submitTrade({ addTrade, tradeData, plan, trades: new Array(100) });
    expect(addTrade).toHaveBeenCalledWith(tradeData);
    expect(globalThis.localStorage.setItem).not.toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  it('does not set lock for pro users', async () => {
    const addTrade = vi.fn().mockResolvedValue({ id: 't2' });
    const plan = 'pro';
    const tradeData = { foo: 'baz' };

    const res = await submitTrade({ addTrade, tradeData, plan, trades: new Array(100) });
    expect(addTrade).toHaveBeenCalledWith(tradeData);
    expect(globalThis.localStorage.setItem).not.toHaveBeenCalled();
    expect(res).toBeDefined();
  });
});

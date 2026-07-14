import { describe, expect, it } from 'vitest';
import {
  ANALYTICS_VERSION,
  analyticsDeltaForTrades,
  emptyTradeAnalytics,
  getTradeStrategyTags,
  subtractTradeAnalytics,
  tradeAnalyticsDelta,
  tradePnlValue,
} from './tradeAnalytics.js';

describe('trade analytics aggregates', () => {
  it('does not treat open positions as completed performance', () => {
    expect(tradeAnalyticsDelta({ status: 'open', pnl: 50, outcome: 'WIN' })).toEqual({
      tradeCount: 0, totalPnl: 0, totalPips: 0, wins: 0, losses: 0,
      breakEven: 0, longs: 0, shorts: 0, grossProfit: 0, grossLoss: 0,
    });
  });

  it('infers outcome and direction for legacy closed trades', () => {
    expect(tradeAnalyticsDelta({ status: 'closed', pnl: -25, type: 'sell', pips: -10 })).toMatchObject({
      tradeCount: 1, totalPnl: -25, losses: 1, shorts: 1, grossLoss: 25,
    });
  });

  it('does not allow non-finite broker values to poison the aggregate', () => {
    expect(tradeAnalyticsDelta({
      status: 'closed', pnl: Infinity, pips: 'not-a-number', direction: 'BUY',
    })).toMatchObject({
      tradeCount: 1, totalPnl: 0, totalPips: 0, breakEven: 1, grossProfit: 0, grossLoss: 0,
    });
  });

  it('increments once when an open position closes and only adjusts values on edits', () => {
    const open = { status: 'open', direction: 'BUY', pnl: 0 };
    const closed = { status: 'closed', direction: 'BUY', pnl: 40, outcome: 'WIN' };
    expect(subtractTradeAnalytics(open, closed)).toMatchObject({
      tradeCount: 1, totalPnl: 40, wins: 1, longs: 1,
    });
    expect(subtractTradeAnalytics(closed, { ...closed, pnl: 55 })).toMatchObject({
      tradeCount: 0, totalPnl: 15, wins: 0, longs: 0, grossProfit: 15,
    });
  });

  it('builds a complete versioned aggregate', () => {
    const aggregate = {
      ...emptyTradeAnalytics(),
      ...analyticsDeltaForTrades([
        { status: 'closed', pnl: 20, outcome: 'WIN', direction: 'BUY' },
        { status: 'closed', netPnl: -5, outcome: 'LOSS', direction: 'SELL' },
      ]),
    };
    expect(aggregate).toMatchObject({
      version: ANALYTICS_VERSION,
      tradeCount: 2,
      totalPnl: 15,
      wins: 1,
      losses: 1,
      grossProfit: 20,
      grossLoss: 5,
    });
  });
});
describe('trade presentation compatibility', () => {
  it('reads the current singular strategy field used by quick trade entry', () => {
    expect(getTradeStrategyTags({ strategy: 'Breakout' })).toEqual(['Breakout']);
  });

  it('supports multi-tag and legacy setup records without duplicates', () => {
    expect(getTradeStrategyTags({ strategies: ['SMC', 'SMC'], strategy: 'ICT', setup: 'Swing' }))
      .toEqual(['SMC']);
    expect(getTradeStrategyTags({ setup: 'S/R' })).toEqual(['S/R']);
  });

  it('uses broker net P&L when available', () => {
    expect(tradePnlValue({ pnl: 50, netPnl: 47.5 })).toBe(47.5);
  });
});
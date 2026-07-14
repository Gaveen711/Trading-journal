import { describe, expect, it, vi } from 'vitest';
import { persistBrokerTrades } from './_brokerTradePersistence.ts';

const createDb = (existing = {}) => {
  const batchSet = vi.fn();
  const batchUpdate = vi.fn();
  const batchCommit = vi.fn().mockResolvedValue(undefined);
  const tradeCollection = {
    doc: vi.fn((id) => ({ id })),
  };
  const userRef = {
    collection: vi.fn(() => tradeCollection),
  };
  const usersCollection = {
    doc: vi.fn(() => userRef),
  };
  const db = {
    collection: vi.fn(() => usersCollection),
    getAll: vi.fn(async (...refs) => refs.map((ref) => ({
      id: ref.id,
      exists: Object.hasOwn(existing, ref.id),
      data: () => existing[ref.id],
    }))),
    batch: vi.fn(() => ({
      set: batchSet,
      update: batchUpdate,
      commit: batchCommit,
    })),
  };
  return { db, batchSet, batchUpdate };
};

const baseTrade = {
  closeDealTicket: 'close-1',
  status: 'closed',
  direction: 'BUY',
  outcome: 'WIN',
  netPnl: 20,
  pips: 10,
};

describe('persistBrokerTrades', () => {
  it('updates the user aggregate in the same batch as a new broker trade', async () => {
    const { db, batchUpdate } = createDb();

    await persistBrokerTrades({
      db,
      userId: 'user-1',
      accountId: 'account-1',
      brokerTrades: [baseTrade],
      timestampFactory: () => 'timestamp',
      incrementFactory: (value) => ({ increment: value }),
    });

    expect(batchUpdate).toHaveBeenCalledTimes(1);
    expect(batchUpdate.mock.calls[0][1]).toMatchObject({
      totalTradesLogged: { increment: 1 },
      'analytics.tradeCount': { increment: 1 },
      'analytics.totalPnl': { increment: 20 },
      'analytics.wins': { increment: 1 },
      'analytics.grossProfit': { increment: 20 },
    });
  });

  it('applies only the delta when a broker corrects an existing deal', async () => {
    const id = 'broker_account-1_close-1';
    const { db, batchUpdate } = createDb({
      [id]: {
        ...baseTrade,
        accountId: 'account-1',
        syncedAt: 'old-timestamp',
        updatedAt: 'old-timestamp',
      },
    });

    await persistBrokerTrades({
      db,
      userId: 'user-1',
      accountId: 'account-1',
      brokerTrades: [{
        ...baseTrade,
        outcome: 'LOSS',
        netPnl: -5,
        pips: -2,
      }],
      timestampFactory: () => 'new-timestamp',
      incrementFactory: (value) => ({ increment: value }),
    });

    expect(batchUpdate).toHaveBeenCalledTimes(1);
    expect(batchUpdate.mock.calls[0][1]).toMatchObject({
      totalTradesLogged: { increment: 0 },
      'analytics.tradeCount': { increment: 0 },
      'analytics.totalPnl': { increment: -25 },
      'analytics.totalPips': { increment: -12 },
      'analytics.wins': { increment: -1 },
      'analytics.losses': { increment: 1 },
      'analytics.grossProfit': { increment: -20 },
      'analytics.grossLoss': { increment: 5 },
    });
  });
});

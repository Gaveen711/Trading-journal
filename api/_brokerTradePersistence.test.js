import { describe, expect, it, vi } from 'vitest';
import { persistBrokerTrades } from './_brokerTradePersistence.ts';
// The constant, not a literal: a stored tag is only trusted at the current
// engine version, so these fixtures must track a bump automatically.
import { SESSION_ENGINE_VERSION } from '../src/lib/sessionEngine.js';

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

describe('persistBrokerTrades session aggregates', () => {
  // The doc shape normalizeDeal emits: tag resolved from openTime ('London' at
  // 2026-03-04T10:00Z), no sessionResolvedAt — that stamp is this module's job.
  const sessionTrade = {
    ...baseTrade,
    openTime: '2026-03-04T10:00:00.000Z',
    closeTime: '2026-03-04T11:00:00.000Z',
    entryTimestampUtc: '2026-03-04T10:00:00.000Z',
    sessionCode: 'London',
    sessionSource: 'broker',
    sessionEngineVersion: SESSION_ENGINE_VERSION,
  };

  it('increments the sessionAnalytics bucket for a new broker trade in the same batch update', async () => {
    const { db, batchUpdate } = createDb();

    await persistBrokerTrades({
      db,
      userId: 'user-1',
      accountId: 'account-1',
      brokerTrades: [sessionTrade],
      timestampFactory: () => 'timestamp',
      incrementFactory: (value) => ({ increment: value }),
    });

    expect(batchUpdate).toHaveBeenCalledTimes(1);
    const userUpdate = batchUpdate.mock.calls[0][1];
    // Flat and bucketed paths in ONE user-doc update, bucketed under the tag.
    expect(userUpdate).toMatchObject({
      'analytics.tradeCount': { increment: 1 },
      'sessionAnalytics.buckets.London.tradeCount': { increment: 1 },
      'sessionAnalytics.buckets.London.totalPnl': { increment: 20 },
      'sessionAnalytics.buckets.London.wins': { increment: 1 },
      'sessionAnalytics.buckets.London.grossProfit': { increment: 20 },
      'sessionAnalytics.buckets.London.holdMsTotal': { increment: 3600000 },
      'sessionAnalytics.buckets.London.holdMsCount': { increment: 1 },
    });
    // sessionAnalyticsUpdate drops zero counters: the other six buckets must
    // contribute no field paths at all.
    expect(userUpdate['sessionAnalytics.buckets.Unknown.tradeCount']).toBeUndefined();
    expect(userUpdate['sessionAnalytics.buckets.Asia.tradeCount']).toBeUndefined();
  });

  it('re-syncing an unchanged trade produces no aggregate update at all', async () => {
    const id = 'broker_account-1_close-1';
    const { db, batchSet, batchUpdate } = createDb({
      [id]: {
        ...sessionTrade,
        accountId: 'account-1',
        syncedAt: 'old-timestamp',
        updatedAt: 'old-timestamp',
        sessionResolvedAt: 'old-timestamp',
        createdAt: 'old-timestamp',
      },
    });

    await persistBrokerTrades({
      db,
      userId: 'user-1',
      accountId: 'account-1',
      brokerTrades: [sessionTrade],
      timestampFactory: () => 'new-timestamp',
      incrementFactory: (value) => ({ increment: value }),
    });

    // The doc is still refreshed, but an idempotent re-sync must not drift
    // either aggregate — zero flat delta and zero session delta mean no
    // user-doc update lands in the batch.
    expect(batchSet).toHaveBeenCalledTimes(1);
    expect(batchUpdate).not.toHaveBeenCalled();
  });

  it('buckets an untimed trade as Unknown in the aggregate while its stored sessionCode stays null', async () => {
    const { db, batchSet, batchUpdate } = createDb();
    // No openTime/closeTime/timestamp anywhere and a null tag: the aggregate
    // needs somewhere to put it (Unknown), but Unknown must never be stored.
    const untimedTrade = {
      closeDealTicket: 'untimed-1',
      status: 'closed',
      direction: 'BUY',
      outcome: 'WIN',
      netPnl: 5,
      pips: 0,
      entryTimestampUtc: null,
      sessionCode: null,
      sessionSource: 'broker',
      sessionEngineVersion: SESSION_ENGINE_VERSION,
    };

    await persistBrokerTrades({
      db,
      userId: 'user-1',
      accountId: 'account-1',
      brokerTrades: [untimedTrade],
      timestampFactory: () => 'timestamp',
      incrementFactory: (value) => ({ increment: value }),
    });

    expect(batchUpdate).toHaveBeenCalledTimes(1);
    expect(batchUpdate.mock.calls[0][1]).toMatchObject({
      'sessionAnalytics.buckets.Unknown.tradeCount': { increment: 1 },
      'sessionAnalytics.buckets.Unknown.totalPnl': { increment: 5 },
    });
    // The stored tag stays null — 'Unknown' is not in the firestore.rules enum.
    const storedDoc = batchSet.mock.calls[0][1];
    expect(storedDoc.sessionCode).toBeNull();
  });

  it('stamps sessionResolvedAt via the timestamp factory only on session-tagged docs', async () => {
    const { db, batchSet } = createDb();
    const legacyTrade = { ...baseTrade, closeDealTicket: 'legacy-1' };

    await persistBrokerTrades({
      db,
      userId: 'user-1',
      accountId: 'account-1',
      brokerTrades: [sessionTrade, legacyTrade],
      timestampFactory: () => 'timestamp',
      incrementFactory: (value) => ({ increment: value }),
    });

    const storedById = new Map(batchSet.mock.calls.map(([ref, data]) => [ref.id, data]));
    expect(storedById.get('broker_account-1_close-1').sessionResolvedAt).toBe('timestamp');
    // A doc without session fields gets no audit stamp invented for it.
    expect(storedById.get('broker_account-1_legacy-1')).not.toHaveProperty('sessionResolvedAt');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => {
  const connection = {
    connect: vi.fn().mockResolvedValue(undefined),
    waitSynchronized: vi.fn().mockResolvedValue(undefined),
    getDealsByTimeRange: vi.fn().mockResolvedValue([]),
    close: vi.fn().mockResolvedValue(undefined),
  };
  const account = {
    id: 'temporary-provider-account',
    platform: 'mt5',
    server: 'Broker-Demo',
    deploy: vi.fn().mockResolvedValue(undefined),
    waitConnected: vi.fn().mockResolvedValue(undefined),
    getRPCConnection: vi.fn(() => connection),
  };
  const metatraderAccountApi = {
    createAccount: vi.fn().mockResolvedValue(account),
    getAccount: vi.fn().mockResolvedValue(account),
    removeAccount: vi.fn().mockResolvedValue(undefined),
  };
  return { account, connection, metatraderAccountApi };
});

vi.mock('metaapi.cloud-sdk/esm-node', () => ({
  default: class MockMetaApi {
    constructor() {
      return { metatraderAccountApi: sdk.metatraderAccountApi };
    }
  },
}));

import { fetchBrokerTrades, normalizeMetaApiDeals } from './_metaapi-broker.js';
// The constants, not literals: a SESSION_ENGINE_VERSION bump must fail loudly
// here if normalizeDeal is not re-checked against the new boundaries.
import { SESSION_CODES, SESSION_ENGINE_VERSION } from '../src/lib/sessionEngine.js';

const context = { brokerType: 'mt5', server: 'Broker-Demo' };

describe('transient broker sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.METAAPI_TOKEN = 'test-token';
  });

  it('removes the temporary provider account after retrieving trades', async () => {
    await fetchBrokerTrades({
      login: '123456',
      password: 'investor-password',
      server: 'Broker-Demo',
      brokerType: 'mt5',
    });

    expect(sdk.metatraderAccountApi.createAccount).toHaveBeenCalledWith(expect.objectContaining({
      login: '123456',
      password: 'investor-password',
      server: 'Broker-Demo',
    }));
    expect(sdk.metatraderAccountApi.removeAccount).toHaveBeenCalledWith('temporary-provider-account');
  });
});

describe('normalizeMetaApiDeals', () => {
  it('persists only exit deals and derives the original position direction', () => {
    const trades = normalizeMetaApiDeals([
      {
        id: 'open-1',
        positionId: 'position-1',
        entryType: 'DEAL_ENTRY_IN',
        type: 'DEAL_TYPE_BUY',
        symbol: 'XAUUSD',
        volume: 0.2,
        price: 2300,
        profit: 0,
        time: '2026-07-12T10:00:00.000Z',
      },
      {
        id: 'close-1',
        positionId: 'position-1',
        entryType: 'DEAL_ENTRY_OUT',
        type: 'DEAL_TYPE_SELL',
        symbol: 'XAUUSD',
        volume: 0.2,
        price: 2301.5,
        profit: 30,
        commission: -1,
        swap: -0.5,
        time: '2026-07-12T11:00:00.000Z',
      },
    ], context);

    expect(trades).toHaveLength(1);
    expect(trades[0]).toMatchObject({
      closeDealTicket: 'close-1',
      direction: 'BUY',
      openPrice: 2300,
      closePrice: 2301.5,
      pips: 15,
      netPnl: 28.5,
      outcome: 'WIN',
    });
  });

  it('ignores non-trade balance operations and still supports MT4 deals without entryType', () => {
    const trades = normalizeMetaApiDeals([
      {
        id: 'deposit-1',
        type: 'DEAL_TYPE_BALANCE',
        profit: 500,
        time: '2026-07-12T10:00:00.000Z',
      },
      {
        id: 'mt4-close',
        positionId: 'mt4-position',
        type: 'DEAL_TYPE_BUY',
        symbol: 'XAUUSD',
        price: 2299,
        profit: -10,
        time: '2026-07-12T11:00:00.000Z',
      },
    ], context);

    expect(trades).toHaveLength(1);
    expect(trades[0]).toMatchObject({
      closeDealTicket: 'mt4-close',
      direction: 'SELL',
      openPrice: null,
      pips: null,
    });
  });

  it('uses a volume-weighted entry price for scaled positions', () => {
    const trades = normalizeMetaApiDeals([
      {
        id: 'open-1',
        positionId: 'scaled',
        entryType: 'DEAL_ENTRY_IN',
        type: 'DEAL_TYPE_BUY',
        volume: 1,
        price: 2300,
        time: '2026-07-12T10:00:00.000Z',
      },
      {
        id: 'open-2',
        positionId: 'scaled',
        entryType: 'DEAL_ENTRY_IN',
        type: 'DEAL_TYPE_BUY',
        volume: 1,
        price: 2302,
        time: '2026-07-12T10:05:00.000Z',
      },
      {
        id: 'close-1',
        positionId: 'scaled',
        entryType: 'DEAL_ENTRY_OUT_BY',
        type: 'DEAL_TYPE_SELL',
        volume: 2,
        price: 2303,
        profit: 40,
        time: '2026-07-12T10:30:00.000Z',
      },
    ], context);

    expect(trades).toHaveLength(1);
    expect(trades[0].openPrice).toBe(2301);
    expect(trades[0].pips).toBe(20);
  });
});

describe('normalizeDeal session tagging', () => {
  const dealPair = (openTime, closeTime, suffix = '') => ([
    {
      id: 'open' + suffix,
      positionId: 'pos' + suffix,
      entryType: 'DEAL_ENTRY_IN',
      type: 'DEAL_TYPE_BUY',
      symbol: 'XAUUSD',
      volume: 0.1,
      price: 2300,
      time: openTime,
    },
    {
      id: 'close' + suffix,
      positionId: 'pos' + suffix,
      entryType: 'DEAL_ENTRY_OUT',
      type: 'DEAL_TYPE_SELL',
      symbol: 'XAUUSD',
      volume: 0.1,
      price: 2301,
      profit: 10,
      time: closeTime,
    },
  ]);

  it('resolves the session from openTime with sessionSource broker', () => {
    // 2026-03-04T10:00Z: London desk open (GMT), NY still closed (EST) → London.
    const trades = normalizeMetaApiDeals(
      dealPair('2026-03-04T10:00:00.000Z', '2026-03-04T11:00:00.000Z'),
      context,
    );

    expect(trades).toHaveLength(1);
    expect(trades[0]).toMatchObject({
      entryTimestampUtc: '2026-03-04T10:00:00.000Z',
      sessionCode: 'London',
      sessionSource: 'broker',
      sessionEngineVersion: SESSION_ENGINE_VERSION,
    });
    // sessionResolvedAt is stamped by persistBrokerTrades (the timestamp
    // factory lives there); normalizeDeal must not invent one.
    expect(trades[0]).not.toHaveProperty('sessionResolvedAt');
  });

  it('falls back to closeTime for MT4 deals that carry no entry', () => {
    // 14:00Z: London (14:00 GMT) and NY (09:00 EST) both open → LondonNY.
    const trades = normalizeMetaApiDeals([
      {
        id: 'mt4-close',
        positionId: 'mt4-position',
        type: 'DEAL_TYPE_BUY',
        symbol: 'XAUUSD',
        price: 2299,
        profit: -10,
        time: '2026-03-04T14:00:00.000Z',
      },
    ], context);

    expect(trades).toHaveLength(1);
    expect(trades[0].openTime).toBeNull();
    expect(trades[0]).toMatchObject({
      entryTimestampUtc: '2026-03-04T14:00:00.000Z',
      sessionCode: 'LondonNY',
      sessionSource: 'broker',
      sessionEngineVersion: SESSION_ENGINE_VERSION,
    });
  });

  it('stores Off for weekend deals — Off is in the rules enum, Unknown is not', () => {
    // Saturday 2026-03-07: inside the NY Fri 17:00 → Sun 17:00 rest window.
    const trades = normalizeMetaApiDeals(
      dealPair('2026-03-07T10:00:00.000Z', '2026-03-07T11:00:00.000Z'),
      context,
    );

    expect(trades).toHaveLength(1);
    expect(trades[0].sessionCode).toBe('Off');
  });

  it('never emits Unknown or undefined sessionCode, only the rules enum or null', () => {
    const trades = normalizeMetaApiDeals([
      ...dealPair('2026-03-04T10:00:00.000Z', '2026-03-04T11:00:00.000Z', '-a'),
      ...dealPair('2026-03-07T10:00:00.000Z', '2026-03-07T11:00:00.000Z', '-b'),
      // Garbage time: validDate falls back to now(), which still resolves to
      // some enum code — the stored tag must stay enum-or-null regardless.
      {
        id: 'garbage-close',
        positionId: 'garbage-position',
        type: 'DEAL_TYPE_SELL',
        symbol: 'XAUUSD',
        price: 2299,
        profit: 1,
        time: 'not-a-date',
      },
    ], context);

    expect(trades.length).toBeGreaterThanOrEqual(3);
    for (const trade of trades) {
      expect(trade.sessionCode).not.toBe('Unknown');
      expect(trade.sessionCode).not.toBeUndefined();
      expect(trade.sessionCode === null || SESSION_CODES.includes(trade.sessionCode)).toBe(true);
    }
  });

  it('resolves per local desk hours across DST, not fixed UTC hours', () => {
    // Same 16:30 UTC wall clock. January: London on GMT is still open (16:30
    // local) alongside NY → LondonNY. July: London on BST is closed (17:30
    // local), only NY remains → NY. A fixed UTC-hour table cannot produce both.
    const january = normalizeMetaApiDeals(
      dealPair('2026-01-14T16:30:00.000Z', '2026-01-14T16:45:00.000Z', '-jan'),
      context,
    );
    const july = normalizeMetaApiDeals(
      dealPair('2026-07-15T16:30:00.000Z', '2026-07-15T16:45:00.000Z', '-jul'),
      context,
    );

    expect(january[0].sessionCode).toBe('LondonNY');
    expect(july[0].sessionCode).toBe('NY');
  });
});

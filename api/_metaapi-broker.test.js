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

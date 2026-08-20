import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockKvStore = new Map();

vi.mock('@vercel/kv', () => {
  const mockPipeline = {
    incr: vi.fn((key) => {
      mockPipeline.results.push(Promise.resolve().then(() => {
        const entry = mockKvStore.get(key) || { count: 0, expiresAt: Date.now() + 60000 };
        entry.count++;
        mockKvStore.set(key, entry);
        return entry.count;
      }));
      return mockPipeline;
    }),
    expire: vi.fn((key, seconds) => {
      mockPipeline.results.push(Promise.resolve().then(() => {
        const entry = mockKvStore.get(key);
        if (entry) {
          entry.expiresAt = Date.now() + seconds * 1000;
          mockKvStore.set(key, entry);
        }
        return 1;
      }));
      return mockPipeline;
    }),
    ttl: vi.fn((key) => {
      mockPipeline.results.push(Promise.resolve().then(() => {
        const entry = mockKvStore.get(key);
        if (!entry) return -2;
        const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : -1;
      }));
      return mockPipeline;
    }),
    exec: vi.fn(async () => {
      const res = await Promise.all(mockPipeline.results);
      mockPipeline.results = [];
      return res;
    }),
    results: []
  };

  return {
    kv: {
      incr: vi.fn(async (key) => {
        const entry = mockKvStore.get(key) || { count: 0, expiresAt: Date.now() + 60000 };
        entry.count++;
        mockKvStore.set(key, entry);
        return entry.count;
      }),
      expire: vi.fn(async (key, seconds) => {
        const entry = mockKvStore.get(key);
        if (entry) {
          entry.expiresAt = Date.now() + seconds * 1000;
          mockKvStore.set(key, entry);
        }
        return 1;
      }),
      ttl: vi.fn(async (key) => {
        const entry = mockKvStore.get(key);
        if (!entry) return -2;
        const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : -1;
      }),
      get: vi.fn(async (key) => mockKvStore.get(key) || null),
      set: vi.fn(async (key, val) => { mockKvStore.set(key, val); return 'OK'; }),
      del: vi.fn(async (key) => { mockKvStore.delete(key); return 1; }),
      pipeline: vi.fn(() => mockPipeline)
    }
  };
});

import { app } from './[[...route]].ts';

// Mock the firebase admin module
vi.mock('./_firebase.js', () => {
  const mockDocGet = vi.fn();
  const mockDocSet = vi.fn();
  const mockDocUpdate = vi.fn().mockResolvedValue(undefined);
  
  const mockDoc = vi.fn(() => ({
    get: mockDocGet,
    set: mockDocSet,
    update: mockDocUpdate,
    collection: mockCollection,
    parent: { parent: {} },
  }));
  
  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
  }));

  const db = {
    collection: mockCollection,
    runTransaction: vi.fn(async (callback) => callback({
      get: (ref) => ref.get(),
      set: (_ref, data) => mockDocUpdate(data),
      update: (_ref, data) => mockDocUpdate(data),
    })),
    __mocks: { mockDocGet, mockDocSet, mockDocUpdate, mockDoc, mockCollection }
  };

  return {
    admin: {
      apps: { length: 1 },
      firestore: {
        FieldValue: {
          increment: (value) => ({ type: 'increment', value }),
        },
      },
    },
    initAdmin: vi.fn(),
    db,
    now: () => 'MOCK_TIMESTAMP'
  };
});

// Mock resend module
vi.mock('./_resend.js', () => {
  return {
    default: {
      emails: {
        send: vi.fn()
      }
    }
  };
});


// Mock metaapi-broker helper module
vi.mock('./_metaapi-broker.js', () => {
  return {
    fetchBrokerTrades: vi.fn(),
    provisionMetaApiAccount: vi.fn(),
    fetchMetaApiDeals: vi.fn(),
  };
});



import { db } from './_firebase.js';
// The constant, not a literal: a SESSION_ENGINE_VERSION bump must fail loudly
// here if the webhook write path is not re-checked against the new boundaries.
import { SESSION_ENGINE_VERSION } from '../src/lib/sessionEngine.js';

describe('EA -> Cloud Function -> Firestore (sync-trade)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockKvStore.clear();
    
    // Default valid API key resolution mock
    db.__mocks.mockDocGet.mockImplementation(async function() {
      // If querying apiKeys
      if (this.collectionName === 'apiKeys') {
        return { exists: true, data: () => ({ uid: 'TEST_USER_ID' }) };
      }
      // If querying users
      if (this.collectionName === 'users') {
        // Valid Pro user
        return { exists: true, data: () => ({ plan: 'pro', planExpiry: new Date(Date.now() + 86400000).toISOString() }) };
      }
      // Default to doc not existing (for trades)
      return { exists: false, data: () => null };
    });
    
    // Bind context to identify collection in mock (simple hack for test)
    db.__mocks.mockCollection.mockImplementation((name) => {
      const docMock = () => {
        const obj = {
          get: db.__mocks.mockDocGet.bind({ collectionName: name }),
          set: db.__mocks.mockDocSet,
          update: db.__mocks.mockDocUpdate,
          collection: db.__mocks.mockCollection,
          parent: { parent: {} },
        };
        return obj;
      };
      return { doc: docMock };
    });
  });

  const executeRequest = async (body, headers = {}) => {
    const res = await app.request('/api/sync-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Real keys are 'xau_' + 24 random bytes of hex; resolveKey rejects
        // anything without the prefix before it spends a Firestore read.
        'x-api-key': 'xau_' + 'a1b2c3d4'.repeat(6),
        ...headers
      },
      body: JSON.stringify(body)
    });
    return {
      statusCode: res.status,
      jsonData: await res.json()
    };
  };

  it('rejects missing event/positionId/symbol payload', async () => {
    const res = await executeRequest({ event: 'open' }); // missing others
    
    expect(res.statusCode).toBe(400);
    expect(res.jsonData.error).toContain('Missing');
  });

  it('writes a new open trade to Firestore on MT5 open event', async () => {
    const payload = {
      event: 'open',
      positionId: '98765',
      ticket: '12345',
      symbol: 'XAUUSD',
      direction: 'buy',
      lots: 0.5,
      price: 2000.50,
      time: '2023-10-10T10:00:00Z',
      commission: -1.5,
      swap: 0,
      source: 'mt5'
    };
    const res = await executeRequest(payload);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.status).toBe('created');
    
    // Verify it called set on the trade ref
    expect(db.__mocks.mockDocSet).toHaveBeenCalledWith(expect.objectContaining({
      positionId: '98765',
      symbol: 'XAUUSD',
      direction: 'BUY',
      openPrice: 2000.50,
      lots: 0.5,
      status: 'open',
      createdAt: 'MOCK_TIMESTAMP'
    }));
  });

  it('updates an existing trade to closed on MT5 close event', async () => {
    // Setup the get to pretend the trade already exists
    db.__mocks.mockDocGet.mockImplementation(async function() {
      if (this.collectionName === 'apiKeys') return { exists: true, data: () => ({ uid: 'TEST_USER_ID' }) };
      if (this.collectionName === 'users') return { exists: true, data: () => ({ plan: 'pro', planExpiry: new Date(Date.now() + 86400000).toISOString() }) };
      
      // Trade doc exists
      return { 
        exists: true, 
        data: () => ({ openPrice: 2000.00, direction: 'buy' }) 
      };
    });

    const payload = {
      event: 'close',
      positionId: '98765',
      ticket: '12346',
      symbol: 'XAUUSD',
      direction: 'buy', // EA payload
      lots: 0.5,
      price: 2010.00,
      time: '2023-10-10T12:00:00Z',
      commission: -1.5,
      swap: -2.0,
      profit: 500.00
    };
    const res = await executeRequest(payload);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.status).toBe('updated');
    
    // (2010 - 2000) / 0.1 pip size for XAUUSD = 100 pips
    expect(db.__mocks.mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: 'closed',
      closePrice: 2010.00,
      pnl: 500.00,
      netPnl: 496.50, // 500 - 1.5 - 2.0
      pips: 100
    }));
  });

  it('caches the API key and subscription resolution in Vercel KV', async () => {
    const payload = {
      event: 'open',
      positionId: '11111',
      symbol: 'XAUUSD',
      direction: 'buy',
      lots: 0.1,
      price: 2000.0,
      time: '2023-10-10T10:00:00Z',
    };

    // First request
    const res1 = await executeRequest(payload);
    expect(res1.statusCode).toBe(200);

    // Record how many times DB read was called
    const initialGetCount = db.__mocks.mockDocGet.mock.calls.length;

    // Second request with different positionId (uses same API key)
    const payload2 = { ...payload, positionId: '22222' };
    const res2 = await executeRequest(payload2);
    expect(res2.statusCode).toBe(200);

    // Verify mockDocGet was not called for auth checks in second request
    const finalGetCount = db.__mocks.mockDocGet.mock.calls.length;
    // The only DB read should be checking if trade positionId '22222' exists (1 call)
    const dbGetDiff = finalGetCount - initialGetCount;
    expect(dbGetDiff).toBe(1);
  });

  it('triggers rate limiting and returns 429 after 500 requests', async () => {
    const payload = {
      event: 'open',
      positionId: '98765',
      symbol: 'XAUUSD',
      direction: 'buy',
    };

    // /sync-trade shares the 500/min webhook scope with /tv-webhook: many
    // users' EAs can sit behind one prop-firm VPS IP, so the generic 100/min
    // bucket dropped real trade events.
    const testIp = '192.168.1.50';
    for (let i = 0; i < 500; i++) {
      const res = await executeRequest(payload, { 'x-forwarded-for': testIp });
      expect(res.statusCode).toBe(200);
    }

    const res = await executeRequest(payload, { 'x-forwarded-for': testIp });
    expect(res.statusCode).toBe(429);
    expect(res.jsonData.error).toBe('Too Many Requests');
  });

  describe('session tagging (spec §2.2 webhook write path)', () => {
    // Mocks an existing open trade doc that was tagged 'Asia' at open time.
    // The tag deliberately contradicts what the close instant would resolve to
    // (16:30Z on 2026-01-14 → LondonNY), so any close-path re-derivation shows
    // up as the wrong bucket rather than passing by coincidence.
    const mockExistingOpenTrade = () => {
      db.__mocks.mockDocGet.mockImplementation(async function () {
        if (this.collectionName === 'apiKeys') return { exists: true, data: () => ({ uid: 'TEST_USER_ID' }) };
        if (this.collectionName === 'users') return { exists: true, data: () => ({ plan: 'pro', planExpiry: new Date(Date.now() + 86400000).toISOString() }) };
        return {
          exists: true,
          data: () => ({
            positionId: '98765',
            openPrice: 2000.00,
            direction: 'buy',
            lots: 0.5,
            status: 'open',
            openTime: '2026-01-14T02:00:00Z',
            entryTimestampUtc: '2026-01-14T02:00:00.000Z',
            sessionCode: 'Asia',
            sessionSource: 'webhook',
            sessionEngineVersion: SESSION_ENGINE_VERSION,
          }),
        };
      });
    };

    const closePayload = {
      event: 'close',
      positionId: '98765',
      ticket: '12346',
      symbol: 'XAUUSD',
      direction: 'buy',
      lots: 0.5,
      price: 2010.00,
      time: '2026-01-14T16:30:00Z',
      commission: -1.5,
      swap: -2.0,
      profit: 500.00,
    };

    it('stamps session fields from payload.time on open events with sessionSource webhook', async () => {
      const res = await executeRequest({
        event: 'open',
        positionId: '55501',
        ticket: '55501',
        symbol: 'XAUUSD',
        direction: 'buy',
        lots: 0.5,
        price: 2000.50,
        // 2026-03-04T10:00Z: London desk open (GMT), NY closed (EST) → London.
        time: '2026-03-04T10:00:00Z',
        source: 'mt5',
      });

      expect(res.statusCode).toBe(200);
      expect(res.jsonData.status).toBe('created');
      expect(db.__mocks.mockDocSet).toHaveBeenCalledWith(expect.objectContaining({
        entryTimestampUtc: '2026-03-04T10:00:00.000Z',
        sessionCode: 'London',
        sessionSource: 'webhook',
        sessionEngineVersion: SESSION_ENGINE_VERSION,
        sessionResolvedAt: 'MOCK_TIMESTAMP',
      }));
    });

    it('close that creates a partial doc resolves the session from closeTime', async () => {
      // Default mock: trade doc does not exist → the close must create the
      // partial doc and resolve from closeTime exactly like normalizeDeal.
      // 14:00Z on 2026-03-04: London and NY both open → LondonNY.
      const res = await executeRequest({ ...closePayload, positionId: '77701', time: '2026-03-04T14:00:00Z' });

      expect(res.statusCode).toBe(200);
      const setCall = db.__mocks.mockDocUpdate.mock.calls.find(([data]) => data.status === 'closed');
      expect(setCall).toBeDefined();
      expect(setCall[0]).toMatchObject({
        partial: true,
        createdAt: 'MOCK_TIMESTAMP',
        entryTimestampUtc: '2026-03-04T14:00:00.000Z',
        sessionCode: 'LondonNY',
        sessionSource: 'webhook',
        sessionEngineVersion: SESSION_ENGINE_VERSION,
        sessionResolvedAt: 'MOCK_TIMESTAMP',
      });
    });

    it('close of an existing open doc writes no session field — the open tag survives', async () => {
      mockExistingOpenTrade();

      const res = await executeRequest(closePayload);

      expect(res.statusCode).toBe(200);
      const setCall = db.__mocks.mockDocUpdate.mock.calls.find(([data]) => data.status === 'closed');
      expect(setCall).toBeDefined();
      // Merge-set with none of these keys leaves the open event's tag intact;
      // their presence with ANY value would overwrite it.
      expect(setCall[0]).not.toHaveProperty('entryTimestampUtc');
      expect(setCall[0]).not.toHaveProperty('sessionCode');
      expect(setCall[0]).not.toHaveProperty('sessionSource');
      expect(setCall[0]).not.toHaveProperty('sessionEngineVersion');
      expect(setCall[0]).not.toHaveProperty('sessionResolvedAt');
      expect(setCall[0]).not.toHaveProperty('partial');
    });

    it('open→close moves the trade into the bucket the OPEN event stamped, alongside analytics.*', async () => {
      mockExistingOpenTrade();

      const res = await executeRequest(closePayload);

      expect(res.statusCode).toBe(200);
      const userUpdateCall = db.__mocks.mockDocUpdate.mock.calls.find(
        ([data]) => 'analytics.tradeCount' in data,
      );
      expect(userUpdateCall).toBeDefined();
      const userUpdate = userUpdateCall[0];
      // Flat and bucketed paths land in ONE update call; netPnl = 500 - 1.5 - 2 = 496.5.
      expect(userUpdate).toMatchObject({
        totalTradesLogged: { type: 'increment', value: 1 },
        'analytics.tradeCount': { type: 'increment', value: 1 },
        'analytics.totalPnl': { type: 'increment', value: 496.5 },
        'sessionAnalytics.buckets.Asia.tradeCount': { type: 'increment', value: 1 },
        'sessionAnalytics.buckets.Asia.totalPnl': { type: 'increment', value: 496.5 },
        'sessionAnalytics.buckets.Asia.wins': { type: 'increment', value: 1 },
        'sessionAnalytics.buckets.Asia.grossProfit': { type: 'increment', value: 496.5 },
      });
      // Bucketed under the stored open tag, never re-derived from the close
      // instant (16:30Z → LondonNY) and never dumped in Unknown.
      expect(userUpdate['sessionAnalytics.buckets.LondonNY.tradeCount']).toBeUndefined();
      expect(userUpdate['sessionAnalytics.buckets.Unknown.tradeCount']).toBeUndefined();
    });
  });
});

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

  it('triggers rate limiting and returns 429 after 100 requests', async () => {
    const payload = {
      event: 'open',
      positionId: '98765',
      symbol: 'XAUUSD',
      direction: 'buy',
    };
    
    const testIp = '192.168.1.50';
    for (let i = 0; i < 100; i++) {
      const res = await executeRequest(payload, { 'x-forwarded-for': testIp });
      expect(res.statusCode).toBe(200);
    }
    
    const res = await executeRequest(payload, { 'x-forwarded-for': testIp });
    expect(res.statusCode).toBe(429);
    expect(res.jsonData.error).toBe('Too Many Requests');
  });
});

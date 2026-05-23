import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from './[[...route]].ts';

// Mock the firebase admin module
vi.mock('./_firebase.js', () => {
  const mockDocGet = vi.fn();
  const mockDocSet = vi.fn();
  const mockDocUpdate = vi.fn();
  
  const mockDoc = vi.fn(() => ({
    get: mockDocGet,
    set: mockDocSet,
    update: mockDocUpdate,
    collection: mockCollection,
  }));
  
  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
  }));

  const db = {
    collection: mockCollection,
    __mocks: { mockDocGet, mockDocSet, mockDocUpdate, mockDoc, mockCollection }
  };

  return {
    admin: {},
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

// Mock paypal module
vi.mock('./_paypal.js', () => {
  return {
    checkoutNodeJssdk: {
      orders: {
        OrdersCreateRequest: class {},
        OrdersCaptureRequest: class {},
      },
      Webhooks: class {},
    },
    default: {
      execute: vi.fn()
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
          collection: db.__mocks.mockCollection
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
        'x-api-key': 'VALID_API_KEY',
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
      direction: 'buy',
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
});

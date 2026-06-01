import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/kv', () => {
  const mockKvStore = new Map();
  return {
    kv: {
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(60),
      get: vi.fn(async (key) => mockKvStore.get(key) || null),
      set: vi.fn(async (key, val) => { mockKvStore.set(key, val); return 'OK'; }),
      del: vi.fn(async (key) => { mockKvStore.delete(key); return 1; })
    }
  };
});

// Mock the firebase admin module
vi.mock('./_firebase.js', () => {
  const mockDocGet = vi.fn();
  const mockDocSet = vi.fn();
  const mockDocUpdate = vi.fn();
  const mockBatchCommit = vi.fn();
  const mockBatchUpdate = vi.fn();
  const mockBatchDelete = vi.fn();
  const mockGetAll = vi.fn();

  const mockDoc = vi.fn(() => {
    return {
      get: mockDocGet,
      set: mockDocSet,
      update: mockDocUpdate,
      collection: mockCollection,
    };
  });

  const mockCollection = vi.fn(() => {
    const queryObj = {
      doc: mockDoc,
      where: vi.fn(() => queryObj),
      limit: vi.fn(() => queryObj),
      get: mockDocGet,
    };
    return queryObj;
  });

  const mockBatch = vi.fn(() => ({
    delete: mockBatchDelete,
    update: mockBatchUpdate,
    set: vi.fn(),
    commit: mockBatchCommit,
  }));

  const dbMock = {
    collection: mockCollection,
    batch: mockBatch,
    getAll: mockGetAll,
    __mocks: {
      mockDocGet,
      mockDocSet,
      mockDocUpdate,
      mockDoc,
      mockCollection,
      mockBatch,
      mockBatchDelete,
      mockBatchUpdate,
      mockBatchCommit,
      mockGetAll,
    }
  };

  return {
    admin: {
      apps: { length: 1 },
      firestore: {
        FieldValue: {
          serverTimestamp: () => 'MOCK_SERVER_TIMESTAMP',
          increment: (val) => ({ type: 'increment', value: val }),
        }
      }
    },
    initAdmin: vi.fn(),
    db: dbMock,
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
  const fetchBrokerTrades = vi.fn();
  return {
    fetchBrokerTrades,
    provisionMetaApiAccount: vi.fn(),
    fetchMetaApiDeals: vi.fn(),
  };
});

import { db } from './_firebase.js';
import { fetchBrokerTrades } from './_metaapi-broker.js';
import { app } from './[[...route]].ts';

describe('Broker Sync Poller Cron Job', () => {
  const cronSecret = 'test_cron_secret';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = cronSecret;
    vi.mocked(fetchBrokerTrades).mockResolvedValue([]);
  });

  const executePollerRequest = async (headers = {}) => {
    return await app.request('/api/cron/broker-sync-poller', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  };

  it('rejects unauthorized requests with invalid cron secret', async () => {
    const res = await executePollerRequest({ 'x-cron-secret': 'invalid_secret' });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('runs successfully and filters users correctly using isSyncAllowed', async () => {
    const nowMs = Date.now();

    // Mock collection('users').where().get() to return users list
    db.__mocks.mockDocGet.mockImplementationOnce(async () => {
      return {
        docs: [
          {
            id: 'LIFETIME_USER',
            data: () => ({ plan: 'pro' })
          },
          {
            id: 'ACTIVE_PRO_USER',
            data: () => ({ plan: 'pro', planExpiry: new Date(nowMs + 86400000).toISOString() })
          },
          {
            id: 'EXPIRED_PRO_USER',
            data: () => ({ plan: 'pro', planExpiry: new Date(nowMs - 86400000).toISOString() })
          },
          {
            id: 'ACTIVE_GRACE_USER',
            data: () => ({ plan: 'grace', graceUntil: new Date(nowMs + 86400000).toISOString() })
          },
          {
            id: 'EXPIRED_GRACE_USER',
            data: () => ({ plan: 'grace', graceUntil: new Date(nowMs - 86400000).toISOString() })
          }
        ]
      };
    });

    // Mock brokerAccounts collection query for each of the 3 allowed users:
    // LIFETIME_USER, ACTIVE_PRO_USER, ACTIVE_GRACE_USER.
    // Let's return one active broker account for each.
    db.__mocks.mockDocGet.mockImplementation(async () => {
      return {
        docs: [
          {
            id: 'BROKER_ACC_123',
            data: () => ({
              metaApiAccountId: 'meta_123',
              login: 'login_123',
              server: 'server_123',
              brokerType: 'mt5',
              isActive: true,
              lastSyncTime: new Date(nowMs - 100000).toISOString(),
            })
          }
        ]
      };
    });

    db.__mocks.mockGetAll.mockResolvedValue([
      { exists: false }
    ]);

    const res = await executePollerRequest({ 'x-cron-secret': cronSecret });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.usersProcessed).toBe(3); // LIFETIME_USER, ACTIVE_PRO_USER, ACTIVE_GRACE_USER
    expect(json.accountsProcessed).toBe(3);

    // Verify fetchBrokerTrades was called exactly 3 times
    expect(fetchBrokerTrades).toHaveBeenCalledTimes(3);
  });
});

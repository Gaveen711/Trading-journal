import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/kv', () => {
  const mockKvStore = new Map();
  const mockPipeline = {
    incr: vi.fn((_key) => {
      mockPipeline.results.push(Promise.resolve(1));
      return mockPipeline;
    }),
    expire: vi.fn((_key, _seconds) => {
      mockPipeline.results.push(Promise.resolve(1));
      return mockPipeline;
    }),
    ttl: vi.fn((_key) => {
      mockPipeline.results.push(Promise.resolve(60));
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
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(60),
      get: vi.fn(async (key) => mockKvStore.get(key) || null),
      set: vi.fn(async (key, val) => { mockKvStore.set(key, val); return 'OK'; }),
      del: vi.fn(async (key) => { mockKvStore.delete(key); return 1; }),
      pipeline: vi.fn(() => mockPipeline)
    }
  };
});

// Mock the firebase admin module
vi.mock('./_firebase.js', () => {
  const mockDocGet = vi.fn();
  const mockDocSet = vi.fn();
  const mockDocUpdate = vi.fn().mockResolvedValue(undefined);
  const mockBatchCommit = vi.fn();
  const mockBatchUpdate = vi.fn();
  const mockBatchDelete = vi.fn();
  const mockGetAll = vi.fn();

  const mockDoc = vi.fn((id) => {
    return {
      id,
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
    collectionGroup: vi.fn(() => {
      const query = {
        where: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        limit: vi.fn(() => query),
        get: vi.fn(async () => {
          const nowMs = Date.now();
          const uids = ['LIFETIME_USER', 'ACTIVE_PRO_USER', 'EXPIRED_PRO_USER', 'ACTIVE_GRACE_USER', 'EXPIRED_GRACE_USER'];
          return {
            empty: false,
            docs: uids.map(uid => ({
              id: `BROKER_ACC_${uid}`,
              ref: {
                parent: { parent: { id: uid } },
                update: mockDocUpdate,
              },
              data: () => ({
                metaApiAccountId: `meta_${uid}`,
                login: `login_${uid}`,
                server: `server_${uid}`,
                brokerType: 'mt5',
                isActive: true,
                syncJobState: 'queued',
                nextSyncAt: new Date(nowMs - 1000).toISOString(),
                lastSyncTime: new Date(nowMs - 100000).toISOString(),
                // One already-migrated account (e.g. a connect that crashed
                // before its terminal update): the poller must not downgrade it.
                ...(uid === 'LIFETIME_USER' ? { credentialStorage: 'client-session' } : {}),
              })
            }))
          };
        })
      };
      return query;
    }),    batch: mockBatch,
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
          delete: () => 'MOCK_DELETE_FIELD',
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
  return {
    fetchBrokerTrades: vi.fn().mockResolvedValue([]),
    provisionMetaApiAccount: vi.fn(),
    fetchMetaApiDeals: vi.fn(),
  };
});

import { db } from './_firebase.js';
import { fetchBrokerTrades } from './_metaapi-broker.js';
import { app } from './[...route].ts';

describe('Broker Sync Poller Cron Job', () => {
  // assertCron() refuses to run on a secret shorter than 32 chars, so the
  // fixture reflects the production requirement rather than working around it.
  const cronSecret = 'test_cron_secret_0123456789abcdef';

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

  it('scrubs legacy server-managed broker credentials instead of syncing them', async () => {
    const nowMs = Date.now();

    // Mock db.getAll to fetch user details and verify trade existence check correctly
    db.__mocks.mockGetAll.mockImplementation(async (...refs) => {
      if (refs[0] && refs[0].id && refs[0].id.startsWith('broker_')) {
        return refs.map(ref => ({ exists: false, id: ref.id }));
      }
      const usersData = {
        'LIFETIME_USER': { plan: 'pro' },
        'ACTIVE_PRO_USER': { plan: 'pro', planExpiry: new Date(nowMs + 86400000).toISOString() },
        'EXPIRED_PRO_USER': { plan: 'pro', planExpiry: new Date(nowMs - 86400000).toISOString() },
        'ACTIVE_GRACE_USER': { plan: 'grace', graceUntil: new Date(nowMs + 86400000).toISOString() },
        'EXPIRED_GRACE_USER': { plan: 'grace', graceUntil: new Date(nowMs - 86400000).toISOString() }
      };
      return refs.map(ref => {
        const data = usersData[ref.id];
        return {
          exists: !!data,
          id: ref.id,
          data: () => data
        };
      });
    });

    const res = await executePollerRequest({ Authorization: `Bearer ${cronSecret}` });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.usersProcessed).toBe(5);
    expect(json.accountsProcessed).toBe(5);

    // Privacy policy forbids scheduled sync from using retained provider access.
    expect(fetchBrokerTrades).not.toHaveBeenCalled();
    expect(db.__mocks.mockDocUpdate).toHaveBeenCalledTimes(5);
  });

  it('preserves the persisted login and never downgrades client-session credentialStorage (spec §2.1)', async () => {
    const res = await executePollerRequest({ Authorization: `Bearer ${cronSecret}` });
    expect(res.status).toBe(200);

    const updatePayloads = db.__mocks.mockDocUpdate.mock.calls.map(([payload]) => payload);
    expect(updatePayloads).toHaveLength(5);

    for (const payload of updatePayloads) {
      // 'login' is spec §2.1 account metadata written by add/adopt — the
      // legacy-credential scrub must not delete it, or sync dies on both
      // sides once the client drains localStorage.
      expect(payload).not.toHaveProperty('login');
      // The actual credentials still get scrubbed.
      expect(payload.password).toBe('MOCK_DELETE_FIELD');
      expect(payload.brokerLogin).toBe('MOCK_DELETE_FIELD');
      expect(payload.brokerPassword).toBe('MOCK_DELETE_FIELD');
      expect(payload.metaApiAccountId).toBe('MOCK_DELETE_FIELD');
      expect(payload.providerAccountId).toBe('MOCK_DELETE_FIELD');
      expect(payload.credentialFingerprint).toBe('MOCK_DELETE_FIELD');
    }

    // Update calls follow doc order: LIFETIME_USER (already migrated to
    // client-session) is first and must keep it; true-legacy accounts convert
    // to client-local.
    expect(updatePayloads[0].credentialStorage).toBe('client-session');
    for (const payload of updatePayloads.slice(1)) {
      expect(payload.credentialStorage).toBe('client-local');
    }
  });
});

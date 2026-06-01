import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const mockKvStore = new Map();

vi.mock('@vercel/kv', () => {
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

import { app } from './[[...route]].ts';
import { db } from './_firebase.js';

// Mock the firebase admin module
vi.mock('./_firebase.js', () => {
  const mockDocGet = vi.fn();
  const mockDocSet = vi.fn();
  const mockDocUpdate = vi.fn();
  const mockBatchCommit = vi.fn();
  const mockBatchUpdate = vi.fn();
  const mockBatchDelete = vi.fn();
  
  const mockDoc = vi.fn(() => ({
    get: mockDocGet,
    set: mockDocSet,
    update: mockDocUpdate,
  }));
  
  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
    where: vi.fn(() => ({
      limit: vi.fn(() => ({
        get: mockDocGet
      })),
      get: mockDocGet
    }))
  }));

  const mockBatch = vi.fn(() => ({
    delete: mockBatchDelete,
    update: mockBatchUpdate,
    commit: mockBatchCommit,
  }));

  const firestoreDb = {
    collection: mockCollection,
    batch: mockBatch,
    __mocks: {
      mockDocGet,
      mockDocSet,
      mockDocUpdate,
      mockDoc,
      mockCollection,
      mockBatch,
      mockBatchDelete,
      mockBatchUpdate,
      mockBatchCommit
    }
  };

  return {
    admin: {
      apps: { length: 1 },
      firestore: {
        FieldValue: {
          serverTimestamp: () => 'MOCK_SERVER_TIMESTAMP'
        }
      }
    },
    initAdmin: vi.fn(),
    db: firestoreDb,
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

describe('Paddle Webhook API', () => {
  const webhookSecret = 'test_webhook_secret';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PADDLE_WEBHOOK_SECRET = webhookSecret;
  });

  const generateSignatureHeader = (bodyStr, secret, ts = Math.floor(Date.now() / 1000)) => {
    const payload = `${ts}:${bodyStr}`;
    const h1 = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return `ts=${ts};h1=${h1}`;
  };

  const executeRequest = async (body, headers = {}) => {
    const bodyStr = JSON.stringify(body);
    const signature = generateSignatureHeader(bodyStr, webhookSecret);
    
    const res = await app.request('/api/paddle-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Paddle-Signature': signature,
        ...headers
      },
      body: bodyStr
    });
    
    return {
      statusCode: res.status,
      jsonData: await res.json()
    };
  };

  it('rejects request with invalid signature', async () => {
    const body = { event_type: 'subscription.canceled', data: { id: 'sub_123' } };
    const res = await app.request('/api/paddle-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Paddle-Signature': 'ts=123;h1=invalid_signature'
      },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized: Invalid signature' });
  });

  it('ignores non-cancellation events', async () => {
    const body = { event_type: 'subscription.created', data: { id: 'sub_123' } };
    const res = await executeRequest(body);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.message).toBe('Event ignored');
  });

  it('downgrades user to free plan on subscription.canceled', async () => {
    const body = { event_type: 'subscription.canceled', data: { id: 'sub_123' } };
    
    // Mock user lookup snapshot returning a user
    db.__mocks.mockDocGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: 'USER_123',
          data: () => ({ plan: 'pro', paddleSubscriptionId: 'sub_123' })
        }
      ]
    });

    // Mock API keys lookup return empty
    db.__mocks.mockDocGet.mockResolvedValueOnce({
      empty: true,
      docs: []
    });

    const res = await executeRequest(body);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.message).toContain('User downgraded');
    
    // Verify user update batch was queued with downgrade fields
    expect(db.__mocks.mockBatchUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        plan: 'free',
        planExpiry: null,
        graceUntil: null,
        graceReason: null,
        mt5SyncEnabled: false,
        updatedAt: 'MOCK_SERVER_TIMESTAMP'
      })
    );
    expect(db.__mocks.mockBatchCommit).toHaveBeenCalled();
  });
});

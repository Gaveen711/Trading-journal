import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

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
    admin: {
      apps: { length: 1 }
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

import { app } from './[[...route]].ts';
import { db } from './_firebase.js';

describe('Lemon Squeezy Webhook', () => {
  const webhookSecret = 'test_webhook_secret';

  beforeEach(() => {
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = webhookSecret;
    vi.clearAllMocks();
  });

  const executeWebhook = async (payload, headers = {}) => {
    const rawBody = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    const res = await app.request('/api/lemon-squeezy-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        ...headers,
      },
      body: rawBody,
    });

    return {
      statusCode: res.status,
      jsonData: await res.json(),
    };
  };

  it('rejects requests with missing signature header', async () => {
    const payload = { test: true };
    const res = await app.request('/api/lemon-squeezy-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(400);
    expect(await res.text()).toBe('Missing x-signature header');
  });

  it('rejects requests with invalid signature', async () => {
    const payload = { test: true };
    const res = await app.request('/api/lemon-squeezy-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'invalid_signature',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(401);
    expect(await res.text()).toBe('Invalid signature');
  });

  it('processes subscription_created and upgrades user to Pro', async () => {
    const payload = {
      meta: {
        event_name: 'subscription_created',
        custom_data: {
          user_id: 'user_12345'
        }
      },
      data: {
        id: 'sub_ls_9999',
        attributes: {
          status: 'active',
          renews_at: '2026-10-10T12:00:00Z',
          ends_at: null
        }
      }
    };

    const res = await executeWebhook(payload);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.ok).toBe(true);

    // Should write plan = 'pro' and planExpiry = renews_at
    expect(db.__mocks.mockDocSet).toHaveBeenCalledWith({
      plan: 'pro',
      planExpiry: '2026-10-10T12:00:00Z',
      lemonSqueezySubscriptionId: 'sub_ls_9999',
      lemonSqueezyStatus: 'active',
      updatedAt: 'MOCK_TIMESTAMP',
    }, { merge: true });
  });

  it('downgrades user to free when subscription is expired', async () => {
    const payload = {
      meta: {
        event_name: 'subscription_expired',
        custom_data: {
          user_id: 'user_12345'
        }
      },
      data: {
        id: 'sub_ls_9999',
        attributes: {
          status: 'expired',
          renews_at: null,
          ends_at: '2026-06-20T10:00:00Z'
        }
      }
    };

    const res = await executeWebhook(payload);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.ok).toBe(true);

    // Should write plan = 'free' and planExpiry = null
    expect(db.__mocks.mockDocSet).toHaveBeenCalledWith({
      plan: 'free',
      planExpiry: null,
      lemonSqueezySubscriptionId: 'sub_ls_9999',
      lemonSqueezyStatus: 'expired',
      updatedAt: 'MOCK_TIMESTAMP',
    }, { merge: true });
  });

  it('keeps user as pro if subscription_cancelled event has ends_at in the future', async () => {
    const payload = {
      meta: {
        event_name: 'subscription_updated',
        custom_data: {
          user_id: 'user_12345'
        }
      },
      data: {
        id: 'sub_ls_9999',
        attributes: {
          status: 'cancelled',
          renews_at: null,
          ends_at: new Date(Date.now() + 86400000).toISOString() // 1 day in future
        }
      }
    };

    const res = await executeWebhook(payload);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.ok).toBe(true);

    // Should set plan = 'pro' with planExpiry = ends_at
    expect(db.__mocks.mockDocSet).toHaveBeenCalledWith({
      plan: 'pro',
      planExpiry: payload.data.attributes.ends_at,
      lemonSqueezySubscriptionId: 'sub_ls_9999',
      lemonSqueezyStatus: 'cancelled',
      updatedAt: 'MOCK_TIMESTAMP',
    }, { merge: true });
  });

  it('downgrades user to free if subscription_cancelled event has ends_at in the past', async () => {
    const payload = {
      meta: {
        event_name: 'subscription_updated',
        custom_data: {
          user_id: 'user_12345'
        }
      },
      data: {
        id: 'sub_ls_9999',
        attributes: {
          status: 'cancelled',
          renews_at: null,
          ends_at: new Date(Date.now() - 86400000).toISOString() // 1 day in past
        }
      }
    };

    const res = await executeWebhook(payload);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.ok).toBe(true);

    // Should set plan = 'free' with planExpiry = null
    expect(db.__mocks.mockDocSet).toHaveBeenCalledWith({
      plan: 'free',
      planExpiry: null,
      lemonSqueezySubscriptionId: 'sub_ls_9999',
      lemonSqueezyStatus: 'cancelled',
      updatedAt: 'MOCK_TIMESTAMP',
    }, { merge: true });
  });
});

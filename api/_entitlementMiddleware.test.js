import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Module mocks (hoisted) ───────────────────────────────────────────────────
// Same discipline as _sync-trade.test.js: mock the infrastructure edges
// (@vercel/kv, firebase admin, resend, metaapi) and exercise the real
// middleware + real Hono routes end to end.

vi.mock('@vercel/kv', () => {
  const store = new Map(); // key -> { value, expiresAt: ms | null }
  const kv = {
    async get(key) {
      const entry = store.get(key);
      return entry === undefined ? null : entry.value;
    },
    async set(key, value, opts = {}) {
      if (opts.nx && store.has(key)) return null; // NX semantics drive withAccountLock
      store.set(key, { value, expiresAt: opts.ex ? Date.now() + opts.ex * 1000 : null });
      return 'OK';
    },
    async del(key) { store.delete(key); return 1; },
    async incr(key) {
      const entry = store.get(key) || { value: 0, expiresAt: null };
      entry.value += 1;
      store.set(key, entry);
      return entry.value;
    },
    async expire(key, seconds) {
      const entry = store.get(key);
      if (entry) entry.expiresAt = Date.now() + seconds * 1000;
      return 1;
    },
    async ttl(key) {
      const entry = store.get(key);
      if (entry === undefined) return -2;
      if (entry.expiresAt === null) return -1;
      return Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000));
    },
    pipeline() {
      const ops = [];
      const p = {
        incr(key) { ops.push(() => kv.incr(key)); return p; },
        ttl(key) { ops.push(() => kv.ttl(key)); return p; },
        expire(key, seconds) { ops.push(() => kv.expire(key, seconds)); return p; },
        async exec() {
          const out = [];
          for (const op of ops.splice(0)) out.push(await op());
          return out;
        },
      };
      return p;
    },
    __store: store,
  };
  return { kv };
});

vi.mock('./_firebase.js', () => {
  // Minimal in-memory Firestore: flat map of document paths so the tests can
  // assert on the FINAL stored document — the login-clobbering class of bug
  // (later object keys overwriting earlier ones) is invisible to call-arg
  // assertions on set().
  const DELETE = { __op: 'delete' }; // FieldValue.delete() sentinel, one identity
  const docs = new Map();
  const flags = { failNextGet: false };

  const applyPatch = (base, patch) => {
    const next = { ...base };
    for (const [key, value] of Object.entries(patch)) {
      if (value === DELETE) delete next[key];
      else next[key] = value;
    }
    return next;
  };

  const childDocEntries = (collectionPath) => [...docs.entries()].filter(([path]) =>
    path.startsWith(collectionPath + '/') && !path.slice(collectionPath.length + 1).includes('/'));

  const makeDocRef = (path) => ({
    id: path.split('/').pop(),
    path,
    async get() {
      if (flags.failNextGet) {
        flags.failNextGet = false;
        throw new Error('simulated Firestore outage');
      }
      const data = docs.get(path);
      return {
        exists: data !== undefined,
        data: () => (data === undefined ? undefined : { ...data }),
        get: (field) => (data === undefined ? undefined : data[field]),
      };
    },
    async set(data, opts) {
      const base = opts && opts.merge && docs.has(path) ? docs.get(path) : {};
      docs.set(path, applyPatch(base, data));
    },
    async update(data) {
      if (!docs.has(path)) throw new Error('NOT_FOUND: no document to update: ' + path);
      docs.set(path, applyPatch(docs.get(path), data));
    },
    collection: (name) => makeCollection(path + '/' + name),
  });

  const snapOf = (entries) => ({
    empty: entries.length === 0,
    docs: entries.map(([path, data]) => ({
      id: path.split('/').pop(),
      data: () => ({ ...data }),
      get: (field) => data[field],
      ref: makeDocRef(path),
    })),
  });

  const makeCollection = (path) => ({
    doc: (id) => makeDocRef(path + '/' + (id === undefined ? 'auto-' + docs.size : id)),
    where: (field, _op, value) => {
      const filtered = () => childDocEntries(path).filter(([, data]) => data[field] === value);
      return {
        limit: (n) => ({ get: async () => snapOf(filtered().slice(0, n)) }),
        get: async () => snapOf(filtered()),
      };
    },
    limit: (n) => ({ get: async () => snapOf(childDocEntries(path).slice(0, n)) }),
    get: async () => snapOf(childDocEntries(path)),
  });

  // Firestore transactions serialize conflicting writers; the mutex emulates
  // that so concurrent-adopt tests observe transactional (not racy) semantics.
  // Writes buffer until the callback resolves, mirroring the real commit.
  let txQueue = Promise.resolve();
  const db = {
    collection: (name) => makeCollection(name),
    runTransaction(fn) {
      const run = txQueue.then(async () => {
        const writes = [];
        const tx = {
          get: (ref) => ref.get(),
          set: (ref, data, opts) => { writes.push(() => ref.set(data, opts)); return tx; },
          update: (ref, data) => { writes.push(() => ref.update(data)); return tx; },
        };
        const result = await fn(tx);
        for (const write of writes) await write();
        return result;
      });
      txQueue = run.catch(() => {});
      return run;
    },
    batch: () => {
      const ops = [];
      return {
        set: (ref, data, opts) => ops.push(() => ref.set(data, opts)),
        update: (ref, data) => ops.push(() => ref.update(data)),
        delete: (ref) => ops.push(async () => { docs.delete(ref.path); }),
        commit: async () => { for (const op of ops) await op(); },
      };
    },
    __docs: docs,
    __flags: flags,
    __reset: () => { docs.clear(); flags.failNextGet = false; },
  };

  const verifyIdToken = vi.fn();

  // admin.firestore is both called (reset-trades probes it for recursiveDelete)
  // and read as a property bag (FieldValue). Returning no recursiveDelete
  // routes reset-trades through its batched-delete fallback, which this
  // in-memory store can execute.
  const firestoreFn = () => ({});
  firestoreFn.FieldValue = {
    increment: (value) => ({ __op: 'increment', value }),
    delete: () => DELETE,
  };

  return {
    admin: {
      apps: { length: 1 },
      auth: () => ({ verifyIdToken }),
      firestore: firestoreFn,
    },
    initAdmin: vi.fn(),
    db,
    now: () => 'MOCK_TIMESTAMP',
    __verifyIdToken: verifyIdToken,
  };
});

vi.mock('./_resend.js', () => ({ default: { emails: { send: vi.fn() } } }));

vi.mock('./_metaapi-broker.js', () => ({
  fetchBrokerTrades: vi.fn(async () => []),
  provisionMetaApiAccount: vi.fn(),
  fetchMetaApiDeals: vi.fn(),
}));

import { kv } from '@vercel/kv';
import { db, __verifyIdToken } from './_firebase.js';
import {
  requireAuth,
  withUserDoc,
  requireEmailVerified,
  requirePro,
  requireProUser,
  assertPro,
} from './_entitlementMiddleware.ts';
import { app } from './[[...route]].ts';
import { emptyTradeAnalytics, emptySessionAnalytics } from '../src/lib/tradeAnalytics.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const FUTURE = new Date(Date.now() + 30 * 86400000).toISOString();
const PAST = new Date(Date.now() - 30 * 86400000).toISOString();

// Real hasPaidAccess shapes (src/lib/entitlements.js): plan 'pro'|'grace'
// honoring planExpiry and the server-written graceUntil.
const LIFETIME_PRO = { plan: 'pro' }; // no planExpiry = lifetime
const ACTIVE_PRO = { plan: 'pro', planExpiry: FUTURE };
const LAPSED_PRO = { plan: 'pro', planExpiry: PAST };
const GRACE = { plan: 'grace', graceUntil: FUTURE };
const LAPSED_GRACE = { plan: 'grace', graceUntil: PAST };
const FREE = { plan: 'free' };

/** Minimal Hono-shaped context for unit-testing the middleware directly. */
const makeCtx = ({ headers = {} } = {}) => {
  const store = new Map();
  return {
    set: (key, value) => store.set(key, value),
    get: (key) => store.get(key),
    req: { header: (name) => headers[name] },
    json: (body, status) => ({ body, status }),
  };
};

const runMw = async (mw, ctx) => {
  const next = vi.fn(async () => {});
  const result = await mw(ctx, next);
  return { result, next };
};

const originalEnforcement = process.env.REQUIRE_EMAIL_VERIFICATION;
beforeEach(() => {
  vi.clearAllMocks();
  db.__reset();
  kv.__store.clear();
  delete process.env.REQUIRE_EMAIL_VERIFICATION; // enforcement ON by default
});
afterEach(() => {
  if (originalEnforcement === undefined) delete process.env.REQUIRE_EMAIL_VERIFICATION;
  else process.env.REQUIRE_EMAIL_VERIFICATION = originalEnforcement;
});

// ── requireAuth ──────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  it('rejects a missing Authorization header with 401 auth-required', async () => {
    const ctx = makeCtx();
    const { result, next } = await runMw(requireAuth, ctx);
    expect(result.status).toBe(401);
    expect(result.body.code).toBe('auth-required');
    expect(result.body.error).toBe('Invalid or expired token');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a malformed (non-Bearer) header with 401', async () => {
    const ctx = makeCtx({ headers: { Authorization: 'Basic abc123' } });
    const { result, next } = await runMw(requireAuth, ctx);
    expect(result.status).toBe(401);
    expect(result.body.code).toBe('auth-required');
    expect(next).not.toHaveBeenCalled();
    expect(__verifyIdToken).not.toHaveBeenCalled(); // rejected before the verifier
  });

  it('rejects when the verifier throws, without leaking verifier detail', async () => {
    __verifyIdToken.mockRejectedValue(new Error('token used too late'));
    const ctx = makeCtx({ headers: { Authorization: 'Bearer expired-token' } });
    const { result, next } = await runMw(requireAuth, ctx);
    expect(result.status).toBe(401);
    // Uniform body: verifier internals must never reach the client.
    expect(JSON.stringify(result.body)).not.toContain('too late');
    expect(next).not.toHaveBeenCalled();
  });

  it('stores uid and the emailVerified claim on context for a valid token', async () => {
    __verifyIdToken.mockResolvedValue({ uid: 'user-1', email_verified: false });
    const ctx = makeCtx({ headers: { Authorization: 'Bearer good-token' } });
    const { result, next } = await runMw(requireAuth, ctx);
    expect(result).toBeUndefined(); // no response = proceed
    expect(ctx.get('uid')).toBe('user-1');
    expect(ctx.get('emailVerified')).toBe(false); // claim captured for assertEmailVerified
    expect(next).toHaveBeenCalledOnce();
  });
});

// ── withUserDoc ──────────────────────────────────────────────────────────────

describe('withUserDoc', () => {
  it('404s when users/{uid} does not exist', async () => {
    const ctx = makeCtx();
    ctx.set('uid', 'ghost');
    const { result, next } = await runMw(withUserDoc, ctx);
    expect(result.status).toBe(404);
    expect(result.body.error).toBe('User not found');
    expect(next).not.toHaveBeenCalled();
  });

  it('stores userData on context when the doc exists', async () => {
    db.__docs.set('users/user-1', { plan: 'free', displayName: 'G' });
    const ctx = makeCtx();
    ctx.set('uid', 'user-1');
    const { result, next } = await runMw(withUserDoc, ctx);
    expect(result).toBeUndefined();
    expect(ctx.get('userData')).toMatchObject({ plan: 'free', displayName: 'G' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns a sanitized 500 when Firestore fails (no provider detail)', async () => {
    db.__flags.failNextGet = true;
    const ctx = makeCtx();
    ctx.set('uid', 'user-1');
    const { result, next } = await runMw(withUserDoc, ctx);
    expect(result.status).toBe(500);
    expect(JSON.stringify(result.body)).not.toContain('simulated Firestore outage');
    expect(next).not.toHaveBeenCalled();
  });
});

// ── assertPro / requirePro ───────────────────────────────────────────────────

describe('assertPro — real hasPaidAccess shapes', () => {
  const ctxWith = (userData) => {
    const ctx = makeCtx();
    ctx.set('userData', userData);
    return ctx;
  };

  it('denies a free user with 403 pro-required and the default error', () => {
    const denied = assertPro(ctxWith(FREE));
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe('pro-required');
    expect(denied.body.error).toBe('Pro subscription required');
  });

  it('preserves the legacy per-route message via options', () => {
    const denied = assertPro(ctxWith(FREE), { error: 'Broker sync requires active Pro subscription' });
    expect(denied.status).toBe(403);
    expect(denied.body.error).toBe('Broker sync requires active Pro subscription');
    expect(denied.body.code).toBe('pro-required');
  });

  it('passes lifetime pro (plan pro, no planExpiry)', () => {
    expect(assertPro(ctxWith(LIFETIME_PRO))).toBeNull();
  });

  it('passes active pro (future planExpiry)', () => {
    expect(assertPro(ctxWith(ACTIVE_PRO))).toBeNull();
  });

  it('denies lapsed pro (past planExpiry, no grace)', () => {
    const denied = assertPro(ctxWith(LAPSED_PRO));
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe('pro-required');
  });

  it('passes lapsed pro still inside the server-written grace window', () => {
    expect(assertPro(ctxWith({ ...LAPSED_PRO, graceUntil: FUTURE }))).toBeNull();
  });

  it('passes a grace-plan user with a future graceUntil', () => {
    expect(assertPro(ctxWith(GRACE))).toBeNull();
  });

  it('denies a grace-plan user whose graceUntil has passed', () => {
    const denied = assertPro(ctxWith(LAPSED_GRACE));
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe('pro-required');
  });
});

describe('requirePro middleware', () => {
  it('short-circuits (next not called) for a non-Pro user', async () => {
    const ctx = makeCtx();
    ctx.set('userData', FREE);
    const { result, next } = await runMw(requirePro(), ctx);
    expect(result.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next for a paid user', async () => {
    const ctx = makeCtx();
    ctx.set('userData', ACTIVE_PRO);
    const { result, next } = await runMw(requirePro(), ctx);
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('requireProUser', () => {
  it('composes the full chain in gate order: auth, user doc, email, pro', () => {
    const stack = requireProUser();
    expect(stack).toHaveLength(4);
    expect(stack[0]).toBe(requireAuth);
    expect(stack[1]).toBe(withUserDoc);
    expect(stack[2]).toBe(requireEmailVerified);
  });
});

// ── requireEmailVerified ─────────────────────────────────────────────────────

describe('requireEmailVerified', () => {
  const ctxWith = (userData, emailVerified) => {
    const ctx = makeCtx();
    ctx.set('userData', userData);
    ctx.set('emailVerified', emailVerified);
    return ctx;
  };

  it('grandfathers accounts without the requiresEmailVerification flag', async () => {
    const { result, next } = await runMw(requireEmailVerified, ctxWith({ plan: 'free' }, false));
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it('blocks a flagged, unverified account with 403 email-unverified', async () => {
    const { result, next } = await runMw(
      requireEmailVerified,
      ctxWith({ plan: 'free', requiresEmailVerification: true }, false),
    );
    expect(result.status).toBe(403);
    expect(result.body.code).toBe('email-unverified');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes a flagged account once its email is verified', async () => {
    const { result, next } = await runMw(
      requireEmailVerified,
      ctxWith({ plan: 'free', requiresEmailVerification: true }, true),
    );
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });
});

// ── Route-level gating: /broker-login-sync ───────────────────────────────────

const UID = 'route-user';
const ACCOUNT_ID = 'broker_abc123def456';
const ACCOUNT_PATH = `users/${UID}/brokerAccounts/${ACCOUNT_ID}`;

const post = async (path, body, { auth = 'Bearer valid-token', raw } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = auth;
  const res = await app.request('/api' + path, {
    method: 'POST',
    headers,
    body: raw !== undefined ? raw : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

/** Seed an authenticated, verified user. Grandfathered unless flagged. */
const seedUser = (userData, { emailVerified = true } = {}) => {
  __verifyIdToken.mockResolvedValue({ uid: UID, email_verified: emailVerified });
  db.__docs.set(`users/${UID}`, { ...userData });
};

describe('POST /broker-login-sync — per-action entitlement gating', () => {
  it('401 auth-required without an Authorization header', async () => {
    const res = await post('/broker-login-sync', { action: 'remove', accountId: ACCOUNT_ID }, { auth: null });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('auth-required');
  });

  it('404 when the token is valid but users/{uid} is missing', async () => {
    __verifyIdToken.mockResolvedValue({ uid: UID, email_verified: true });
    const res = await post('/broker-login-sync', { action: 'remove', accountId: ACCOUNT_ID });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('403 email-unverified precedes every action, even non-Pro ones like remove', async () => {
    seedUser({ ...FREE, requiresEmailVerification: true }, { emailVerified: false });
    const res = await post('/broker-login-sync', { action: 'remove', accountId: ACCOUNT_ID });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('email-unverified');
  });

  it('403 email-unverified (not pro-required) for an unverified non-Pro add — gate order', async () => {
    seedUser({ ...FREE, requiresEmailVerification: true }, { emailVerified: false });
    const res = await post('/broker-login-sync', { action: 'add' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('email-unverified');
  });

  it("rejects 'add' for a non-Pro user with pro-required and the legacy message", async () => {
    seedUser(FREE);
    const res = await post('/broker-login-sync', {
      action: 'add', login: '12345678', password: 'pw', server: 'Srv-Demo', brokerType: 'mt5',
    });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('pro-required');
    expect(res.body.error).toBe('Broker sync requires active Pro subscription');
  });

  it("rejects 'sync' for a lapsed-Pro user with pro-required", async () => {
    seedUser(LAPSED_PRO);
    const res = await post('/broker-login-sync', {
      action: 'sync', accountId: ACCOUNT_ID, login: '12345678', password: 'pw', server: 'Srv-Demo', brokerType: 'mt5',
    });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('pro-required');
  });

  it('405 (not 403) for an unknown action from a non-Pro user — Pro is gated per action', async () => {
    seedUser(FREE);
    const res = await post('/broker-login-sync', { action: 'destroy-everything' });
    expect(res.status).toBe(405);
  });

  it('400 (not 403) for invalid JSON from a non-Pro user — parsing precedes per-action gates', async () => {
    seedUser(FREE);
    const res = await post('/broker-login-sync', null, { raw: '{not-json' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid JSON body');
  });
});

describe("POST /broker-login-sync action 'remove' — auth + verified only (spec §7-Q7)", () => {
  it('succeeds for a lapsed (non-Pro) user and deactivates the account', async () => {
    seedUser(LAPSED_PRO);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true, login: '12345678' });
    const res = await post('/broker-login-sync', { action: 'remove', accountId: ACCOUNT_ID });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(db.__docs.get(ACCOUNT_PATH).isActive).toBe(false);
  });

  it('400 on an invalid accountId (path-separator characters)', async () => {
    seedUser(FREE);
    const res = await post('/broker-login-sync', { action: 'remove', accountId: 'bad/../id' });
    expect(res.status).toBe(400);
  });
});

describe("POST /broker-login-sync action 'adopt' — localStorage login migration", () => {
  it('404 when the broker account doc does not exist', async () => {
    seedUser(FREE);
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '12345678' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Broker account not found');
  });

  it('adopts onto a doc with no stored login for a non-Pro user (deliberately not Pro-gated)', async () => {
    seedUser(FREE);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true });
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '12345678' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, adopted: true });
    const doc = db.__docs.get(ACCOUNT_PATH);
    expect(doc.login).toBe('12345678');
    expect(doc.credentialStorage).toBe('client-session');
    expect(doc.migratedFromLocalAt).toBe('MOCK_TIMESTAMP');
    expect(doc.password).toBeUndefined(); // passwords never touch this path
  });

  it('treats an empty-string stored login as absent and adopts', async () => {
    seedUser(FREE);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true, login: '' });
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '12345678' });
    expect(res.status).toBe(200);
    expect(res.body.adopted).toBe(true);
    expect(db.__docs.get(ACCOUNT_PATH).login).toBe('12345678');
  });

  it('is idempotent: same stored login returns adopted:false with NO write', async () => {
    seedUser(FREE);
    const before = { id: ACCOUNT_ID, isActive: true, login: '12345678', updatedAt: 'ORIGINAL' };
    db.__docs.set(ACCOUNT_PATH, before);
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '12345678' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, adopted: false });
    const doc = db.__docs.get(ACCOUNT_PATH);
    expect(doc.updatedAt).toBe('ORIGINAL'); // untouched
    expect(doc.migratedFromLocalAt).toBeUndefined();
  });

  it('409 login-mismatch when a different login is already stored — never overwritten', async () => {
    seedUser(FREE);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true, login: '99999999' });
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '12345678' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('login-mismatch');
    expect(db.__docs.get(ACCOUNT_PATH).login).toBe('99999999'); // server truth kept
  });

  it('400 on a login that fails the BROKER_LOGIN pattern', async () => {
    seedUser(FREE);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true });
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: 'bad login!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid login');
  });

  it('400 on a non-string login (numbers must be stringified by the client)', async () => {
    seedUser(FREE);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true });
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: 12345678 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid login');
  });

  it('400 on an invalid accountId', async () => {
    seedUser(FREE);
    const res = await post('/broker-login-sync', { action: 'adopt', accountId: 'nested/path', login: '12345678' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid accountId');
  });

  it('serializes concurrent adopts with divergent logins: one adopts, the other 409s', async () => {
    seedUser(FREE);
    db.__docs.set(ACCOUNT_PATH, { id: ACCOUNT_ID, isActive: true });
    const [a, b] = await Promise.all([
      post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '11111111' }),
      post('/broker-login-sync', { action: 'adopt', accountId: ACCOUNT_ID, login: '22222222' }),
    ]);
    // A plain get-then-update would let both pass and the loser silently
    // overwrite the winner; the transaction guarantees exactly one adoption.
    expect([a.status, b.status].sort()).toEqual([200, 409]);
    const winner = a.status === 200 ? a : b;
    const loser = a.status === 200 ? b : a;
    expect(winner.body.adopted).toBe(true);
    expect(loser.body.code).toBe('login-mismatch');
    expect(db.__docs.get(ACCOUNT_PATH).login).toBe(winner === a ? '11111111' : '22222222');
  });
});

describe("POST /broker-login-sync action 'add' — Pro path persists login metadata", () => {
  it('persists login + credentialStorage client-session on the broker doc, and never echoes the login', async () => {
    seedUser(ACTIVE_PRO);
    const res = await post('/broker-login-sync', {
      action: 'add', login: '12345678', password: 'secret-pw', server: 'Srv-Demo', brokerType: 'mt5',
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const entry = [...db.__docs.entries()].find(([path]) =>
      path.startsWith(`users/${UID}/brokerAccounts/`));
    expect(entry).toBeDefined();
    const [, doc] = entry;
    // Spec §2.1: the login is persisted account metadata — the deletionPatch
    // scrub must not clobber it (login is in ACCOUNT_CREDENTIAL_FIELDS).
    expect(doc.login).toBe('12345678');
    expect(doc.credentialStorage).toBe('client-session');
    // The password stays on the device — never persisted, never echoed.
    expect(doc.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('12345678');
    expect(JSON.stringify(res.body)).not.toContain('secret-pw');
  });

  it('400 on a login failing the BROKER_LOGIN shape — nothing reaches Firestore', async () => {
    seedUser(ACTIVE_PRO);
    const res = await post('/broker-login-sync', {
      action: 'add', login: 'bad login!', password: 'pw', server: 'Srv-Demo', brokerType: 'mt5',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid login');
    const persisted = [...db.__docs.keys()].find((path) =>
      path.startsWith(`users/${UID}/brokerAccounts/`));
    expect(persisted).toBeUndefined();
  });

  it("400 on an object login (would otherwise persist '[object Object]')", async () => {
    seedUser(ACTIVE_PRO);
    const res = await post('/broker-login-sync', {
      action: 'add', login: { a: 1 }, password: 'pw', server: 'Srv-Demo', brokerType: 'mt5',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing or invalid login');
  });

  it('accepts a numeric login (legacy EA back-compat: String() before the shape gate)', async () => {
    seedUser(ACTIVE_PRO);
    const res = await post('/broker-login-sync', {
      action: 'add', login: 12345678, password: 'pw', server: 'Srv-Demo', brokerType: 'mt5',
    });
    expect(res.status).toBe(200);
    const entry = [...db.__docs.entries()].find(([path]) =>
      path.startsWith(`users/${UID}/brokerAccounts/`));
    expect(entry[1].login).toBe('12345678');
  });
});

// ── Route-level gating: whole-route Pro chains ───────────────────────────────

describe('POST /connect-broker — requireProUser chain', () => {
  it('403 pro-required before body validation for a non-Pro caller with a bad body', async () => {
    seedUser(FREE);
    const res = await post('/connect-broker', null, { raw: '{not-json' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('pro-required');
    expect(res.body.message).toBe('Broker connect is a Pro feature.');
  });

  it('404 uniformly when the user doc is missing (pre-/init-user race)', async () => {
    __verifyIdToken.mockResolvedValue({ uid: UID, email_verified: true });
    const res = await post('/connect-broker', { server: 'S', accountId: '1', password: 'p' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('400 on an accountId failing the broker-login shape — nothing reaches Firestore', async () => {
    seedUser(ACTIVE_PRO);
    const res = await post('/connect-broker', { server: 'Srv-Demo', accountId: 'has spaces', password: 'p' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid accountId');
    const persisted = [...db.__docs.keys()].find((path) =>
      path.startsWith(`users/${UID}/brokerAccounts/`));
    expect(persisted).toBeUndefined();
  });

  it('accepts a numeric accountId (legacy client back-compat)', async () => {
    seedUser(ACTIVE_PRO);
    const res = await post('/connect-broker', { server: 'Srv-Demo', accountId: 12345678, password: 'p' });
    expect(res.status).toBe(200);
    expect(res.body.tradeCount).toBe(0);
  });
});

// ── Route-level: /reset-trades wipes every server-maintained aggregate ───────

describe('POST /reset-trades — aggregate reset includes sessionAnalytics', () => {
  it('zeroes the session aggregate with the trades so a re-sync cannot double-count', async () => {
    seedUser({
      ...ACTIVE_PRO,
      totalTradesLogged: 2,
      analytics: { version: 2, tradeCount: 2, totalPnl: 55 },
      sessionAnalytics: {
        version: 1,
        engineVersion: 1,
        buckets: { London: { tradeCount: 2, totalPnl: 55, wins: 2 } },
      },
    });
    db.__docs.set(`users/${UID}/trades/t1`, { pnl: 20, status: 'closed' });
    db.__docs.set(`users/${UID}/trades/t2`, { pnl: 35, status: 'closed' });

    const res = await post('/reset-trades', {});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect(db.__docs.has(`users/${UID}/trades/t1`)).toBe(false);
    expect(db.__docs.has(`users/${UID}/trades/t2`)).toBe(false);

    const user = db.__docs.get(`users/${UID}`);
    expect(user.totalTradesLogged).toBe(0);
    expect(user.analytics).toEqual(emptyTradeAnalytics());
    // The regression: sessionAnalytics left stale here double-counts every
    // bucket on the next sync, and the counters are version-consistent so the
    // lazy rebuild gate would trust them forever.
    expect(user.sessionAnalytics).toEqual(emptySessionAnalytics());
    expect(user.sessionAnalytics.buckets.London.tradeCount).toBe(0);
  });
});

describe('POST /generate-api-key — requireProUser chain', () => {
  it('403 pro-required with the route message for a free user', async () => {
    seedUser(FREE);
    const res = await post('/generate-api-key', {});
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('pro-required');
    expect(res.body.message).toContain('Pro feature');
  });

  it('404 when the user doc is missing', async () => {
    __verifyIdToken.mockResolvedValue({ uid: UID, email_verified: true });
    const res = await post('/generate-api-key', {});
    expect(res.status).toBe(404);
  });
});

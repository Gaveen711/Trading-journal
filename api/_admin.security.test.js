import { describe, expect, it, vi } from 'vitest'
import { createAdminApi } from './_admin.ts'
import { localAdminRateLimitFallbackAllowed, ProcessLocalAdminRateLimiter } from './_adminRateLimit.ts'

const ADMIN_UID = 'rbGsMM2A2EdhgKLKLf9y0dGJ7RY2'
const ADMIN_EMAIL = 'admin@xaujournal.com'
const AUTH_HEADERS = {
  Authorization: 'Bearer test-token',
  'Content-Type': 'application/json',
}

const VALID_CLAIMS = {
  uid: ADMIN_UID,
  email: ADMIN_EMAIL,
  email_verified: true,
  admin: true,
  auth_time: Math.floor(Date.now() / 1000),
}

function comparable(value) {
  if (value instanceof Date) return value.getTime()
  if (value && typeof value.toDate === 'function') return value.toDate().getTime()
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return value
}

function createFirestore(initial = {}, { failReads = [] } = {}) {
  const docs = new Map(Object.entries(initial))
  const failingPaths = new Set(failReads)
  let sequence = 0

  const docRef = (path) => ({
    id: path.split('/').pop(),
    path,
    collection: (name) => collectionRef(`${path}/${name}`),
    async get() {
      if (failingPaths.has(path)) throw new Error(`sensitive-internal-detail:${path}`)
      return snapshot(path)
    },
    async set(value, options) {
      docs.set(path, options?.merge ? { ...(docs.get(path) || {}), ...value } : { ...value })
    },
    async update(value) {
      if (!docs.has(path)) throw new Error('not found')
      docs.set(path, { ...docs.get(path), ...value })
    },
    async delete() {
      docs.delete(path)
    },
  })

  const snapshot = (path) => {
    const value = docs.get(path)
    const ref = docRef(path)
    return {
      id: ref.id,
      ref,
      exists: value !== undefined,
      data: () => value === undefined ? undefined : { ...value },
      get: (field) => value?.[field],
    }
  }

  const directDocuments = (collectionPath) => {
    const prefix = `${collectionPath}/`
    return [...docs.keys()]
      .filter((path) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
      .map(snapshot)
  }

  const queryRef = (collectionPath, state = {}) => {
    const filters = state.filters || []
    const orders = state.orders || []
    const cursor = state.cursor
    const offset = state.offset || 0
    const maximum = state.maximum

    const execute = () => {
      if (failingPaths.has(collectionPath)) throw new Error(`sensitive-internal-detail:${collectionPath}`)
      let results = directDocuments(collectionPath).filter((entry) => filters.every(([field, operator, expected]) => {
        const actual = field === '__name__' ? entry.id : entry.get(field)
        const left = comparable(actual)
        const right = comparable(expected)
        if (operator === '==') return left === right
        if (operator === 'in') return expected.map(comparable).includes(left)
        if (operator === '>=') return left >= right
        if (operator === '<=') return left <= right
        if (operator === '>') return left > right
        if (operator === '<') return left < right
        throw new Error(`unsupported mock operator:${operator}`)
      }))

      if (orders.length > 0) {
        results.sort((a, b) => {
          for (const [field, direction] of orders) {
            const left = comparable(field === '__name__' ? a.id : a.get(field))
            const right = comparable(field === '__name__' ? b.id : b.get(field))
            if (left === right) continue
            const value = left < right ? -1 : 1
            return direction === 'desc' ? -value : value
          }
          return 0
        })
      }

      if (cursor !== undefined && cursor !== null) {
        const cursorId = typeof cursor === 'string' ? cursor : cursor.id
        const index = results.findIndex((entry) => entry.id === cursorId)
        results = index >= 0 ? results.slice(index + 1) : results.filter((entry) => entry.id > cursorId)
      }
      results = results.slice(offset)
      if (maximum !== undefined) results = results.slice(0, maximum)
      return results
    }

    return {
      path: collectionPath,
      doc: (id = `auto-${++sequence}`) => docRef(`${collectionPath}/${id}`),
      where: (field, operator, value) => queryRef(collectionPath, { ...state, filters: [...filters, [field, operator, value]] }),
      orderBy: (field, direction = 'asc') => queryRef(collectionPath, { ...state, orders: [...orders, [field, direction]] }),
      startAfter: (value) => queryRef(collectionPath, { ...state, cursor: value }),
      offset: (value) => queryRef(collectionPath, { ...state, offset: value }),
      limit: (value) => queryRef(collectionPath, { ...state, maximum: value }),
      select() { return this },
      count: () => ({ get: async () => ({ data: () => ({ count: execute().length }) }) }),
      aggregate: (specification) => ({
        get: async () => ({
          data: () => Object.fromEntries(Object.entries(specification).map(([key, aggregate]) => [
            key,
            execute().reduce((sum, entry) => sum + Number(entry.get(aggregate.field) || 0), 0),
          ])),
        }),
      }),
      async get() {
        const entries = execute()
        return { docs: entries, empty: entries.length === 0, size: entries.length }
      },
    }
  }

  const collectionRef = (path) => queryRef(path)
  const batch = () => {
    const operations = []
    return {
      set(ref, value, options) { operations.push(() => ref.set(value, options)); return this },
      update(ref, value) { operations.push(() => ref.update(value)); return this },
      create(ref, value) { operations.push(() => ref.set(value)); return this },
      delete(ref) { operations.push(() => ref.delete()); return this },
      async commit() { for (const operation of operations) await operation() },
    }
  }

  return {
    docs,
    db: {
      collection: collectionRef,
      batch,
      getAll: async (...refs) => Promise.all(refs.map((ref) => ref.get())),
    },
    recursiveDelete: async (ref) => {
      const prefix = `${ref.path}/`
      for (const path of [...docs.keys()]) {
        if (path === ref.path || path.startsWith(prefix)) docs.delete(path)
      }
    },
  }
}

function createHarness({
  claims = VALID_CLAIMS,
  currentAdmin = {},
  authUsers = [],
  firestore = {},
  failReads = [],
  verifyError,
} = {}) {
  const store = createFirestore(firestore, { failReads })
  const users = new Map(authUsers.map((user) => [user.uid, { ...user }]))
  const adminUser = {
    uid: ADMIN_UID,
    email: ADMIN_EMAIL,
    emailVerified: true,
    disabled: false,
    customClaims: { admin: true },
    ...currentAdmin,
  }
  const verifyIdToken = vi.fn(async () => {
    if (verifyError) throw verifyError
    return claims
  })
  const getUser = vi.fn(async (uid) => {
    if (uid === ADMIN_UID) return adminUser
    if (users.has(uid)) return users.get(uid)
    const error = new Error('firebase auth lookup detail must not leak')
    error.code = 'auth/user-not-found'
    throw error
  })
  const updateUser = vi.fn(async (uid, patch) => {
    const current = users.get(uid)
    if (!current) throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' })
    const updated = { ...current, ...patch }
    users.set(uid, updated)
    return updated
  })
  const deleteUser = vi.fn(async (uid) => users.delete(uid))
  const listUsers = vi.fn(async (limit, pageToken) => {
    const entries = [...users.values()]
    const start = pageToken ? Number(pageToken) : 0
    const page = entries.slice(start, start + limit)
    return {
      users: page,
      ...(start + limit < entries.length ? { pageToken: String(start + limit) } : {}),
    }
  })
  const auth = { verifyIdToken, getUser, updateUser, deleteUser, listUsers }
  const app = createAdminApi({
    admin: {
      auth: () => auth,
      firestore: {
        FieldPath: { documentId: () => '__name__' },
        AggregateField: { sum: (field) => ({ field }) },
      },
    },
    db: store.db,
    now: () => 'SERVER_TIMESTAMP',
    recursiveDelete: store.recursiveDelete,
  })
  return { app, docs: store.docs, getUser, listUsers, updateUser, verifyIdToken }
}

async function expectSafeError(response, { status, category }) {
  expect(response.status).toBe(status)
  const requestId = response.headers.get('x-request-id')
  expect(requestId).toEqual(expect.any(String))
  expect(requestId.length).toBeGreaterThan(7)
  const body = await response.json()
  expect(Object.keys(body)).toEqual(['error'])
  expect(Object.keys(body.error).sort()).toEqual(['category', 'code', 'message', 'requestId'])
  expect(body.error).toMatchObject({
    category,
    code: expect.any(String),
    message: expect.any(String),
    requestId,
  })
  return body.error
}

describe('admin API adversarial authorization contract', () => {
  it.each([
    ['wrong designated UID', { ...VALID_CLAIMS, uid: 'attacker-uid' }],
    ['wrong email', { ...VALID_CLAIMS, email: 'attacker@example.com' }],
    ['unverified email', { ...VALID_CLAIMS, email_verified: false }],
    ['missing admin claim', { ...VALID_CLAIMS, admin: false }],
  ])('rejects a valid token with %s', async (_label, claims) => {
    const harness = createHarness({ claims })
    const response = await harness.app.request('/settings', { headers: AUTH_HEADERS })
    await expectSafeError(response, { status: 403, category: 'authorization' })
  })

  it.each([
    ['disabled live account', { disabled: true }],
    ['revoked live claim', { customClaims: { admin: false } }],
    ['renamed live email', { email: 'attacker@example.com' }],
    ['unverified live account', { emailVerified: false }],
  ])('rejects a stale token after %s', async (_label, currentAdmin) => {
    const harness = createHarness({ currentAdmin })
    const response = await harness.app.request('/settings', { headers: AUTH_HEADERS })
    await expectSafeError(response, { status: 403, category: 'authorization' })
    expect(harness.getUser).toHaveBeenCalledWith(ADMIN_UID)
  })

  it('checks revoked tokens and emits a session-safe error without verifier details', async () => {
    const verifierError = Object.assign(new Error('private-project-id and token internals'), { code: 'auth/id-token-revoked' })
    const harness = createHarness({ verifyError: verifierError })
    const response = await harness.app.request('/settings', { headers: AUTH_HEADERS })
    const error = await expectSafeError(response, { status: 401, category: 'session' })
    expect(JSON.stringify(error)).not.toContain('private-project-id')
    expect(harness.verifyIdToken).toHaveBeenCalledWith('test-token', true)
  })
})

describe('local admin rate-limit fallback', () => {
  it('cannot activate in the production Vercel environment', () => {
    expect(localAdminRateLimitFallbackAllowed('1', 'production')).toBe(false)
    expect(localAdminRateLimitFallbackAllowed(undefined, 'development')).toBe(false)
    expect(localAdminRateLimitFallbackAllowed('1', 'development')).toBe(true)
  })

  it('enforces a bounded process-local window for the explicit local launcher', () => {
    const limiter = new ProcessLocalAdminRateLimiter()
    expect(limiter.consume('actor', 2, 60, 1_000)).toMatchObject({ allowed: true, remaining: 1 })
    expect(limiter.consume('actor', 2, 60, 1_001)).toMatchObject({ allowed: true, remaining: 0 })
    expect(limiter.consume('actor', 2, 60, 1_002)).toMatchObject({ allowed: false, remaining: 0 })
    expect(limiter.consume('actor', 2, 60, 61_000)).toMatchObject({ allowed: true, remaining: 1 })
  })
})

describe('admin API safe response and mutation contract', () => {
  it('adds a distinct request ID to successful responses without changing the success envelope', async () => {
    const harness = createHarness()
    const first = await harness.app.request('/settings', { headers: AUTH_HEADERS })
    const second = await harness.app.request('/settings', { headers: AUTH_HEADERS })
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ data: {} })
    expect(first.headers.get('x-request-id')).toEqual(expect.any(String))
    expect(second.headers.get('x-request-id')).toEqual(expect.any(String))
    expect(second.headers.get('x-request-id')).not.toBe(first.headers.get('x-request-id'))
  })

  it('does not leak unexpected backend errors or stack details', async () => {
    const harness = createHarness({ failReads: ['settings/platform'] })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const response = await harness.app.request('/settings', { headers: AUTH_HEADERS })
      const error = await expectSafeError(response, { status: 500, category: 'backend' })
      expect(JSON.stringify(error)).not.toContain('sensitive-internal-detail')
      expect(JSON.stringify(error)).not.toContain('settings/platform')
    } finally {
      consoleError.mockRestore()
    }
  })

  it('requires an operator reason before a user mutation creates an audit record or side effect', async () => {
    const harness = createHarness({ authUsers: [{ uid: 'customer-1', email: 'user@example.com' }] })
    const response = await harness.app.request('/users/customer-1', {
      method: 'PATCH',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ plan: 'pro' }),
    })
    await expectSafeError(response, { status: 400, category: 'validation' })
    expect(harness.updateUser).not.toHaveBeenCalled()
    expect([...harness.docs.keys()].some((path) => path.startsWith('adminAuditLogs/'))).toBe(false)
  })

  it('requires recent authentication before changing a user account', async () => {
    const harness = createHarness({
      claims: { ...VALID_CLAIMS, auth_time: Math.floor(Date.now() / 1000) - 601 },
      authUsers: [{ uid: 'customer-1', email: 'user@example.com' }],
    })
    const response = await harness.app.request('/users/customer-1', {
      method: 'PATCH',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ plan: 'pro', reason: 'Approved support escalation' }),
    })
    const error = await expectSafeError(response, { status: 403, category: 'authorization' })
    expect(error.code).toBe('RECENT_AUTH_REQUIRED')
    expect(harness.updateUser).not.toHaveBeenCalled()
  })

  it('treats success as a settled payment and refuses destructive deletion', async () => {
    const harness = createHarness({ firestore: { 'payments/pay-success': { status: 'success', amount: 25 } } })
    const response = await harness.app.request('/payments/pay-success', {
      method: 'DELETE',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ reason: 'Investigate duplicate provider event' }),
    })
    await expectSafeError(response, { status: 409, category: 'validation' })
    expect(harness.docs.has('payments/pay-success')).toBe(true)
  })

  it('turns dashboard user deletion into a recoverable suspension request', async () => {
    const harness = createHarness({
      authUsers: [{ uid: 'customer-1', email: 'user@example.com', disabled: false }],
      firestore: {
        'users/customer-1': { plan: 'pro' },
        'users/customer-1/trades/trade-1': { date: '2026-08-15', pnl: 25 },
        'apiKeys/key-1': { uid: 'customer-1' },
      },
    })
    const response = await harness.app.request('/users/customer-1', {
      method: 'DELETE',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ reason: 'Verified customer erasure request' }),
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      data: { id: 'customer-1', deleted: false, deletionState: 'pending', disabled: true },
    })
    expect(harness.updateUser).toHaveBeenCalledWith('customer-1', { disabled: true })
    expect(harness.docs.get('users/customer-1')).toMatchObject({ deletionState: 'pending' })
    expect(harness.docs.has('users/customer-1/trades/trade-1')).toBe(true)
    expect(harness.docs.has('apiKeys/key-1')).toBe(false)
  })
})

describe('admin API user privacy, canonical identity, and pagination', () => {
  it('uses the Firebase UID as the canonical lookup and returns a safe 404', async () => {
    const harness = createHarness()
    const response = await harness.app.request('/users/missing-uid', { headers: AUTH_HEADERS })
    await expectSafeError(response, { status: 404, category: 'not_found' })
    expect(harness.getUser).toHaveBeenCalledWith('missing-uid')
  })

  it('allowlists user output and excludes auth, broker, credential, and token fields', async () => {
    const marker = 'DO-NOT-EXPOSE-9d83b8'
    const harness = createHarness({
      authUsers: [{
        uid: 'customer-1',
        email: 'user@example.com',
        emailVerified: true,
        disabled: false,
        passwordHash: marker,
        passwordSalt: marker,
        tokensValidAfterTime: marker,
        customClaims: { billingSecret: marker },
      }],
      firestore: {
        'users/customer-1': {
          displayName: 'Customer One',
          plan: 'pro',
          apiKey: marker,
          brokerPassword: marker,
          brokerAccessToken: marker,
          serviceAccount: marker,
          privateNotes: marker,
        },
      },
    })
    const response = await harness.app.request('/users/customer-1', { headers: AUTH_HEADERS })
    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String))
    const body = await response.json()
    expect(body.data).toMatchObject({ id: 'customer-1', uid: 'customer-1', email: 'user@example.com', plan: 'pro' })
    expect(JSON.stringify(body)).not.toContain(marker)
    expect(body.data).not.toHaveProperty('passwordHash')
    expect(body.data).not.toHaveProperty('customClaims')
    expect(body.data).not.toHaveProperty('apiKey')
    expect(body.data).not.toHaveProperty('brokerPassword')
  })

  it('applies search, plan, and status filters server-side using frontend enum values', async () => {
    const harness = createHarness({
      authUsers: [
        { uid: 'alice-uid', email: 'alice@example.com', displayName: 'Alice', disabled: true },
        { uid: 'bob-uid', email: 'bob@example.com', displayName: 'Bob', disabled: true },
        { uid: 'carol-uid', email: 'carol@example.com', displayName: 'Carol', disabled: false },
      ],
      firestore: {
        'users/alice-uid': { plan: 'grace' },
        'users/bob-uid': { plan: 'pro' },
        'users/carol-uid': { plan: 'grace' },
      },
    })
    const response = await harness.app.request('/users?search=alice&plan=GRACE&status=SUSPENDED&limit=2', { headers: AUTH_HEADERS })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.map((entry) => entry.uid)).toEqual(['alice-uid'])
  })

  it('rejects an oversized page before calling Firebase Auth', async () => {
    const harness = createHarness()
    const response = await harness.app.request('/users?limit=101', { headers: AUTH_HEADERS })
    await expectSafeError(response, { status: 400, category: 'validation' })
    expect(harness.listUsers).not.toHaveBeenCalled()
  })
})

describe('admin analytics validation, normalization, and user isolation', () => {
  it.each([
    ['/analytics?from=not-a-date&to=2026-08-31T23%3A59%3A59.999Z', 'malformed date'],
    ['/analytics?from=2026-09-01T00%3A00%3A00.000Z&to=2026-08-01T00%3A00%3A00.000Z', 'reversed range'],
  ])('rejects %s (%s)', async (path) => {
    const harness = createHarness()
    const response = await harness.app.request(path, { headers: AUTH_HEADERS })
    await expectSafeError(response, { status: 400, category: 'validation' })
  })

  it('counts success alongside paid, completed, and succeeded settlement statuses', async () => {
    const createdAt = '2026-08-15T10:00:00.000Z'
    const harness = createHarness({ firestore: {
      'payments/1': { status: 'success', amount: 10, createdAt },
      'payments/2': { status: 'paid', amount: 20, createdAt },
      'payments/3': { status: 'completed', amount: 30, createdAt },
      'payments/4': { status: 'succeeded', amount: 40, createdAt },
      'payments/5': { status: 'failed', amount: 500, createdAt },
    } })
    const response = await harness.app.request(
      '/analytics?from=2026-08-01T00%3A00%3A00.000Z&to=2026-08-31T23%3A59%3A59.999Z',
      { headers: AUTH_HEADERS },
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.payments).toMatchObject({ total: 5, settled: 4, failed: 1, revenue: 100 })
  })

  it('serves per-user analytics only from the canonical UID route without leaking another user', async () => {
    const foreignMarker = 'FOREIGN-USER-DATA-8f2c'
    const harness = createHarness({
      authUsers: [{ uid: 'target-uid', email: 'target@example.com' }],
      firestore: {
        'users/target-uid': { plan: 'pro' },
        'users/target-uid/trades/trade-1': {
          status: 'closed', pnl: 42, netPnl: 40, symbol: 'XAUUSD', closeTime: '2026-08-15T10:00:00.000Z',
        },
        'users/target-uid/journals/journal-1': { createdAt: '2026-08-15T10:30:00.000Z' },
        'users/foreign-uid/trades/trade-foreign': { symbol: foreignMarker, pnl: 999999 },
      },
    })
    const response = await harness.app.request('/users/target-uid/analytics', { headers: AUTH_HEADERS })
    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String))
    const body = await response.json()
    expect(body).toHaveProperty('data')
    expect(JSON.stringify(body)).not.toContain(foreignMarker)
    expect(harness.getUser).toHaveBeenCalledWith('target-uid')
  })
})

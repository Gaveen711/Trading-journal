import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Hono } from 'hono'
import { createAdminApi } from './_admin.ts'
import { corsMiddleware } from './_middleware.ts'

const VALID_CLAIMS = {
  uid: 'rbGsMM2A2EdhgKLKLf9y0dGJ7RY2',
  email: 'admin@xaujournal.com',
  email_verified: true,
  admin: true,
}

function createStore(initial = {}) {
  const docs = new Map(Object.entries(initial))
  let sequence = 0

  const snapshot = (ref) => {
    const value = docs.get(ref.path)
    return {
      id: ref.id,
      ref,
      exists: value !== undefined,
      data: () => value === undefined ? undefined : { ...value },
      get: (field) => value?.[field],
    }
  }

  const docRef = (path) => ({
    id: path.split('/').pop(),
    path,
    get: async function () { return snapshot(this) },
    set: async function (value, options) {
      docs.set(path, options?.merge ? { ...(docs.get(path) || {}), ...value } : { ...value })
    },
    update: async function (value) {
      if (!docs.has(path)) throw new Error('not found')
      docs.set(path, { ...docs.get(path), ...value })
    },
  })

  const collection = (name) => ({
    doc: (id) => docRef(`${name}/${id || `auto-${++sequence}`}`),
  })

  const batch = () => {
    const operations = []
    return {
      set(ref, value, options) { operations.push(() => ref.set(value, options)); return this },
      update(ref, value) { operations.push(() => ref.update(value)); return this },
      create(ref, value) {
        operations.push(async () => {
          if ((await ref.get()).exists) throw new Error('already exists')
          await ref.set(value)
        })
        return this
      },
      delete(ref) { operations.push(() => docs.delete(ref.path)); return this },
      async commit() { for (const operation of operations) await operation() },
    }
  }

  return {
    docs,
    db: { collection, batch },
  }
}

function createHarness({ claims = VALID_CLAIMS, currentUser = {}, initial = {} } = {}) {
  const store = createStore(initial)
  const verifyIdToken = vi.fn(async () => claims)
  const getUser = vi.fn(async () => ({
    uid: claims.uid,
    email: 'admin@xaujournal.com',
    emailVerified: true,
    disabled: false,
    customClaims: { admin: true },
    ...currentUser,
  }))
  const deps = {
    admin: {
      auth: () => ({
        verifyIdToken,
        getUser,
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn(),
      }),
      firestore: { FieldPath: { documentId: () => '__name__' } },
    },
    db: store.db,
    now: () => 'SERVER_TIMESTAMP',
  }
  return { app: createAdminApi(deps), verifyIdToken, getUser, docs: store.docs }
}

const authHeaders = { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' }

describe('admin authorization', () => {
  it('requires a bearer token', async () => {
    const { app, verifyIdToken } = createHarness()
    const response = await app.request('/settings')
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Authentication required' })
    expect(verifyIdToken).not.toHaveBeenCalled()
  })

  it.each([
    [{ ...VALID_CLAIMS, email_verified: false }, 'unverified email'],
    [{ ...VALID_CLAIMS, uid: 'another-uid' }, 'non-designated UID'],
    [{ ...VALID_CLAIMS, email: 'Admin@xaujournal.com' }, 'non-exact email'],
    [{ ...VALID_CLAIMS, admin: false }, 'missing admin claim'],
  ])('rejects %s', async (claims) => {
    const { app } = createHarness({ claims })
    const response = await app.request('/settings', { headers: authHeaders })
    expect(response.status).toBe(403)
    expect(Object.keys(await response.json())).toEqual(['error'])
  })

  it('checks token revocation and allows only the exact four-factor identity', async () => {
    const { app, verifyIdToken, getUser } = createHarness()
    const response = await app.request('/settings', { headers: authHeaders })
    expect(response.status).toBe(200)
    expect(verifyIdToken).toHaveBeenCalledWith('test-token', true)
    expect(getUser).toHaveBeenCalledWith('rbGsMM2A2EdhgKLKLf9y0dGJ7RY2')
    expect(await response.json()).toEqual({ data: {} })
  })

  it.each([
    [{ disabled: true }, 'disabled'],
    [{ uid: 'another-uid' }, 'non-designated UID'],
    [{ emailVerified: false }, 'unverified'],
    [{ email: 'other@xaujournal.com' }, 'renamed'],
    [{ customClaims: { admin: false } }, 'claim-revoked'],
  ])('rejects a token whose live Firebase user is %s', async (currentUser) => {
    const { app } = createHarness({ currentUser })
    const response = await app.request('/settings', { headers: authHeaders })
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'Admin access denied' })
  })

  it('preserves the contract when mounted at /api/admin', async () => {
    const { app } = createHarness()
    const root = new Hono().basePath('/api')
    root.route('/admin', app)
    const response = await root.request('/api/admin/settings', { headers: authHeaders })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: {} })
  })
})

describe('admin mutations', () => {
  let harness

  beforeEach(() => {
    harness = createHarness()
  })

  it('rejects unknown settings fields without writing', async () => {
    const response = await harness.app.request('/settings', {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Enable maintenance', maintenanceMode: true, serviceAccount: 'secret' }),
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Unsupported field: serviceAccount' })
    expect([...harness.docs.keys()]).toEqual([])
  })

  it('writes an allowlisted setting and the required audit record', async () => {
    const response = await harness.app.request('/settings', {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Scheduled maintenance', maintenanceMode: true }),
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { maintenanceMode: true, updatedAt: 'SERVER_TIMESTAMP' } })

    const audit = [...harness.docs.entries()].find(([path]) => path.startsWith('adminAuditLogs/'))?.[1]
    expect(audit).toMatchObject({
      actor: { uid: 'rbGsMM2A2EdhgKLKLf9y0dGJ7RY2', email: 'admin@xaujournal.com' },
      action: 'settings.update',
      target: { type: 'settings', id: 'platform' },
      reason: 'Scheduled maintenance',
      timestamp: 'SERVER_TIMESTAMP',
    })
  })

  it('refuses to delete a settled payment', async () => {
    harness = createHarness({ initial: { 'payments/pay-1': { status: 'paid', amount: 100 } } })
    const response = await harness.app.request('/payments/pay-1', {
      method: 'DELETE',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Duplicate provider record' }),
    })
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'Settled payment records cannot be deleted' })
    expect(harness.docs.has('payments/pay-1')).toBe(true)
  })

  it('rejects a partial announcement patch that inverts the stored time window', async () => {
    harness = createHarness({
      initial: {
        'announcements/notice-1': {
          title: 'Notice',
          body: 'Scheduled event',
          startsAt: '2026-09-01T10:00:00.000Z',
          endsAt: '2026-09-01T12:00:00.000Z',
        },
      },
    })
    const response = await harness.app.request('/announcements/notice-1', {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Adjust schedule', startsAt: '2026-09-01T13:00:00.000Z' }),
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'endsAt must be after startsAt' })
    expect([...harness.docs.keys()].some((path) => path.startsWith('adminAuditLogs/'))).toBe(false)
  })
})

describe('admin CORS boundary', () => {
  function corsApp() {
    const app = new Hono()
    app.use('*', corsMiddleware)
    app.all('*', (c) => c.json({ ok: true }))
    return app
  }

  it('allows the production admin origin on admin preflights', async () => {
    const response = await corsApp().request('/api/admin/settings', {
      method: 'OPTIONS',
      headers: { Origin: 'https://admin.xaujournal.com', 'Access-Control-Request-Method': 'PATCH' },
    })
    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe('https://admin.xaujournal.com')
    expect(response.headers.get('access-control-allow-headers')).toBe('Authorization, Content-Type')
    expect(response.headers.get('access-control-allow-methods')).toContain('PATCH')
  })

  it('denies that origin outside the admin route and denies other origins on it', async () => {
    const adminOriginOnPublic = await corsApp().request('/api/contact', {
      method: 'OPTIONS', headers: { Origin: 'https://admin.xaujournal.com' },
    })
    expect(adminOriginOnPublic.headers.get('access-control-allow-origin')).toBeNull()

    const foreignOriginOnAdmin = await corsApp().request('/api/admin/settings', {
      method: 'OPTIONS', headers: { Origin: 'https://evil.example' },
    })
    expect(foreignOriginOnAdmin.status).toBe(403)
    expect(await foreignOriginOnAdmin.json()).toEqual({ error: 'Origin not allowed' })
  })
})

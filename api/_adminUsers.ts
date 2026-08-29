import { AdminHttpError } from './_adminErrors.js'
import type { AdminDependencies } from './_admin.js'

const AUTH_PAGE_SIZE = 100
const MAX_USERS_SCANNED = 500

type UserListFilters = {
  limit: number
  pageToken?: string
  search?: string
  plan?: 'free' | 'pro' | 'grace'
  status?: 'active' | 'suspended'
}

type DirectoryCursor = {
  v: 1
  authPageToken?: string
  offset: number
  fingerprint: string
}

function encodeCursor(cursor: DirectoryCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

function decodeCursor(raw: string | undefined, fingerprint: string): DirectoryCursor {
  if (!raw) return { v: 1, offset: 0, fingerprint }
  if (raw.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(raw)) {
    throw new AdminHttpError(400, 'Invalid pageToken', 'INVALID_PAGE_TOKEN')
  }
  try {
    const decoded = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
    if (
      decoded?.v !== 1
      || decoded.fingerprint !== fingerprint
      || !Number.isInteger(decoded.offset)
      || decoded.offset < 0
      || decoded.offset > AUTH_PAGE_SIZE
      || (decoded.authPageToken !== undefined && typeof decoded.authPageToken !== 'string')
      || (typeof decoded.authPageToken === 'string' && (decoded.authPageToken.length > 2048 || /[\u0000-\u001f]/.test(decoded.authPageToken)))
    ) throw new Error('invalid cursor')
    return decoded
  } catch {
    throw new AdminHttpError(400, 'Invalid pageToken', 'INVALID_PAGE_TOKEN')
  }
}

function normalizedText(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function matchesFilters(user: any, userData: Record<string, any>, filters: UserListFilters): boolean {
  const plan = normalizedText(userData.plan) || 'free'
  if (filters.plan && plan !== filters.plan) return false
  if (filters.status && (user.disabled === true ? 'suspended' : 'active') !== filters.status) return false
  if (!filters.search) return true
  const haystack = [
    user.uid,
    user.email,
    user.displayName,
    userData.firstName,
    userData.lastName,
    userData.displayName,
    userData.country,
  ].map(normalizedText).join('\n')
  return haystack.includes(filters.search)
}

/**
 * Firebase Auth has no global contains-search API. This cursor replays at most
 * one Auth page with an offset, then scans at most 500 users per request. A
 * `complete: false` response means more directory pages must be followed before
 * concluding that a global search has no match.
 */
export async function listAdminUsers(
  deps: AdminDependencies,
  filters: UserListFilters,
  serialize: (user: any, userData: Record<string, any>) => Record<string, any>,
) {
  const fingerprint = Buffer.from(JSON.stringify({
    search: filters.search || '',
    plan: filters.plan || '',
    status: filters.status || '',
  }), 'utf8').toString('base64url')
  let cursor = decodeCursor(filters.pageToken, fingerprint)
  let authPageToken = cursor.authPageToken
  let offset = cursor.offset
  let scanned = 0
  const data: Record<string, any>[] = []
  let nextPageToken: string | undefined
  let directoryComplete = false

  while (data.length < filters.limit && scanned < MAX_USERS_SCANNED) {
    const pageStartToken = authPageToken
    const page = await deps.admin.auth().listUsers(AUTH_PAGE_SIZE, pageStartToken)
    const candidates = page.users.slice(offset)
    const remainingBudget = MAX_USERS_SCANNED - scanned
    const inspected = candidates.slice(0, remainingBudget)
    const refs = inspected.map((user: any) => deps.db.collection('users').doc(user.uid))
    const docs = refs.length > 0 ? await deps.db.getAll(...refs) : []
    const byUid = new Map(
      docs.filter((doc: any) => doc.exists).map((doc: any) => [doc.id, doc.data() || {}]),
    )

    for (let index = 0; index < inspected.length; index += 1) {
      const user = inspected[index]
      scanned += 1
      if (!matchesFilters(user, byUid.get(user.uid) || {}, filters)) continue
      data.push(serialize(user, byUid.get(user.uid) || {}))
      if (data.length === filters.limit) {
        const consumedOffset = offset + index + 1
        if (consumedOffset < page.users.length) {
          nextPageToken = encodeCursor({
            v: 1,
            authPageToken: pageStartToken,
            offset: consumedOffset,
            fingerprint,
          })
        } else if (page.pageToken) {
          nextPageToken = encodeCursor({ v: 1, authPageToken: page.pageToken, offset: 0, fingerprint })
        } else {
          directoryComplete = true
        }
        break
      }
    }

    if (data.length === filters.limit) break
    if (inspected.length < candidates.length) {
      nextPageToken = encodeCursor({
        v: 1,
        authPageToken: pageStartToken,
        offset: offset + inspected.length,
        fingerprint,
      })
      break
    }
    if (!page.pageToken) {
      directoryComplete = true
      break
    }
    authPageToken = page.pageToken
    offset = 0
  }

  if (!directoryComplete && !nextPageToken && authPageToken) {
    nextPageToken = encodeCursor({ v: 1, authPageToken, offset, fingerprint })
  }

  return {
    data,
    ...(nextPageToken ? { nextPageToken } : {}),
    meta: {
      searchSemantics: 'bounded_contains_scan',
      scanned,
      scanLimit: MAX_USERS_SCANNED,
      complete: directoryComplete,
    },
  }
}

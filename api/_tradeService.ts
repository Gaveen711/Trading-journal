import { kv } from '@vercel/kv'
// @ts-ignore
import { admin, db, now } from './_firebase.js'
import { isSyncAllowed } from './_auth.js'
import { hashToken } from './_security.js'
import { analyticsUpdate, subtractTradeAnalytics } from '../src/lib/tradeAnalytics.js'
import { computePips, outcomeForPnl } from '../src/lib/goldContract.js'

/**
 * Resolves an API key to a user UID.
 * Utilizes Vercel KV to cache API key resolutions and user subscription check flags.
 */
export async function resolveKey(apiKey: string): Promise<string | null> {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('xau_')) return null

  // Look up and cache by hash, so the plaintext secret is never written to
  // Firestore document ids or to the KV cache.
  const keyId = hashToken(apiKey)
  const apiCacheKey = `auth:apikey:${keyId}`
  let uid = await kv.get<string>(apiCacheKey)

  if (!uid) {
    const doc = await db.collection('apiKeys').doc(keyId).get()
    if (!doc.exists) return null
    uid = doc.data().uid
    if (!uid) return null
    // Cache the API key-to-UID mapping for 24 hours
    await kv.set(apiCacheKey, uid, { ex: 86400 })
  }

  const allowedCacheKey = `auth:sync-allowed:${uid}`
  let isAllowed = await kv.get<boolean>(allowedCacheKey)

  if (isAllowed === null || isAllowed === undefined) {
    const userDoc = await db.collection('users').doc(uid).get()
    isAllowed = isSyncAllowed(userDoc.data())
    // Cache user's sync permission for 10 minutes
    await kv.set(allowedCacheKey, isAllowed, { ex: 600 })
  }

  return isAllowed ? uid : null
}

/**
 * Invalidates the subscription sync allowed cache for a user.
 */
export async function invalidateUserCache(uid: string): Promise<void> {
  await kv.del(`auth:sync-allowed:${uid}`)
}

/**
 * Invalidates the API key cache and subscription cache for a user.
 */
export async function invalidateApiKeyCache(apiKey: string, uid: string): Promise<void> {
  await Promise.all([
    kv.del(`auth:apikey:${apiKey}`),
    kv.del(`auth:sync-allowed:${uid}`)
  ])
}

/**
 * Unified trade open sync helper. Works for MT5 and TradingView.
 */
export async function handleOpenTradeSync(tradeRef: any, payload: any, defaultSource: 'mt5' | 'tradingview') {
  const snap = await tradeRef.get()
  if (snap.exists) return { status: 'duplicate' }

  const source = payload.source || defaultSource
  const isTv = source === 'tradingview'

  await tradeRef.set({
    positionId: payload.positionId,
    openDealTicket: isTv ? null : (payload.ticket || null),
    symbol: payload.symbol,
    direction: String(payload.direction || '').toUpperCase(),
    lots: Number(payload.lots) || 0,
    openPrice: Number(payload.price) || 0,
    openTime: payload.time,
    status: 'open',
    commission: isTv ? 0 : (Number(payload.commission) || 0),
    swap: isTv ? 0 : (Number(payload.swap) || 0),
    comment: payload.comment || '',
    source,
    createdAt: now(),
    updatedAt: now(),
  })

  return { status: 'created', positionId: payload.positionId }
}

/**
 * Unified trade close sync helper. Works for MT5 and TradingView.
 */
export async function handleCloseTradeSync(tradeRef: any, payload: any, defaultSource: 'mt5' | 'tradingview') {
  const brokerPnl = Number(payload.profit) || 0
  const commission = Number(payload.commission) || 0
  const swap = Number(payload.swap) || 0
  const netPnl = brokerPnl + commission + swap
  const closePrice = Number(payload.price) || 0
  const source = payload.source || defaultSource
  const isTv = source === 'tradingview'
  const closeDate = new Date(payload.time || Date.now())
  const date = Number.isNaN(closeDate.getTime())
    ? new Date().toISOString().split('T')[0]
    : closeDate.toISOString().split('T')[0]
  let pips: number | null = null

  await db.runTransaction(async (transaction: any) => {
    const snap = await transaction.get(tradeRef)
    const previous = snap.exists ? snap.data() : null
    const direction = String(previous?.direction || payload.direction || '').toUpperCase()
    const openPrice = Number(previous?.openPrice ?? payload.openPrice)
    if (Number.isFinite(openPrice)) {
      const diff = direction === 'BUY' ? closePrice - openPrice : openPrice - closePrice
      // Shared pip rule (one decimal). This path used to round to integers
      // while manual logging kept a decimal — same move, two stored values.
      pips = computePips(diff)
    }

    const tradeData: any = {
      positionId: payload.positionId,
      symbol: payload.symbol,
      direction,
      lots: Number(payload.lots ?? previous?.lots) || 0,
      closePrice,
      closeTime: payload.time,
      date,
      pnl: brokerPnl,
      commission,
      swap,
      netPnl,
      pips,
      outcome: outcomeForPnl(netPnl),
      status: 'closed',
      source,
      updatedAt: now(),
    }
    if (!previous) {
      tradeData.partial = true
      tradeData.createdAt = now()
    }
    if (!isTv && payload.ticket) tradeData.closeDealTicket = payload.ticket

    const nextTrade = { ...(previous || {}), ...tradeData }
    const delta = subtractTradeAnalytics(previous, nextTrade)
    transaction.set(tradeRef, tradeData, { merge: true })
    if (Object.values(delta).some((value) => value !== 0)) {
      transaction.update(
        tradeRef.parent.parent,
        analyticsUpdate(delta, (value: number) => admin.firestore.FieldValue.increment(value)),
      )
    }
  })

  return { status: 'updated', positionId: payload.positionId, pnl: brokerPnl, pips }
}

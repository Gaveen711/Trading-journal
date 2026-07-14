import { kv } from '@vercel/kv'
// @ts-ignore
import { admin, db, now } from './_firebase.js'
import { isSyncAllowed } from './_auth.js'
import { subtractTradeAnalytics } from '../src/lib/tradeAnalytics.js'

const analyticsIncrements = (delta: Record<string, number>) => Object.fromEntries(
  Object.entries(delta).map(([key, value]) => ['analytics.' + key, admin.firestore.FieldValue.increment(value)])
)

/**
 * Resolves an API key to a user UID.
 * Utilizes Vercel KV to cache API key resolutions and user subscription check flags.
 */
export async function resolveKey(apiKey: string): Promise<string | null> {
  if (!apiKey) return null

  const apiCacheKey = `auth:apikey:${apiKey}`
  let uid = await kv.get<string>(apiCacheKey)

  if (!uid) {
    const doc = await db.collection('apiKeys').doc(apiKey).get()
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
      pips = Math.round(diff / 0.1)
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
      outcome: netPnl > 0.01 ? 'WIN' : netPnl < -0.01 ? 'LOSS' : 'BE',
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
      transaction.update(tradeRef.parent.parent, {
        totalTradesLogged: admin.firestore.FieldValue.increment(delta.tradeCount),
        ...analyticsIncrements(delta),
      })
    }
  })

  return { status: 'updated', positionId: payload.positionId, pnl: brokerPnl, pips }
}

import { chunkedDbGetAll } from './_firestoreUtils.js'
import {
  analyticsDeltaForTrades, analyticsUpdate, subtractTradeAnalytics, tradeAnalyticsDelta,
  sessionAnalyticsDelta, sessionAnalyticsDeltaForTrades, sessionAnalyticsUpdate, subtractSessionAnalytics,
} from '../src/lib/tradeAnalytics.js'

const FIRESTORE_BATCH_WRITE_LIMIT = 450

/** Session deltas are bucketed ({bucket: {counter}}), not flat — accumulate per bucket. */
function addSessionDelta(total: any, delta: any) {
  Object.keys(total).forEach((bucket) => {
    Object.keys(total[bucket]).forEach((key) => { total[bucket][key] += delta[bucket][key] })
  })
}

export function toDateOrNull(value: any): Date | null {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function persistBrokerTrades({
  db, userId, accountId, brokerTrades, timestampFactory, incrementFactory,
}: {
  db: any
  userId: string
  accountId: string
  brokerTrades: any[]
  timestampFactory: () => any
  incrementFactory?: (value: number) => any
}) {
  const tradesRef = db.collection('users').doc(userId).collection('trades')
  const refs = brokerTrades.map((trade: any) => tradesRef.doc('broker_' + accountId + '_' + trade.closeDealTicket))
  const snapshots = await chunkedDbGetAll(db, refs)
  const existingTrades = new Map<string, any>()
  snapshots.forEach((snap: any) => { if (snap.exists) existingTrades.set(snap.id, snap.data()) })

  let newTrades = 0
  let updatedTrades = 0
  const commitPromises = []

  for (let i = 0; i < brokerTrades.length; i += FIRESTORE_BATCH_WRITE_LIMIT) {
    const chunk = brokerTrades.slice(i, i + FIRESTORE_BATCH_WRITE_LIMIT)
    const batch = db.batch()
    const aggregateDelta = analyticsDeltaForTrades([])
    const sessionAggregateDelta = sessionAnalyticsDeltaForTrades([])

    for (const trade of chunk) {
      const tradeDocId = 'broker_' + accountId + '_' + trade.closeDealTicket
      const previous = existingTrades.get(tradeDocId)
      const exists = Boolean(previous)
      const tradeData: any = { ...trade, accountId, syncedAt: timestampFactory(), updatedAt: timestampFactory() }
      // Audit stamp normalizeDeal cannot set (no timestamp factory there). Only
      // accompanies actual session fields — a doc without them gets none invented.
      if (tradeData.sessionEngineVersion !== undefined) tradeData.sessionResolvedAt = timestampFactory()
      if (exists) {
        updatedTrades++
      } else {
        tradeData.createdAt = timestampFactory()
        newTrades++
      }
      batch.set(tradesRef.doc(tradeDocId), tradeData, { merge: true })
      const nextTrade = exists ? { ...previous, ...tradeData } : tradeData
      const delta = exists
        ? subtractTradeAnalytics(previous, nextTrade)
        : tradeAnalyticsDelta(tradeData)
      Object.keys(aggregateDelta).forEach((key) => { aggregateDelta[key] += delta[key] })
      // 'Unknown' is a legitimate aggregate bucket (untimed trades); it is
      // never a stored sessionCode — that comes from resolveSessionAt upstream.
      addSessionDelta(sessionAggregateDelta, exists
        ? subtractSessionAnalytics(previous, nextTrade)
        : sessionAnalyticsDelta(tradeData))
    }

    if (incrementFactory) {
      const hasAggregateChanges = Object.values(aggregateDelta).some((value) => value !== 0)
      // One update per batch: 'analytics.*' and 'sessionAnalytics.buckets.*'
      // dot paths (plus 'totalTradesLogged') cannot collide, and
      // sessionAnalyticsUpdate drops zero counters so an all-zero session
      // delta contributes nothing.
      const userUpdate: any = hasAggregateChanges ? analyticsUpdate(aggregateDelta, incrementFactory) : {}
      Object.assign(userUpdate, sessionAnalyticsUpdate(sessionAggregateDelta, incrementFactory))
      if (Object.keys(userUpdate).length) {
        batch.update(db.collection('users').doc(userId), userUpdate)
      }
    }
    if (chunk.length) commitPromises.push(batch.commit())
  }

  await Promise.all(commitPromises)
  return { newTrades, updatedTrades, totalFetched: brokerTrades.length }
}
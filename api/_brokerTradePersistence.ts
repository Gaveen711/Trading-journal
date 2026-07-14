import { chunkedDbGetAll } from './_firestoreUtils.js'
import { analyticsDeltaForTrades, subtractTradeAnalytics, tradeAnalyticsDelta } from '../src/lib/tradeAnalytics.js'

const FIRESTORE_BATCH_WRITE_LIMIT = 450

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

    for (const trade of chunk) {
      const tradeDocId = 'broker_' + accountId + '_' + trade.closeDealTicket
      const previous = existingTrades.get(tradeDocId)
      const exists = Boolean(previous)
      const tradeData: any = { ...trade, accountId, syncedAt: timestampFactory(), updatedAt: timestampFactory() }
      if (exists) {
        updatedTrades++
      } else {
        tradeData.createdAt = timestampFactory()
        newTrades++
      }
      batch.set(tradesRef.doc(tradeDocId), tradeData, { merge: true })
      const delta = exists
        ? subtractTradeAnalytics(previous, { ...previous, ...tradeData })
        : tradeAnalyticsDelta(tradeData)
      Object.keys(aggregateDelta).forEach((key) => { aggregateDelta[key] += delta[key] })
    }

    const hasAggregateChanges = Object.values(aggregateDelta).some((value) => value !== 0)
    if (hasAggregateChanges && incrementFactory) {
      const update: any = { totalTradesLogged: incrementFactory(aggregateDelta.tradeCount) }
      Object.entries(aggregateDelta).forEach(([key, value]) => {
        update['analytics.' + key] = incrementFactory(value as number)
      })
      batch.update(db.collection('users').doc(userId), update)
    }
    if (chunk.length) commitPromises.push(batch.commit())
  }

  await Promise.all(commitPromises)
  return { newTrades, updatedTrades, totalFetched: brokerTrades.length }
}
import { chunkedDbGetAll } from './_firestoreUtils.js'

const FIRESTORE_BATCH_WRITE_LIMIT = 500

export function toDateOrNull(value: any): Date | null {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function persistBrokerTrades({
  db,
  userId,
  accountId,
  brokerTrades,
  timestampFactory,
}: {
  db: any
  userId: string
  accountId: string
  brokerTrades: any[]
  timestampFactory: () => any
}) {
  const tradesRef = db.collection('users').doc(userId).collection('trades')
  const refs = brokerTrades.map((trade: any) => tradesRef.doc(`broker_${accountId}_${trade.closeDealTicket}`))
  const snapshots = await chunkedDbGetAll(db, refs)
  const existingIds = new Set<string>()

  snapshots.forEach((snap: any) => {
    if (snap.exists) existingIds.add(snap.id)
  })

  let newTrades = 0
  let updatedTrades = 0
  const commitPromises = []

  for (let i = 0; i < brokerTrades.length; i += FIRESTORE_BATCH_WRITE_LIMIT) {
    const chunk = brokerTrades.slice(i, i + FIRESTORE_BATCH_WRITE_LIMIT)
    const batch = db.batch()

    for (const trade of chunk) {
      const tradeDocId = `broker_${accountId}_${trade.closeDealTicket}`
      const exists = existingIds.has(tradeDocId)
      const tradeData: any = {
        ...trade,
        accountId,
        syncedAt: timestampFactory(),
        updatedAt: timestampFactory(),
      }

      if (exists) {
        updatedTrades++
      } else {
        tradeData.createdAt = timestampFactory()
        newTrades++
      }

      batch.set(tradesRef.doc(tradeDocId), tradeData, { merge: true })
    }

    if (chunk.length > 0) {
      commitPromises.push(batch.commit())
    }
  }

  await Promise.all(commitPromises)

  return {
    newTrades,
    updatedTrades,
    totalFetched: brokerTrades.length,
  }
}

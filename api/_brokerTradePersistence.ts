import { chunkedDbGetAll } from './_firestoreUtils.js'

const FIRESTORE_BATCH_WRITE_LIMIT = 450
const numeric = (value: any) => Number(value) || 0

function analyticsDelta(trades: any[]) {
  return trades.reduce((result, trade) => {
    const pnl = numeric(trade.netPnl ?? trade.pnl)
    const outcome = String(trade.outcome || '').toUpperCase()
    const direction = String(trade.direction || '').toUpperCase()
    result.tradeCount += 1
    result.totalPnl += pnl
    result.totalPips += numeric(trade.pips)
    result.wins += outcome === 'WIN' ? 1 : 0
    result.losses += outcome === 'LOSS' ? 1 : 0
    result.breakEven += outcome === 'BE' ? 1 : 0
    result.longs += direction === 'BUY' ? 1 : 0
    result.shorts += direction === 'SELL' ? 1 : 0
    result.grossProfit += pnl > 0 ? pnl : 0
    result.grossLoss += pnl < 0 ? Math.abs(pnl) : 0
    return result
  }, { tradeCount: 0, totalPnl: 0, totalPips: 0, wins: 0, losses: 0, breakEven: 0, longs: 0, shorts: 0, grossProfit: 0, grossLoss: 0 })
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
  const existingIds = new Set<string>()
  snapshots.forEach((snap: any) => { if (snap.exists) existingIds.add(snap.id) })

  let newTrades = 0
  let updatedTrades = 0
  const commitPromises = []

  for (let i = 0; i < brokerTrades.length; i += FIRESTORE_BATCH_WRITE_LIMIT) {
    const chunk = brokerTrades.slice(i, i + FIRESTORE_BATCH_WRITE_LIMIT)
    const batch = db.batch()
    const newlyCreated: any[] = []

    for (const trade of chunk) {
      const tradeDocId = 'broker_' + accountId + '_' + trade.closeDealTicket
      const exists = existingIds.has(tradeDocId)
      const tradeData: any = { ...trade, accountId, syncedAt: timestampFactory(), updatedAt: timestampFactory() }
      if (exists) {
        updatedTrades++
      } else {
        tradeData.createdAt = timestampFactory()
        newlyCreated.push(trade)
        newTrades++
      }
      batch.set(tradesRef.doc(tradeDocId), tradeData, { merge: true })
    }

    if (newlyCreated.length && incrementFactory) {
      const delta = analyticsDelta(newlyCreated)
      const update: any = { totalTradesLogged: incrementFactory(newlyCreated.length) }
      Object.entries(delta).forEach(([key, value]) => { update['analytics.' + key] = incrementFactory(value as number) })
      batch.update(db.collection('users').doc(userId), update)
    }
    if (chunk.length) commitPromises.push(batch.commit())
  }

  await Promise.all(commitPromises)
  return { newTrades, updatedTrades, totalFetched: brokerTrades.length }
}
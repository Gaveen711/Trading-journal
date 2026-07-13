import 'dotenv/config'
import { admin, initAdmin } from '../api/_firebase.js'

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=')
  return [key, rest.length ? rest.join('=') : true]
}))

const apply = args.has('apply')
const mode = String(args.get('mode') || 'all')
const maxUsers = Number(args.get('max-users') || 0)
const startAfterUser = args.get('start-after-user')
const startAfterBrokerPath = args.get('start-after-broker-path')
const PAGE_SIZE = 100

const toNumber = (value) => Number(value) || 0
const emptyAnalytics = () => ({
  version: 1,
  tradeCount: 0,
  totalPnl: 0,
  totalPips: 0,
  wins: 0,
  losses: 0,
  breakEven: 0,
  longs: 0,
  shorts: 0,
  grossProfit: 0,
  grossLoss: 0,
})

function addTrade(analytics, trade) {
  const outcome = String(trade.outcome || '').toUpperCase()
  const direction = String(trade.direction || '').toUpperCase()
  const pnl = toNumber(trade.netPnl ?? trade.pnl)
  analytics.tradeCount += 1
  analytics.totalPnl += pnl
  analytics.totalPips += toNumber(trade.pips)
  analytics.wins += outcome === 'WIN' ? 1 : 0
  analytics.losses += outcome === 'LOSS' ? 1 : 0
  analytics.breakEven += outcome === 'BE' ? 1 : 0
  analytics.longs += direction === 'BUY' ? 1 : 0
  analytics.shorts += direction === 'SELL' ? 1 : 0
  analytics.grossProfit += pnl > 0 ? pnl : 0
  analytics.grossLoss += pnl < 0 ? Math.abs(pnl) : 0
}

async function migrateAnalytics(db) {
  let cursor = startAfterUser ? db.collection('users').doc(String(startAfterUser)) : null
  let inspected = 0
  let migrated = 0
  let skipped = 0
  let lastUserId = null

  while (!maxUsers || inspected < maxUsers) {
    let query = db.collection('users')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(Math.min(PAGE_SIZE, maxUsers ? maxUsers - inspected : PAGE_SIZE))
    if (cursor) query = query.startAfter(cursor)

    const users = await query.get()
    if (users.empty) break

    for (const userDoc of users.docs) {
      inspected += 1
      lastUserId = userDoc.id
      if (userDoc.get('analytics.version') === 1) {
        skipped += 1
        continue
      }

      const analytics = emptyAnalytics()
      const trades = userDoc.ref.collection('trades')
        .select('outcome', 'direction', 'netPnl', 'pnl', 'pips')
        .stream()
      for await (const tradeDoc of trades) addTrade(analytics, tradeDoc.data())

      if (apply) {
        await userDoc.ref.set({
          analytics,
          analyticsBackfilledAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })
      }
      migrated += 1
      console.log((apply ? 'UPDATED' : 'WOULD_UPDATE'), 'user', userDoc.id, analytics.tradeCount, 'trades')
    }

    cursor = users.docs.at(-1)
    if (users.size < PAGE_SIZE) break
  }

  console.log(JSON.stringify({ section: 'analytics', apply, inspected, migrated, skipped, lastUserId }))
}

async function migrateBrokerJobs(db) {
  let cursor = startAfterBrokerPath ? db.doc(String(startAfterBrokerPath)) : null
  let inspected = 0
  let migrated = 0
  let lastBrokerPath = null

  while (true) {
    let query = db.collectionGroup('brokerAccounts')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE)
    if (cursor) query = query.startAfter(cursor)

    const accounts = await query.get()
    if (accounts.empty) break
    const batch = db.batch()
    let writes = 0

    for (const accountDoc of accounts.docs) {
      inspected += 1
      lastBrokerPath = accountDoc.ref.path
      const data = accountDoc.data()
      if (data.isActive !== true) continue
      if (data.syncJobState && data.nextSyncAt) continue
      const update = {
        syncJobState: data.syncJobState || 'queued',
        nextSyncAt: data.nextSyncAt || new Date().toISOString(),
        retryCount: Number(data.retryCount || 0),
        migrationVersion: 1,
      }
      if (apply) batch.set(accountDoc.ref, update, { merge: true })
      writes += 1
      migrated += 1
      console.log((apply ? 'QUEUED' : 'WOULD_QUEUE'), accountDoc.ref.path)
    }

    if (apply && writes) await batch.commit()
    cursor = accounts.docs.at(-1)
    if (accounts.size < PAGE_SIZE) break
  }

  console.log(JSON.stringify({ section: 'brokerJobs', apply, inspected, migrated, lastBrokerPath }))
}

async function main() {
  initAdmin()
  if (!admin.apps.length) {
    throw new Error('Firebase Admin credentials are unavailable. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL.')
  }
  const db = admin.firestore()
  console.log(apply ? 'APPLY MODE: production documents may be updated.' : 'DRY RUN: no documents will be changed.')

  if (mode === 'all' || mode === 'analytics') await migrateAnalytics(db)
  if (mode === 'all' || mode === 'brokers') await migrateBrokerJobs(db)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

import 'dotenv/config'
import { admin, initAdmin } from '../api/_firebase.js'
import { ANALYTICS_VERSION, emptyTradeAnalytics, tradeAnalyticsDelta } from '../src/lib/tradeAnalytics.js'
import { ACCOUNT_CREDENTIAL_FIELDS, deletionPatch } from '../api/_credentialFields.js'

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
      if (userDoc.get('analytics.version') === ANALYTICS_VERSION) {
        skipped += 1
        continue
      }

      const tradesQuery = userDoc.ref.collection('trades')
        .select('status', 'outcome', 'direction', 'type', 'netPnl', 'pnl', 'pips')
      let analytics

      if (apply) {
        const result = await db.runTransaction(async (transaction) => {
          // Reading the user document makes every aggregate-aware trade writer
          // contend with this backfill. Firestore retries the transaction if a
          // trade changes while the complete history is being calculated.
          const currentUser = await transaction.get(userDoc.ref)
          if (currentUser.get('analytics.version') === ANALYTICS_VERSION) {
            return { skipped: true, analytics: currentUser.get('analytics') }
          }

          const tradeSnapshot = await transaction.get(tradesQuery)
          const nextAnalytics = emptyTradeAnalytics()
          tradeSnapshot.docs.forEach((tradeDoc) => {
            const delta = tradeAnalyticsDelta(tradeDoc.data())
            Object.keys(delta).forEach((key) => { nextAnalytics[key] += delta[key] })
          })
          transaction.set(userDoc.ref, {
            analytics: nextAnalytics,
            totalTradesLogged: nextAnalytics.tradeCount,
            analyticsBackfillState: 'complete',
            analyticsBackfilledAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          return { skipped: false, analytics: nextAnalytics }
        })
        if (result.skipped) {
          skipped += 1
          continue
        }
        analytics = result.analytics
      } else {
        analytics = emptyTradeAnalytics()
        const trades = tradesQuery.stream()
        for await (const tradeDoc of trades) {
          const delta = tradeAnalyticsDelta(tradeDoc.data())
          Object.keys(delta).forEach((key) => { analytics[key] += delta[key] })
        }
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
      const alreadyClientManaged = data.credentialStorage === 'client-local'
        && data.syncJobState === 'client-managed'
        && data.nextSyncAt == null
        && !Object.prototype.hasOwnProperty.call(data, 'login')
        && !Object.prototype.hasOwnProperty.call(data, 'password')
        && !Object.prototype.hasOwnProperty.call(data, 'metaApiAccountId')
      if (alreadyClientManaged) continue

      const update = {
        ...deletionPatch(ACCOUNT_CREDENTIAL_FIELDS, () => admin.firestore.FieldValue.delete()),
        credentialStorage: 'client-local',
        syncJobState: 'client-managed',
        nextSyncAt: null,
        retryCount: 0,
        credentialPrivacyVersion: 1,
      }
      if (apply) batch.set(accountDoc.ref, update, { merge: true })
      writes += 1
      migrated += 1
      console.log(apply ? 'CLIENT_MANAGED' : 'WOULD_SET_CLIENT_MANAGED', accountDoc.ref.path)
    }

    if (apply && writes) await batch.commit()
    cursor = accounts.docs.at(-1)
    if (accounts.size < PAGE_SIZE) break
  }

  console.log(JSON.stringify({ section: 'brokerPrivacy', apply, inspected, migrated, lastBrokerPath }))
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

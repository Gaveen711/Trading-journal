import 'dotenv/config'
import { admin, initAdmin } from '../api/_firebase.js'
import {
  USER_CREDENTIAL_FIELDS,
  ACCOUNT_CREDENTIAL_FIELDS,
  deletionPatch as buildDeletionPatch,
} from '../api/_credentialFields.js'

const apply = process.argv.includes('--apply')
const PAGE_SIZE = 200

const ownsAny = (data, fields) => fields.some((field) => Object.prototype.hasOwnProperty.call(data, field))

const deletionPatch = (fields) => buildDeletionPatch(fields, () => admin.firestore.FieldValue.delete())

async function scrubUsers(db) {
  let cursor = null
  let inspected = 0
  let scrubbed = 0

  while (true) {
    let query = db.collection('users')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE)
    if (cursor) query = query.startAfter(cursor)

    const snapshot = await query.get()
    if (snapshot.empty) break
    const batch = db.batch()
    let writes = 0

    for (const userDoc of snapshot.docs) {
      inspected += 1
      if (!ownsAny(userDoc.data(), USER_CREDENTIAL_FIELDS)) continue
      scrubbed += 1
      writes += 1
      if (apply) batch.update(userDoc.ref, deletionPatch(USER_CREDENTIAL_FIELDS))
    }

    if (apply && writes) await batch.commit()
    cursor = snapshot.docs.at(-1)
    if (snapshot.size < PAGE_SIZE) break
  }

  return { inspected, scrubbed }
}

async function scrubBrokerAccounts(db) {
  let cursor = null
  let inspected = 0
  let scrubbed = 0

  while (true) {
    let query = db.collectionGroup('brokerAccounts')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE)
    if (cursor) query = query.startAfter(cursor)

    const snapshot = await query.get()
    if (snapshot.empty) break
    const batch = db.batch()
    let writes = 0

    for (const accountDoc of snapshot.docs) {
      inspected += 1
      const data = accountDoc.data()
      const needsMigration = ownsAny(data, ACCOUNT_CREDENTIAL_FIELDS)
        || data.credentialStorage !== 'client-local'
        || data.syncJobState !== 'client-managed'
        || data.nextSyncAt != null
      if (!needsMigration) continue

      scrubbed += 1
      writes += 1
      if (apply) {
        batch.set(accountDoc.ref, {
          ...deletionPatch(ACCOUNT_CREDENTIAL_FIELDS),
          credentialStorage: 'client-local',
          syncJobState: 'client-managed',
          nextSyncAt: null,
          retryCount: 0,
          credentialPrivacyVersion: 1,
          credentialPrivacyMigratedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })
      }
    }

    if (apply && writes) await batch.commit()
    cursor = snapshot.docs.at(-1)
    if (snapshot.size < PAGE_SIZE) break
  }

  return { inspected, scrubbed }
}

async function main() {
  initAdmin()
  if (!admin.apps.length) {
    throw new Error('Firebase Admin credentials are unavailable.')
  }

  const db = admin.firestore()
  console.log(apply ? 'APPLY MODE: removing legacy broker credential fields.' : 'DRY RUN: no documents will be changed.')
  const users = await scrubUsers(db)
  const brokerAccounts = await scrubBrokerAccounts(db)
  console.log(JSON.stringify({ apply, users, brokerAccounts }))
}

main().catch((error) => {
  // Do not print provider or document payloads from a privacy migration.
  console.error(error?.message || 'Broker credential privacy migration failed.')
  process.exitCode = 1
})
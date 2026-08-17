// api/_firebase.js
// Shared Firebase Admin initializer for all Vercel API routes.
//
// WHY THIS EXISTS:
// Vercel stores env vars as plain strings. The private_key in a service account
// JSON contains real newlines (\n). When stored in Vercel env vars and retrieved,
// those newlines often come back as the literal two-char sequence \n instead of
// an actual newline character. Google's auth client rejects the key as invalid,
// causing "UNAUTHENTICATED" errors from Firestore.
//
// This module normalises the key before initialising the SDK.

import admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps.length > 0) return admin;

  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    let serviceAccount;

    if (raw) {
      // Robust sanitisation for JSON string.
      //
      // Three manglings to undo, in order:
      //   1. A BOM, and surrounding quotes from shell or .env quoting.
      //   2. Escaped inner quotes (\" -> ") \u2014 how the value survives being
      //      stored as a single env string.
      //   3. A backslash followed by a REAL newline. `vercel env pull` writes
      //      the private key this way, and JSON needs the two characters \ and
      //      n, not \ and U+000A \u2014 without this the parse dies inside the PEM
      //      header and local runs fail while production works.
      const sanitized = raw
        .trim()
        .replace(/^\uFEFF/, '')
        .replace(/\\"/g, '"')
        .replace(/\\\r?\n/g, '\\n')
        .replace(/^"(.*)"$/, '$1');
      try {
        serviceAccount = JSON.parse(sanitized);
      } catch (parseErr) {
        console.error('❌ JSON Parse Failed on sanitised string. Trying raw...', parseErr && parseErr.message ? parseErr.message : parseErr);
        serviceAccount = JSON.parse(raw);
      }
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Fallback to individual vars if the main JSON is missing
      serviceAccount = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'xaujournal29',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
      };
    }

    if (serviceAccount) {
      if (serviceAccount.privateKey) serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
      if (serviceAccount.private_key) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

      // No databaseURL: this project uses Firestore, and pointing the SDK at a
      // Realtime Database instance whose rules are not in version control means
      // an unreviewed (possibly test-mode) surface is reachable with admin
      // credentials. Add it back only alongside a database.rules.json.
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialised (Lazy)');
    } else {
      console.error('❌ Firebase Init Error: No credentials found in ENV.');
    }
  } catch (e) {
    console.error('🔥 Firebase Lazy Init Failed:', e.message);
  }
  return admin;
}

// Safe db accessor — returns null if Firebase never initialised.
// Always call isDbReady() before using db.
export function isDbReady() {
  initAdmin();
  return admin.apps.length > 0;
}

let dbInstance = null;

export const db = new Proxy({}, {
  get: (target, prop) => {
    if (!isDbReady()) {
      console.error(`❌ db.${String(prop)} called but Firebase is not initialised.`);
      return undefined;
    }
    if (!dbInstance) {
      dbInstance = admin.firestore();
    }
    return dbInstance[prop];
  }
});

export { admin, initAdmin };

export const now = () => admin.firestore.FieldValue.serverTimestamp();

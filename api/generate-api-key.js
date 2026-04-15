// api/generate-api-key.js
// XAU Journal — Generate a per-user MT5/TradingView sync API key
// Called from the React Settings page with a valid Firebase ID token.
//
// Request:
//   POST /api/generate-api-key
//   Authorization: Bearer <Firebase ID Token>
//
// Response:
//   { apiKey: "xau_..." }   (returns existing key if one already exists)

import admin from 'firebase-admin';
import crypto from 'crypto';

// ── Firebase Admin init ───────────────────────────────────────────────────────
let db;
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  db = admin.firestore();
} catch (e) {
  console.error('Firebase Admin init error:', e.message);
}

const now = () => admin.firestore.FieldValue.serverTimestamp();

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  // Verify Firebase ID token from Authorization header
  const authHeader = req.headers['authorization'] || '';
  const idToken    = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'Missing Authorization header' });

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    // Return existing key if the user already has one
    const existing = await db.collection('apiKeys')
      .where('uid', '==', uid).limit(1).get();

    if (!existing.empty) {
      return res.status(200).json({ apiKey: existing.docs[0].id });
    }

    // Generate a new cryptographically secure key
    const apiKey = 'xau_' + crypto.randomBytes(24).toString('hex');

    await db.collection('apiKeys').doc(apiKey).set({
      uid,
      label:     'MT5/TradingView Sync Key',
      createdAt: now(),
    });

    await db.collection('users').doc(uid).set(
      { mt5SyncEnabled: true, syncKeyCreatedAt: now() },
      { merge: true }
    );

    console.log(`[generate-api-key] New key created for uid=${uid}`);
    return res.status(200).json({ apiKey });
  } catch (err) {
    console.error('[generate-api-key] Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

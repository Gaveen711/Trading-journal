// api/save-trade.js
// xaujournal — Save trade endpoint
// Handles local trade uploads by users.
// Ensures Spark/Free plan users do not exceed the 25-trade limit.

import { admin, db, now } from './_firebase.js';

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://xaujournal.vercel.app',
    'https://www.xaujournal.com',
    'https://xaujournal.com',
    'http://localhost:5173',
  ];
  if (process.env.ALLOWED_ORIGIN) allowedOrigins.push(process.env.ALLOWED_ORIGIN);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const authHeader = req.headers['authorization'] || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'Missing Authorization header' });

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (err) {
    console.error('[save-trade] verifyIdToken failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }

  try {
    const tradeData = req.body;
    if (!tradeData) {
      return res.status(400).json({ error: 'Missing trade data payload' });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    const plan = userDoc.exists ? (userDoc.data().plan || 'free') : 'free';

    if (plan !== 'pro') {
      const tradesSnap = await db.collection('users').doc(uid).collection('trades').count().get();
      if (tradesSnap.data().count >= 25) {
        return res.status(403).json({
          error: 'Free tier limit reached (25 trades). Upgrade to Pro.',
          code: 'resource-exhausted'
        });
      }
    }

    // Execute the trade creation and the trade counter increment in parallel to eliminate a sequential database round-trip.
    const tradeColRef = db.collection('users').doc(uid).collection('trades');
    const newTradeDoc = tradeColRef.doc(); // Pre-generate document reference locally (zero network cost)

    await Promise.all([
      newTradeDoc.set({
        ...tradeData,
        createdAt: now(),
        updatedAt: now()
      }),
      db.collection('users').doc(uid).set({
        totalTradesLogged: admin.firestore.FieldValue.increment(1)
      }, { merge: true })
    ]);

    console.log(`[save-trade] New trade logged for uid=${uid}, tradeId=${newTradeDoc.id}`);
    return res.status(200).json({ id: newTradeDoc.id });
  } catch (err) {
    console.error('[save-trade] Error logging trade:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

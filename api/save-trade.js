// api/save-trade.js
// xaujournal — Save trade endpoint
// Handles local trade uploads by users.
// Ensures Spark/Free plan users do not exceed the 25-trade limit.

import { admin, db, now } from './_firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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

    const tradeRef = await db.collection('users').doc(uid).collection('trades').add({
      ...tradeData,
      createdAt: now(),
      updatedAt: now()
    });

    await db.collection('users').doc(uid).set({
      totalTradesLogged: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    console.log(`[save-trade] New trade logged for uid=${uid}, tradeId=${tradeRef.id}`);
    return res.status(200).json({ id: tradeRef.id });
  } catch (err) {
    console.error('[save-trade] Error logging trade:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

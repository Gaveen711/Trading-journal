import { admin, db } from './_firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !apiKey.startsWith('xau_live_')) {
    return res.status(401).json({ error: 'Missing or invalid API key' });
  }

  // Find user by API key
  const snapshot = await db.collection('users')
    .where('apiKey', '==', apiKey)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return res.status(401).json({ error: 'API key not found' });
  }

  const uid = snapshot.docs[0].id;
  const user = snapshot.docs[0].data();

  if (user.plan !== 'pro') {
    return res.status(403).json({ error: 'EA sync requires Pro plan' });
  }

  // Validate payload
  const trade = req.body;
  const required = ['ticket', 'symbol', 'type', 'lots', 'openPrice', 'closePrice', 'pnl'];
  for (const field of required) {
    if (trade[field] === undefined || trade[field] === null) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  // Prevent duplicate tickets
  const tradeRef = db.doc(`users/${uid}/trades/${trade.ticket}`);
  const existing = await tradeRef.get();
  if (existing.exists) {
    return res.status(200).json({ ok: true, skipped: 'duplicate' });
  }

  // Write trade and update user trade counter in parallel
  await Promise.all([
    tradeRef.set({
      ticket: String(trade.ticket),
      symbol: trade.symbol,
      type: trade.type,
      lots: Number(trade.lots),
      openPrice: Number(trade.openPrice),
      closePrice: Number(trade.closePrice),
      stopLoss: Number(trade.stopLoss || 0),
      takeProfit: Number(trade.takeProfit || 0),
      pnl: Number(trade.pnl),
      commission: Number(trade.commission || 0),
      swap: Number(trade.swap || 0),
      openTime: trade.openTime,
      closeTime: trade.closeTime,
      source: 'mt5_ea',
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
    }),
    db.doc(`users/${uid}`).update({
      totalTradesLogged: admin.firestore.FieldValue.increment(1),
    })
  ]);

  return res.status(200).json({ ok: true, ticket: trade.ticket });
}
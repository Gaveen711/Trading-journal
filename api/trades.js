import { admin, db, initAdmin } from './_firebase.js';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  initAdmin();

  // 1. Get API key from header
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !apiKey.startsWith('xau_live_')) {
    return res.status(401).json({ error: 'Missing or invalid API key' });
  }

  // 2. Find user by API key
  const snapshot = await db.collection('users')
    .where('apiKey', '==', apiKey)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return res.status(401).json({ error: 'API key not found' });
  }

  const uid    = snapshot.docs[0].id;
  const user   = snapshot.docs[0].data();

  // 3. Check Pro plan
  if (user.plan !== 'pro') {
    return res.status(403).json({ error: 'EA sync requires Pro plan' });
  }

  // 4. Validate trade payload
  const trade = req.body;
  const required = ['ticket', 'symbol', 'type', 'lots', 'openPrice', 'closePrice', 'pnl'];
  for (const field of required) {
    if (trade[field] === undefined || trade[field] === null) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  // 5. Only allow XAUUSD (your app's focus)
  if (!trade.symbol.includes('XAUUSD') && !trade.symbol.includes('XAU')) {
    return res.status(200).json({ ok: true, skipped: 'non-XAUUSD trade' });
  }

  // 6. Write trade — use ticket as doc ID to prevent duplicates
  const tradeRef = db.doc(`users/${uid}/trades/${trade.ticket}`);
  const existing = await tradeRef.get();

  if (existing.exists) {
    return res.status(200).json({ ok: true, skipped: 'duplicate ticket' });
  }

  await tradeRef.set({
    ticket:     String(trade.ticket),
    symbol:     trade.symbol,
    type:       trade.type,        // 'BUY' or 'SELL'
    lots:       Number(trade.lots),
    openPrice:  Number(trade.openPrice),
    closePrice: Number(trade.closePrice),
    stopLoss:   Number(trade.stopLoss   || 0),
    takeProfit: Number(trade.takeProfit || 0),
    pnl:        Number(trade.pnl),         // broker P&L — source of truth
    commission: Number(trade.commission  || 0),
    swap:       Number(trade.swap        || 0),
    openTime:   trade.openTime,
    closeTime:  trade.closeTime,
    source:     'mt5_ea',
    syncedAt:   admin.firestore.FieldValue.serverTimestamp(),
  });

  // 7. Increment trade counter
  await db.doc(`users/${uid}`).update({
    totalTradesLogged: admin.firestore.FieldValue.increment(1),
  });

  return res.status(200).json({ ok: true, ticket: trade.ticket });
}

// api/sync-trade.js
// XAU Journal — MT5 EA Sync Endpoint
// Receives trade open/close events from the MT5 Expert Advisor.
// Auth: x-api-key header resolved against Firestore "apiKeys" collection.

import admin from 'firebase-admin';

// ── Firebase Admin init (shared pattern across all api/ handlers) ────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────

async function resolveKey(apiKey) {
  if (!apiKey) return null;
  const doc = await db.collection('apiKeys').doc(apiKey).get();
  if (!doc.exists) return null;
  return doc.data().uid || null;
}

async function handleOpen(tradeRef, payload) {
  const snap = await tradeRef.get();
  if (snap.exists) return { status: 'duplicate' };

  await tradeRef.set({
    positionId:     payload.positionId,
    openDealTicket: payload.ticket || null,
    symbol:         payload.symbol,
    direction:      payload.direction,
    lots:           Number(payload.lots)       || 0,
    openPrice:      Number(payload.price)      || 0,
    openTime:       payload.time,
    status:         'open',
    commission:     Number(payload.commission) || 0,
    swap:           Number(payload.swap)       || 0,
    comment:        payload.comment || '',
    source:         payload.source  || 'mt5',
    createdAt:      now(),
    updatedAt:      now(),
  });

  return { status: 'created', positionId: payload.positionId };
}

async function handleClose(tradeRef, payload) {
  const snap       = await tradeRef.get();
  const brokerPnl  = Number(payload.profit)     || 0;
  const commission = Number(payload.commission) || 0;
  const swap       = Number(payload.swap)       || 0;
  const netPnl     = brokerPnl + commission + swap;

  // XAUUSD pip convention: 1 pip = $0.10
  const PIP_SIZE = 0.1;
  let pips = null;

  if (snap.exists) {
    const openPrice  = snap.data().openPrice || 0;
    const direction  = snap.data().direction || payload.direction;
    const closePrice = Number(payload.price) || 0;
    const diff = direction === 'buy'
      ? closePrice - openPrice
      : openPrice  - closePrice;
    pips = Math.round(diff / PIP_SIZE);

    await tradeRef.update({
      closeDealTicket: payload.ticket || null,
      closePrice:      Number(payload.price) || 0,
      closeTime:       payload.time,
      pnl:             brokerPnl,
      commission,
      swap,
      netPnl,
      pips,
      status:          'closed',
      updatedAt:       now(),
    });
  } else {
    // EA installed after trade opened — create a partial record
    await tradeRef.set({
      positionId:      payload.positionId,
      closeDealTicket: payload.ticket || null,
      symbol:          payload.symbol,
      direction:       payload.direction,
      lots:            Number(payload.lots)  || 0,
      closePrice:      Number(payload.price) || 0,
      closeTime:       payload.time,
      pnl:             brokerPnl,
      commission,
      swap,
      netPnl,
      status:          'closed',
      partial:         true,
      source:          payload.source || 'mt5',
      createdAt:       now(),
      updatedAt:       now(),
    });
  }

  return { status: 'updated', positionId: payload.positionId, pnl: brokerPnl, pips };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  const apiKey = req.headers['x-api-key'] || req.body?.apiKey;
  const uid    = await resolveKey(apiKey);
  if (!uid) return res.status(403).json({ error: 'Invalid API key' });

  const { event, positionId, symbol } = req.body;
  if (!event || !positionId || !symbol)
    return res.status(400).json({ error: 'Missing: event, positionId, symbol' });

  const tradeRef = db
    .collection('users').doc(uid)
    .collection('trades').doc(`pos_${positionId}`);

  let result;
  try {
    if      (event === 'open')  result = await handleOpen(tradeRef, req.body);
    else if (event === 'close') result = await handleClose(tradeRef, req.body);
    else return res.status(400).json({ error: `Unknown event: ${event}` });
  } catch (err) {
    console.error('[sync-trade] Firestore error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }

  console.log(`[sync-trade] uid=${uid} event=${event} pos=${positionId}`, result);
  return res.status(200).json(result);
}

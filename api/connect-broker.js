/* eslint-env node */
/* global process */
// POST /api/connect-broker — MetaApi MT4/MT5 login (Pro only)

import { admin, db, now } from './_firebase.js';
import { provisionMetaApiAccount, fetchMetaApiDeals } from './metaapi-broker.js';

function isSyncAllowed(userData) {
  const { plan, planExpiry, graceUntil } = userData || {};
  const nowMs = Date.now();
  if (plan === 'pro' && planExpiry && new Date(planExpiry).getTime() > nowMs) return true;
  if (graceUntil && new Date(graceUntil).getTime() > nowMs) return true;
  return false;
}

function encryptCredential(text) {
  return Buffer.from(text).toString('base64');
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
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

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return res.status(401).json({ error: 'Missing Authorization header' });

  let uid;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { server, accountId, password, platform = 'mt5' } = req.body || {};
  if (!server || !accountId || !password) {
    return res.status(400).json({ error: 'Missing server, accountId, or password' });
  }

  const brokerType = platform === 'mt4' ? 'mt4' : 'mt5';

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};
    if (!isSyncAllowed(userData)) {
      return res.status(403).json({
        error: 'Pro subscription required',
        message: 'Broker connect is a Pro feature.',
      });
    }

    const metaApiAccountId = await provisionMetaApiAccount({
      login: accountId,
      password,
      server,
      brokerType,
    });

    const deals = await fetchMetaApiDeals(metaApiAccountId);

    const brokerRef = db.collection('users').doc(uid).collection('brokerAccounts').doc();
    await brokerRef.set({
      id: brokerRef.id,
      accountName: `${server} · ${accountId}`,
      brokerType,
      server,
      login: String(accountId),
      encryptedPassword: encryptCredential(password),
      metaApiAccountId,
      isActive: true,
      lastSyncTime: now(),
      lastSyncStatus: 'success',
      tradeCount: deals.length,
      createdAt: now(),
      updatedAt: now(),
    });

    const tradesRef = db.collection('users').doc(uid).collection('trades');
    const batch = db.batch();
    let stored = 0;
    for (const trade of deals) {
      const tradeDocId = `broker_${brokerRef.id}_${trade.closeDealTicket}`;
      batch.set(tradesRef.doc(tradeDocId), { ...trade, accountId: brokerRef.id, syncedAt: now(), createdAt: now(), updatedAt: now() }, { merge: true });
      stored++;
    }
    if (stored > 0) await batch.commit();

    return res.status(200).json({
      message: `Connected to ${server}. Synced ${deals.length} closed deal(s).`,
      accountId: brokerRef.id,
      metaApiAccountId,
      tradeCount: deals.length,
    });
  } catch (err) {
    console.error('[connect-broker]', err.message);
    const msg = err.message || 'Failed to connect broker';
    if (/invalid|auth|credential|password|login/i.test(msg)) {
      return res.status(401).json({ error: 'Invalid broker credentials. Check login, password, and server name.' });
    }
    return res.status(500).json({ error: msg });
  }
}

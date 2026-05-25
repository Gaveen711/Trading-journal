/**
 * Firebase Cloud Functions — MetaApi broker sync
 * Secret: firebase functions:secrets:set META_API_TOKEN
 * Local emulator: functions/.env  META_API_TOKEN=...
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const MetaApi = require('metaapi.cloud-sdk').default;

initializeApp();
const db = getFirestore();

setGlobalOptions({ region: 'asia-southeast1', maxInstances: 10 });

/** Bound at deploy time — never commit the token to git */
const metaApiTokenSecret = defineSecret('META_API_TOKEN');

function requireAuth(request) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.');
  return uid;
}

function getMetaApi() {
  const token = metaApiTokenSecret.value();
  if (!token) {
    throw new HttpsError(
      'failed-precondition',
      'META_API_TOKEN is not set. Run: firebase functions:secrets:set META_API_TOKEN'
    );
  }
  return new MetaApi(token);
}

function getTradingSession(date) {
  if (!date) return 'London';
  const hour = date.getUTCHours();
  if (hour >= 13 && hour < 22) return 'NewYork';
  if (hour >= 8 && hour < 13) return 'London';
  if (hour >= 22 || hour < 8) {
    if (hour >= 22 || hour < 0) return 'Sydney';
    return 'Tokyo';
  }
  return 'London';
}

/** Map MetaApi deal → xaujournal trade document */
function dealToTrade(deal, entryDeal = null) {
  const isBuy = entryDeal
    ? entryDeal.type === 'DEAL_TYPE_BUY'
    : deal.type === 'DEAL_TYPE_SELL';

  const closeTime = deal.time ? new Date(deal.time) : new Date();
  const openTime = entryDeal ? entryDeal.time : null;
  const openTimeDate = openTime ? new Date(openTime) : null;

  const openPrice = entryDeal ? Number(entryDeal.price) : null;
  const closePrice = Number(deal.price ?? 0);

  const pnl = Number(deal.profit ?? 0);
  const commission = Number(deal.commission ?? 0);
  const swap = Number(deal.swap ?? 0);
  const netPnl = pnl + commission + swap;

  const session = getTradingSession(openTimeDate);

  return {
    positionId: String(deal.positionId),
    symbol: deal.symbol || 'XAUUSD',
    type: isBuy ? 'buy' : 'sell',
    direction: isBuy ? 'BUY' : 'SELL',
    volume: Number(deal.volume ?? 0),
    lots: Number(deal.volume ?? 0),
    openPrice,
    closePrice,
    entry: openPrice ?? closePrice,
    exit: closePrice,
    profit: pnl,
    pnl,
    commission,
    swap,
    netPnl,
    openTime,
    closeTime: deal.time,
    date: closeTime.toISOString().split('T')[0],
    outcome: netPnl > 0.01 ? 'WIN' : netPnl < -0.01 ? 'LOSS' : 'BE',
    market: 'GOLD',
    source: 'metaapi',
    synced: true,
    status: 'closed',
    session,
  };
}

// ─── Shared sync logic ───────────────────────────────────────────────────────
async function syncTrades(uid, account) {
  const connection = account.getRPCConnection();
  await connection.connect();
  await connection.waitSynchronized();

  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 90);

  const history = await connection.getDealsByTimeRange(startTime, new Date());
  const rawDeals = Array.isArray(history) ? history : history?.deals ?? [];

  const entryDeals = {};
  for (const d of rawDeals) {
    if (d.entryType === 'DEAL_ENTRY_IN' || d.entryType === 'DEAL_ENTRY_INOUT') {
      entryDeals[d.positionId] = d;
    }
  }

  const deals = rawDeals.filter(
    (d) =>
      (d.type === 'DEAL_TYPE_BUY' || d.type === 'DEAL_TYPE_SELL') &&
      (d.entryType === 'DEAL_ENTRY_OUT' || d.entryType === undefined)
  );

  const batch = db.batch();
  let newCount = 0;

  for (const deal of deals) {
    if (deal.entryType && deal.entryType !== 'DEAL_ENTRY_OUT') continue;

    const tradeRef = db
      .collection('users')
      .doc(uid)
      .collection('trades')
      .doc(String(deal.positionId));

    const snap = await tradeRef.get();
    if (snap.exists) continue;

    const entryDeal = entryDeals[deal.positionId] || null;
    const trade = dealToTrade(deal, entryDeal);
    batch.set(tradeRef, {
      ...trade,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    newCount++;
  }

  if (newCount > 0) await batch.commit();

  try {
    await connection.close();
  } catch {
    /* ignore */
  }

  await db.collection('users').doc(uid).set(
    {
      lastBrokerSync: FieldValue.serverTimestamp(),
      lastBrokerSyncCount: newCount,
      lastBrokerSyncStatus: 'success'
    },
    { merge: true }
  );

  return newCount;
}

// ─── 1. CONNECT BROKER ───────────────────────────────────────────────────────
exports.connectBroker = onCall(
  { secrets: [metaApiTokenSecret], timeoutSeconds: 540, memory: '1GiB' },
  async (request) => {
    const uid = requireAuth(request);
    const { server, accountId, password, platform = 'mt5' } = request.data || {};

    if (!server || !accountId || !password) {
      throw new HttpsError('invalid-argument', 'Missing server, accountId, or password.');
    }

    const api = getMetaApi();
    const provisioningApi = api.metatraderAccountApi;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const existingMetaApiId = userDoc.data()?.metaApiAccountId;

    let account;

    try {
      if (existingMetaApiId) {
        account = await provisioningApi.getAccount(existingMetaApiId);
        if (account.state !== 'DEPLOYED') await account.deploy();
      } else {
        account = await provisioningApi.createAccount({
          name: `XAUJournal-${uid}`,
          type: 'cloud',
          login: String(accountId),
          password,
          server,
          platform: platform === 'mt4' ? 'mt4' : 'mt5',
          application: 'MetaApi',
          magic: 0,
        });

        await account.deploy();

        await userRef.set(
          {
            metaApiAccountId: account.id,
            brokerServer: server,
            brokerPlatform: platform,
            brokerLogin: String(accountId),
          },
          { merge: true }
        );
      }

      await account.waitConnected(120);

      const count = await syncTrades(uid, account);

      return {
        message: `Broker connected and ${count} new trade(s) synced successfully.`,
        tradeCount: count,
        metaApiAccountId: account.id,
      };
    } catch (err) {
      console.error('[connectBroker]', err);
      try {
        await userRef.set(
          { lastBrokerSyncStatus: 'failed' },
          { merge: true }
        );
      } catch (dbErr) {
        console.error('Failed to set failure status in Firestore:', dbErr);
      }
      const msg = err.message || 'Failed to connect broker';
      if (/invalid|auth|credential|password|login/i.test(msg)) {
        throw new HttpsError('unauthenticated', 'Invalid broker credentials.');
      }
      throw new HttpsError('internal', msg);
    }
  }
);

// ─── 2. SYNC TRADES ─────────────────────────────────────────────────────────
exports.syncBrokerTrades = onCall(
  { secrets: [metaApiTokenSecret], timeoutSeconds: 300, memory: '512MiB' },
  async (request) => {
    const uid = requireAuth(request);

    const userDoc = await db.collection('users').doc(uid).get();
    const metaApiAccountId = userDoc.data()?.metaApiAccountId;
    if (!metaApiAccountId) {
      throw new HttpsError('failed-precondition', 'No broker connected. Use Connect first.');
    }

    try {
      const api = getMetaApi();
      const account = await api.metatraderAccountApi.getAccount(metaApiAccountId);
      await account.waitConnected(120);

      const count = await syncTrades(uid, account);
      return { message: `Synced ${count} new trade(s).`, tradeCount: count, newTrades: count };
    } catch (err) {
      console.error('[syncBrokerTrades]', err);
      try {
        await db.collection('users').doc(uid).set(
          { lastBrokerSyncStatus: 'failed' },
          { merge: true }
        );
      } catch (dbErr) {
        console.error('Failed to set sync error in Firestore:', dbErr);
      }
      throw new HttpsError('internal', err.message || 'Sync failed');
    }
  }
);

// ─── 3. DISCONNECT BROKER ───────────────────────────────────────────────────
exports.disconnectBroker = onCall(
  { secrets: [metaApiTokenSecret], timeoutSeconds: 60, memory: '256MiB' },
  async (request) => {
    const uid = requireAuth(request);
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const metaApiAccountId = userDoc.data()?.metaApiAccountId;

    if (metaApiAccountId) {
      try {
        const api = getMetaApi();
        await api.metatraderAccountApi.removeAccount(metaApiAccountId);
      } catch (err) {
        console.error(`Failed to delete MetaApi account ${metaApiAccountId}:`, err.message || err);
      }
    }

    await userRef.update({
      metaApiAccountId: FieldValue.delete(),
      brokerServer: FieldValue.delete(),
      brokerPlatform: FieldValue.delete(),
      brokerLogin: FieldValue.delete(),
      lastBrokerSyncStatus: FieldValue.delete(),
    });

    return { message: 'Broker account disconnected successfully.' };
  }
);

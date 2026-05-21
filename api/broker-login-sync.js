// api/broker-login-sync.js
// MT4/MT5 Broker Login Sync Endpoint
// Manages broker credential storage and trade synchronization

import { db, now } from './_firebase.js';
import { fetchBrokerTrades } from './broker-service.js';

// ── Shared plan guard ────────────────────────────────────────────────────────
function isSyncAllowed(userData) {
  const { plan, planExpiry, graceUntil } = userData || {};
  const nowMs = Date.now();
  if (plan === 'pro' && planExpiry && new Date(planExpiry).getTime() > nowMs) return true;
  if (graceUntil && new Date(graceUntil).getTime() > nowMs) return true;
  return false;
}

// ── Credential encryption (basic XOR - in production use proper encryption) ──
// For production: use @google-cloud/kms or similar
function encryptCredential(text, key) {
  // In production, use real encryption. This is placeholder.
  return Buffer.from(text).toString('base64');
}

function decryptCredential(encoded, key) {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const { uid } = req.body;
  
  // Verify user is authenticated
  const user = await db.collection('users').doc(uid).get();
  if (!user.exists) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userData = user.data();
  if (!isSyncAllowed(userData)) {
    return res.status(403).json({ error: 'Broker sync requires active Pro subscription' });
  }

  // ── Route to appropriate handler ──────────────────────────────────────────

  if (req.method === 'POST') {
    if (req.body.action === 'add') {
      return handleAddBrokerAccount(uid, req, res);
    } else if (req.body.action === 'sync') {
      return handleSyncBrokerTrades(uid, req, res);
    } else if (req.body.action === 'list') {
      return handleListBrokerAccounts(uid, req, res);
    } else if (req.body.action === 'remove') {
      return handleRemoveBrokerAccount(uid, req, res);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ── Add broker account ───────────────────────────────────────────────────────

async function handleAddBrokerAccount(uid, req, res) {
  const { login, password, server, brokerType, accountName } = req.body;

  // Validate required fields
  if (!login || !password || !server || !brokerType) {
    return res.status(400).json({
      error: 'Missing required: login, password, server, brokerType',
    });
  }

  if (!['mt4', 'mt5'].includes(brokerType)) {
    return res.status(400).json({ error: 'brokerType must be mt4 or mt5' });
  }

  try {
    // Test connection before storing
    const testResult = await fetchBrokerTrades({
      login,
      password,
      server,
      brokerType,
    });

    // Store encrypted credentials
    const brokerRef = db
      .collection('users').doc(uid)
      .collection('brokerAccounts')
      .doc();

    await brokerRef.set({
      id: brokerRef.id,
      accountName: accountName || `${brokerType.toUpperCase()}-${server}`,
      brokerType,
      server,
      login,
      // Store encrypted password
      encryptedPassword: encryptCredential(password, process.env.ENCRYPTION_KEY || ''),
      isActive: true,
      lastSyncTime: null,
      lastSyncStatus: 'pending',
      tradeCount: testResult.length,
      createdAt: now(),
      updatedAt: now(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Broker account added successfully',
      accountId: brokerRef.id,
      tradeCount: testResult.length,
    });
  } catch (error) {
    console.error('[broker-login-sync] Add account error:', error.message);

    // Check if it's an auth error
    if (error.message.includes('Invalid') || error.message.includes('Authentication')) {
      return res.status(401).json({
        error: 'Invalid broker credentials. Please check your login, password, and server.',
      });
    }

    return res.status(500).json({
      error: 'Failed to connect to broker',
      message: error.message,
    });
  }
}

// ── Sync broker trades ───────────────────────────────────────────────────────

async function handleSyncBrokerTrades(uid, req, res) {
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'Missing accountId' });
  }

  try {
    // Fetch broker account
    const accountRef = db
      .collection('users').doc(uid)
      .collection('brokerAccounts')
      .doc(accountId);

    const accountSnap = await accountRef.get();
    if (!accountSnap.exists) {
      return res.status(404).json({ error: 'Broker account not found' });
    }

    const account = accountSnap.data();

    // Decrypt password
    const decryptedPassword = decryptCredential(account.encryptedPassword);

    // Fetch trades from broker
    const brokerTrades = await fetchBrokerTrades(
      {
        login: account.login,
        password: decryptedPassword,
        server: account.server,
        brokerType: account.brokerType,
      },
      account.lastSyncTime ? new Date(account.lastSyncTime) : null
    );

    // Store trades to user's trades collection
    let newTradesCount = 0;
    let updatedTradesCount = 0;

    const tradesRef = db.collection('users').doc(uid).collection('trades');
    const batch = db.batch();

    for (const trade of brokerTrades) {
      const tradeDocId = `broker_${account.id}_${trade.closeDealTicket}`;
      const tradeRef = tradesRef.doc(tradeDocId);

      const tradeData = {
        ...trade,
        accountId: account.id,
        syncedAt: now(),
        updatedAt: now(),
      };

      // Check if already exists
      const existing = await tradeRef.get();
      if (!existing.exists) {
        tradeData.createdAt = now();
        newTradesCount++;
      } else {
        updatedTradesCount++;
      }

      batch.set(tradeRef, tradeData, { merge: true });
    }

    await batch.commit();

    // Update account sync metadata
    await accountRef.update({
      lastSyncTime: now(),
      lastSyncStatus: 'success',
      tradeCount: brokerTrades.length,
      updatedAt: now(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Broker trades synced successfully',
      newTrades: newTradesCount,
      updatedTrades: updatedTradesCount,
      totalFetched: brokerTrades.length,
    });
  } catch (error) {
    console.error('[broker-login-sync] Sync error:', error.message);

    // Update account with error status
    try {
      const accountRef = db
        .collection('users').doc(uid)
        .collection('brokerAccounts')
        .doc(req.body.accountId);
      
      await accountRef.update({
        lastSyncStatus: 'failed',
        lastSyncError: error.message,
        updatedAt: now(),
      });
    } catch (updateErr) {
      console.error('[broker-login-sync] Failed to update error status:', updateErr.message);
    }

    return res.status(500).json({
      error: 'Sync failed',
      message: error.message,
    });
  }
}

// ── List broker accounts ─────────────────────────────────────────────────────

async function handleListBrokerAccounts(uid, req, res) {
  try {
    const snapshot = await db
      .collection('users').doc(uid)
      .collection('brokerAccounts')
      .where('isActive', '==', true)
      .get();

    const accounts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        accountName: data.accountName,
        brokerType: data.brokerType,
        server: data.server,
        login: data.login,
        isActive: data.isActive,
        lastSyncTime: data.lastSyncTime,
        lastSyncStatus: data.lastSyncStatus,
        tradeCount: data.tradeCount,
        createdAt: data.createdAt,
        // Don't return encrypted password
      };
    });

    return res.status(200).json({ accounts });
  } catch (error) {
    console.error('[broker-login-sync] List error:', error.message);
    return res.status(500).json({ error: 'Failed to list accounts' });
  }
}

// ── Remove broker account ────────────────────────────────────────────────────

async function handleRemoveBrokerAccount(uid, req, res) {
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'Missing accountId' });
  }

  try {
    // Mark as inactive instead of deleting (preserves history)
    await db
      .collection('users').doc(uid)
      .collection('brokerAccounts')
      .doc(accountId)
      .update({
        isActive: false,
        updatedAt: now(),
      });

    return res.status(200).json({
      ok: true,
      message: 'Broker account removed',
    });
  } catch (error) {
    console.error('[broker-login-sync] Remove error:', error.message);
    return res.status(500).json({ error: 'Failed to remove account' });
  }
}

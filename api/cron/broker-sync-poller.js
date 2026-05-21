// api/cron/broker-sync-poller.js
// Periodic broker trade sync (runs every 60 seconds)
// Syncs trades from all active broker accounts for all users

import { db } from '../_firebase.js';
import { fetchBrokerTrades } from '../broker-service.js';

function decryptCredential(encoded) {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export default async function handler(req, res) {
  // Verify cron secret
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[broker-sync-poller] Starting scheduled broker sync...');

  let totalUsers = 0;
  let totalAccounts = 0;
  let successfulSyncs = 0;
  let failedSyncs = 0;

  try {
    // Get all users with active broker accounts
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data();

      // Check if user has active subscription
      const nowMs = Date.now();
      const isPro = userData.plan === 'pro' && 
                    userData.planExpiry && 
                    new Date(userData.planExpiry).getTime() > nowMs;
      const isGrace = userData.graceUntil && 
                      new Date(userData.graceUntil).getTime() > nowMs;

      if (!isPro && !isGrace) {
        continue; // Skip users without active subscriptions
      }

      totalUsers++;

      // Get all active broker accounts for this user
      const accountsSnapshot = await db
        .collection('users').doc(uid)
        .collection('brokerAccounts')
        .where('isActive', '==', true)
        .get();

      for (const accountDoc of accountsSnapshot.docs) {
        const account = accountDoc.data();
        const accountId = accountDoc.id;
        totalAccounts++;

        try {
          // Skip if synced recently (within 30 seconds)
          if (account.lastSyncTime) {
            const lastSync = new Date(account.lastSyncTime).getTime();
            const timeSinceSync = Date.now() - lastSync;
            if (timeSinceSync < 30000) {
              console.log(`[broker-sync-poller] Skipping ${accountId} - recently synced`);
              continue;
            }
          }

          // Decrypt password
          const password = decryptCredential(account.encryptedPassword);

          // Fetch trades from broker
          const brokerTrades = await fetchBrokerTrades(
            {
              login: account.login,
              password,
              server: account.server,
              brokerType: account.brokerType,
            },
            account.lastSyncTime ? new Date(account.lastSyncTime) : null
          );

          // Store trades
          const tradesRef = db.collection('users').doc(uid).collection('trades');
          const batch = db.batch();

          let newCount = 0;
          for (const trade of brokerTrades) {
            const tradeDocId = `broker_${accountId}_${trade.closeDealTicket}`;
            const tradeRef = tradesRef.doc(tradeDocId);
            const existing = await tradeRef.get();

            if (!existing.exists) {
              newCount++;
            }

            batch.set(tradeRef, {
              ...trade,
              accountId,
              syncedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...(existing.exists ? {} : { createdAt: new Date().toISOString() }),
            }, { merge: true });
          }

          await batch.commit();

          // Update account metadata
          const accountRef = db
            .collection('users').doc(uid)
            .collection('brokerAccounts')
            .doc(accountId);

          await accountRef.update({
            lastSyncTime: new Date().toISOString(),
            lastSyncStatus: 'success',
            tradeCount: brokerTrades.length,
            updatedAt: new Date().toISOString(),
          });

          console.log(`[broker-sync-poller] ✓ Synced ${newCount} new trades for ${accountId}`);
          successfulSyncs++;
        } catch (error) {
          console.error(`[broker-sync-poller] ✗ Failed to sync ${accountId}:`, error.message);
          
          // Update account with error status
          try {
            const accountRef = db
              .collection('users').doc(uid)
              .collection('brokerAccounts')
              .doc(accountId);

            await accountRef.update({
              lastSyncStatus: 'failed',
              lastSyncError: error.message,
              updatedAt: new Date().toISOString(),
            });
          } catch (updateErr) {
            console.error('[broker-sync-poller] Failed to update error status:', updateErr.message);
          }

          failedSyncs++;
        }
      }
    }

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      usersProcessed: totalUsers,
      accountsProcessed: totalAccounts,
      successfulSyncs,
      failedSyncs,
    };

    console.log('[broker-sync-poller] Completed:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[broker-sync-poller] Fatal error:', error.message);
    return res.status(500).json({
      error: 'Cron job failed',
      message: error.message,
    });
  }
}

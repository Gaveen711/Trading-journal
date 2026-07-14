// src/hooks/useBrokerAccounts.js
// Broker credentials are sent once to provision the server-managed MetaApi account.
// Only non-sensitive account metadata is retained in local storage.

import { useState, useEffect, useMemo } from 'react';
import { auth } from '../firebase';
import { FirebaseBrokerRepository } from '../data/repositories/FirebaseBrokerRepository';

const toIsoString = (value) => {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export function useBrokerAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const repository = useMemo(() => new FirebaseBrokerRepository(), []);

  useEffect(() => {
    let unsubscribeUser = null;
    let unsubscribeAccounts = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeAccounts) unsubscribeAccounts();
      unsubscribeUser = null;
      unsubscribeAccounts = null;

      if (!user) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      let userData = {};
      let serverAccounts = [];
      setLoading(true);
      setError(null);

      const publishAccounts = () => {
        try {
          const localSaved = localStorage.getItem(`xau-broker-accounts-${user.uid}`);
          const localList = localSaved ? JSON.parse(localSaved) : [];
          const localById = new Map(localList.map((account) => [account.id, account]));
          const managed = serverAccounts.map((account) => ({
            ...(localById.get(account.id) || {}),
            ...account,
            platform: account.brokerType || account.platform,
            managedByWorker: true,
            requiresReconnect: false,
            lastSyncTime: toIsoString(account.lastSyncTime),
            lastSyncStatus: account.lastSyncStatus || account.syncJobState || 'queued',
            lastSyncError: account.lastSyncError || null,
            tradeCount: Number(account.tradeCount || 0),
            isActive: account.isActive !== false,
          }));
          const legacy = localList.filter((account) => account.managedByWorker !== true).map((account) => ({
            ...account,
            managedByWorker: false,
            requiresReconnect: true,
            lastSyncTime: toIsoString(userData.lastBrokerSync),
            lastSyncStatus: userData.lastBrokerSyncStatus || 'unknown',
            lastSyncError: userData.lastBrokerSyncError || null,
            tradeCount: Number(userData.lastBrokerSyncCount || 0),
            isActive: true,
          }));
          setAccounts([...managed, ...legacy]);
        } catch (parseError) {
          console.error('Failed to parse local broker accounts:', parseError);
          setAccounts(serverAccounts.map((account) => ({
            ...account,
            platform: account.brokerType || account.platform,
            managedByWorker: true,
            requiresReconnect: false,
            lastSyncTime: toIsoString(account.lastSyncTime),
            isActive: account.isActive !== false,
          })));
        }
      };

      unsubscribeUser = repository.subscribeToUserDoc(
        user.uid,
        (docSnap) => {
          userData = docSnap.exists() ? docSnap.data() : {};
          publishAccounts();
        },
        (snapshotError) => {
          console.error('Failed to listen to legacy broker stats:', snapshotError);
        },
      );

      unsubscribeAccounts = repository.subscribeToAccounts(
        user.uid,
        (nextAccounts) => {
          serverAccounts = nextAccounts;
          publishAccounts();
          setLoading(false);
        },
        (snapshotError) => {
          setError(snapshotError.message);
          console.error('Failed to listen to broker accounts:', snapshotError);
          publishAccounts();
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeAccounts) unsubscribeAccounts();
    };
  }, [repository]);

  async function addAccount(login, password, server, brokerType, accountName) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      // Provision a durable server-managed account and perform the initial sync.
      const result = await repository.connectBroker({
        accountId: login,
        password,
        server,
        platform: brokerType,
      });

      // Save configurations strictly on the client side (localStorage) WITHOUT credentials
      const localKey = `xau-broker-accounts-${user.uid}`;

      // We only support one connected account for now
      const newAccount = {
        id: result.accountId,
        accountName,
        platform: brokerType,
        server,
        login,
        managedByWorker: true,
      };

      localStorage.setItem(localKey, JSON.stringify([newAccount]));

      // Trigger a state reload
      setAccounts([
        {
          ...newAccount,
          requiresReconnect: false,
          isActive: true,
          lastSyncTime: new Date().toISOString(),
          lastSyncStatus: 'success',
          tradeCount: result.tradeCount || 0,
        }
      ]);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function syncAccount(accountId) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const acc = accounts.find((account) => account.id === accountId);
      if (!acc) throw new Error('Broker account not found.');

      if (acc.managedByWorker !== true) {
        throw new Error('Reconnect this broker account once to enable secure background sync.');
      }

      const result = await repository.syncBrokerTrades({ accountId: acc.id });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function removeAccount(accountId) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const localKey = `xau-broker-accounts-${user.uid}`;
      const localSaved = localStorage.getItem(localKey);
      const localList = localSaved ? JSON.parse(localSaved) : [];
      const account = accounts.find((item) => item.id === accountId);
      const result = account?.managedByWorker === true
        ? await repository.disconnectBroker(accountId)
        : { message: 'Legacy broker account removed locally.' };

      const remainingLocal = localList.filter((item) => item.id !== accountId);
      if (remainingLocal.length) localStorage.setItem(localKey, JSON.stringify(remainingLocal));
      else localStorage.removeItem(localKey);

      setAccounts((current) => current.filter((item) => item.id !== accountId));

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  return {
    accounts,
    loading,
    error,
    addAccount,
    syncAccount,
    removeAccount,
  };
}


// src/hooks/useBrokerAccounts.js
// Hook for managing broker sync accounts via local storage (client-side only credentials)
// and checking sync stats from Firestore profile metadata

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  connectBrokerCallable,
  syncBrokerTradesCallable,
  disconnectBrokerCallable,
} from '../lib/brokerSync';

// Module-level in-memory password cache (persists during the active session until page reload)
const passwordCache = new Map();

export function useBrokerAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load broker accounts from localStorage on mount/user change
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Load client-side configurations
      const loadLocalAccounts = (dbData = {}) => {
        try {
          const localSaved = localStorage.getItem(`xau-broker-accounts-${user.uid}`);
          const localList = localSaved ? JSON.parse(localSaved) : [];
          
          return localList.map(acc => ({
            ...acc,
            password: passwordCache.get(acc.id) || null,
            lastSyncTime: dbData.lastBrokerSync
              ? (dbData.lastBrokerSync.toDate
                  ? dbData.lastBrokerSync.toDate().toISOString()
                  : new Date(dbData.lastBrokerSync).toISOString())
              : null,
            lastSyncStatus: dbData.lastBrokerSyncStatus || 'success',
            lastSyncError: dbData.lastBrokerSyncError || null,
            tradeCount: dbData.lastBrokerSyncCount || 0,
            isActive: true,
          }));
        } catch (e) {
          console.error('Failed to parse local broker accounts:', e);
          return [];
        }
      };

      const userRef = doc(db, 'users', user.uid);
      unsubscribeSnapshot = onSnapshot(
        userRef,
        (docSnap) => {
          let dbData = {};
          if (docSnap.exists()) {
            dbData = docSnap.data();
          }
          const loaded = loadLocalAccounts(dbData);
          setAccounts(loaded);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          console.error('Failed to listen to sync stats:', err);
          const loaded = loadLocalAccounts({});
          setAccounts(loaded);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  async function addAccount(login, password, server, brokerType, accountName) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      // Connect / transient test/initial sync on the server
      const result = await connectBrokerCallable({
        accountId: login,
        password,
        server,
        platform: brokerType,
      });

      // Cache password strictly in-memory
      passwordCache.set(login, password);

      // Save configurations strictly on the client side (localStorage) WITHOUT credentials
      const localKey = `xau-broker-accounts-${user.uid}`;

      // We only support one connected account for now
      const newAccount = {
        id: login,
        accountName,
        platform: brokerType,
        server,
        login,
      };

      localStorage.setItem(localKey, JSON.stringify([newAccount]));

      // Trigger a state reload
      setAccounts([
        {
          ...newAccount,
          password,
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
      const localKey = `xau-broker-accounts-${user.uid}`;
      const localSaved = localStorage.getItem(localKey);
      const localList = localSaved ? JSON.parse(localSaved) : [];
      const acc = localList.find(a => a.id === accountId);

      if (!acc) throw new Error('Broker account configuration not found in this browser.');

      const inMemoryPassword = passwordCache.get(accountId);
      if (!inMemoryPassword) {
        throw new Error('Broker credentials are not in-memory. Please reconnect or re-enter your password.');
      }

      const result = await syncBrokerTradesCallable({
        accountId: acc.login,
        password: inMemoryPassword,
        server: acc.server,
        platform: acc.platform,
      });
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
      // Clean up server-side stats/transient triggers if any
      const result = await disconnectBrokerCallable();

      // Remove from client-side localStorage
      const localKey = `xau-broker-accounts-${user.uid}`;
      localStorage.removeItem(localKey);

      // Clear cached password
      passwordCache.delete(accountId);
      setAccounts([]);

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

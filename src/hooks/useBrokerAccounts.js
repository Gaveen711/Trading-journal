// src/hooks/useBrokerAccounts.js
// Hook for managing broker sync accounts via Firebase Cloud Functions and Firestore profile

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  connectBrokerCallable,
  syncBrokerTradesCallable,
  disconnectBrokerCallable,
} from '../lib/brokerSync';

export function useBrokerAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth.currentUser?.uid) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.metaApiAccountId) {
            setAccounts([
              {
                id: data.metaApiAccountId,
                accountName: `${data.brokerServer || 'Broker'} · ${data.brokerLogin || ''}`,
                brokerType: data.brokerPlatform || 'mt5',
                platform: data.brokerPlatform || 'mt5',
                server: data.brokerServer || '',
                login: data.brokerLogin || '',
                metaApiAccountId: data.metaApiAccountId,
                isActive: true,
                lastSyncTime: data.lastBrokerSync
                  ? (data.lastBrokerSync.toDate
                      ? data.lastBrokerSync.toDate().toISOString()
                      : new Date(data.lastBrokerSync).toISOString())
                  : null,
                lastSyncStatus: data.lastBrokerSyncStatus || 'success',
                tradeCount: data.lastBrokerSyncCount || 0,
              },
            ]);
          } else {
            setAccounts([]);
          }
        } else {
          setAccounts([]);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        console.error('Failed to listen to broker details:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  async function addAccount(login, password, server, brokerType, accountName) {
    setError(null);
    try {
      const result = await connectBrokerCallable({
        accountId: login,
        password,
        server,
        platform: brokerType,
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function syncAccount(accountId) {
    setError(null);
    try {
      const result = await syncBrokerTradesCallable();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function removeAccount(accountId) {
    setError(null);
    try {
      const result = await disconnectBrokerCallable();
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

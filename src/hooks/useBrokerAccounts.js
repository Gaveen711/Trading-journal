// src/hooks/useBrokerAccounts.js
// Hook for managing broker sync accounts

import { useState, useEffect } from 'react';
import { auth } from '../firebase';

export function useBrokerAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth.currentUser?.uid) {
      setLoading(false);
      return;
    }

    loadAccounts();
  }, [auth.currentUser?.uid]);

  async function getIdToken() {
    if (!auth.currentUser) throw new Error('Not authenticated');
    return auth.currentUser.getIdToken();
  }

  async function callBrokerAPI(action, data = {}) {
    const token = await getIdToken();
    const uid = auth.currentUser.uid;

    const response = await fetch('/api/broker-login-sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, action, ...data }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Request failed');
    }

    return result;
  }

  async function loadAccounts() {
    setLoading(true);
    setError(null);
    try {
      const result = await callBrokerAPI('list');
      setAccounts(result.accounts || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load broker accounts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addAccount(login, password, server, brokerType, accountName) {
    try {
      setError(null);
      const result = await callBrokerAPI('add', {
        login,
        password,
        server,
        brokerType,
        accountName,
      });

      // Reload accounts after adding
      await loadAccounts();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function syncAccount(accountId) {
    try {
      setError(null);
      const result = await callBrokerAPI('sync', { accountId });

      // Update account in state
      setAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? {
                ...acc,
                lastSyncStatus: 'success',
                lastSyncTime: new Date().toISOString(),
                tradeCount: result.totalFetched,
              }
            : acc
        )
      );

      return result;
    } catch (err) {
      setError(err.message);

      // Update error status
      setAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? { ...acc, lastSyncStatus: 'failed' }
            : acc
        )
      );

      throw err;
    }
  }

  async function removeAccount(accountId) {
    try {
      setError(null);
      const result = await callBrokerAPI('remove', { accountId });

      // Remove from state
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
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
    loadAccounts,
    addAccount,
    syncAccount,
    removeAccount,
  };
}

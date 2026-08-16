// Broker credentials are kept client-side and sent only for transient sync
// requests. Storage lives in ../lib/brokerCredentials.js, which splits durable
// non-secret metadata (localStorage) from the password (sessionStorage, tab
// lifetime only) — see that module for why.
import { useEffect, useState } from 'react';
import { useAppServices } from '../app/di/AppServicesContext.jsx';
import {
  readLocalAccounts,
  readSessionPassword,
  secretKey,
  writeLocalAccounts,
  writeSessionPassword,
} from '../lib/brokerCredentials.js';

const toIsoString = (value) => {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/** Coordinates authenticated broker metadata and secure server-side sync commands. */
export function useBrokerAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth, brokerRepository: repository } = useAppServices();

  useEffect(() => {
    let unsubscribeUser = null;
    let unsubscribeAccounts = null;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubscribeUser?.();
      unsubscribeAccounts?.();
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
          const localList = readLocalAccounts(user.uid);
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

      unsubscribeUser = repository.subscribeToUserDoc(user.uid, (docSnap) => {
        userData = docSnap.exists() ? docSnap.data() : {};
        publishAccounts();
      }, (snapshotError) => console.error('Failed to listen to legacy broker stats:', snapshotError));
      unsubscribeAccounts = repository.subscribeToAccounts(user.uid, (nextAccounts) => {
        serverAccounts = nextAccounts;
        publishAccounts();
        setLoading(false);
      }, (snapshotError) => {
        setError(snapshotError.message);
        console.error('Failed to listen to broker accounts:', snapshotError);
        publishAccounts();
        setLoading(false);
      });
    });
    return () => {
      unsubscribeAuth();
      unsubscribeUser?.();
      unsubscribeAccounts?.();
    };
  }, [auth, repository]);

  async function addAccount(login, password, server, brokerType, accountName) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    try {
      const result = await repository.connectBroker({ accountId: login, password, server, platform: brokerType });
      // Metadata is durable; the password is held only for this tab's session.
      const newAccount = { id: result.accountId, accountName, platform: brokerType, server, login, managedByWorker: true };
      writeLocalAccounts(user.uid, [newAccount]);
      writeSessionPassword(user.uid, result.accountId, password);
      setAccounts([{
        ...newAccount,
        requiresReconnect: false,
        isActive: true,
        lastSyncTime: new Date().toISOString(),
        lastSyncStatus: 'success',
        tradeCount: result.tradeCount || 0,
      }]);
      return result;
    } catch (operationError) {
      setError(operationError.message);
      throw operationError;
    }
  }

  /**
   * `password` is optional: when omitted the credential held for this session
   * is used. A new browser session has none, so the caller is told to
   * reconnect rather than the request being sent without one.
   */
  async function syncAccount(accountId, password) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    try {
      const account = accounts.find((item) => item.id === accountId);
      if (!account) throw new Error('Broker account not found.');
      if (account.managedByWorker !== true) throw new Error('Reconnect this broker account once to enable secure client-managed sync.');

      const secret = password || readSessionPassword(user.uid, accountId);
      if (!account.login || !account.server || !account.platform) {
        throw new Error('Reconnect this broker account on this device to sync securely.');
      }
      if (!secret) {
        throw new Error('Enter your broker password to sync. Credentials are held for this browser session only.');
      }
      if (password) writeSessionPassword(user.uid, accountId, password);

      return await repository.syncBrokerTrades({
        accountId: account.id,
        login: account.login,
        password: secret,
        server: account.server,
        brokerType: account.platform,
      });
    } catch (operationError) {
      setError(operationError.message);
      throw operationError;
    }
  }

  /** True when this tab still holds the credential needed for a silent sync. */
  function hasSessionCredential(accountId) {
    const user = auth.currentUser;
    return Boolean(user && readSessionPassword(user.uid, accountId));
  }

  async function removeAccount(accountId) {
    setError(null);
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    try {
      const localList = readLocalAccounts(user.uid);
      const account = accounts.find((item) => item.id === accountId);
      const result = account?.managedByWorker === true
        ? await repository.disconnectBroker(accountId)
        : { message: 'Legacy broker account removed locally.' };
      const remainingLocal = localList.filter((item) => item.id !== accountId);
      writeLocalAccounts(user.uid, remainingLocal);
      // The credential goes with the account it belonged to.
      sessionStorage.removeItem(secretKey(user.uid));
      setAccounts((current) => current.filter((item) => item.id !== accountId));
      return result;
    } catch (operationError) {
      setError(operationError.message);
      throw operationError;
    }
  }

  return { accounts, loading, error, addAccount, syncAccount, removeAccount, hasSessionCredential };
}

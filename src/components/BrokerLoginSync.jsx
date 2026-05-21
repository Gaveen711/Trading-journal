// src/components/BrokerLoginSync.jsx
// MT4/MT5 Broker Login Sync UI Component
// Allows users to connect their broker accounts without requiring an EA

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { auth } from '../firebase';
import { getFriendlyErrorMessage } from '../lib/errorUtils';
import {
  Key,
  CloudDownload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  ChevronRight,
  LockFill,
  ExclamationTriangleFill,
} from 'react-bootstrap-icons';

const BROKER_PRESETS = [
  { label: 'ICMarkets', server: 'ICMarkets-Live01', type: 'mt5' },
  { label: 'Roboforex', server: 'Roboforex-Live', type: 'mt4' },
  { label: 'FXCM', server: 'FXCM-Live', type: 'mt5' },
  { label: 'MetaTrader4', server: 'Custom MT4', type: 'mt4' },
  { label: 'MetaTrader5', server: 'Custom MT5', type: 'mt5' },
];

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function callBrokerAPI(uid, action, data = {}) {
  const token = await getIdToken();
  const res = await fetch('/api/broker-login-sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, action, ...data }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || result.message || 'Request failed');
  return result;
}

export default function BrokerLoginSync() {
  const { user, plan = 'free', expiry = null } = useOutletContext();
  const uid = user?.uid;

  // UI state
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  const [removing, setRemoving] = useState({});
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    accountName: '',
    brokerType: 'mt5',
    server: '',
    login: '',
    password: '',
    passwordVisible: false,
  });

  // Plan checks
  const nowMs = Date.now();
  const isActivePro = plan === 'pro' && expiry && new Date(expiry).getTime() > nowMs;
  const isGrace = plan === 'grace' || (plan === 'pro_expired' && expiry && new Date(expiry).getTime() + 9 * 24 * 60 * 60 * 1000 > nowMs);
  const isBrokerSyncAllowed = isActivePro || isGrace;

  // Load accounts on mount
  useEffect(() => {
    if (!uid || !isBrokerSyncAllowed) {
      setLoading(false);
      return;
    }

    loadAccounts();
  }, [uid, isBrokerSyncAllowed]);

  async function loadAccounts() {
    setLoading(true);
    setError(null);
    try {
      const data = await callBrokerAPI(uid, 'list');
      setAccounts(data.accounts || []);
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAccount(e) {
    e.preventDefault();
    
    if (!formData.login || !formData.password || !formData.server) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await callBrokerAPI(uid, 'add', {
        login: formData.login,
        password: formData.password,
        server: formData.server,
        brokerType: formData.brokerType,
        accountName: formData.accountName || `${formData.brokerType.toUpperCase()}-${formData.server}`,
      });

      // Reload accounts
      await loadAccounts();
      
      // Reset form
      setFormData({
        accountName: '',
        brokerType: 'mt5',
        server: '',
        login: '',
        password: '',
        passwordVisible: false,
      });
      setShowForm(false);

      setError(null);
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSync(accountId) {
    setSyncing(prev => ({ ...prev, [accountId]: true }));
    setError(null);

    try {
      const result = await callBrokerAPI(uid, 'sync', { accountId });
      
      // Update account sync status
      setAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? { ...acc, lastSyncStatus: 'success', tradeCount: result.totalFetched }
            : acc
        )
      );
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
      
      // Update error status
      setAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? { ...acc, lastSyncStatus: 'failed' }
            : acc
        )
      );
    } finally {
      setSyncing(prev => ({ ...prev, [accountId]: false }));
    }
  }

  async function handleRemove(accountId) {
    if (!window.confirm('Remove this broker account? Historical trades will remain.')) {
      return;
    }

    setRemoving(prev => ({ ...prev, [accountId]: true }));
    setError(null);

    try {
      await callBrokerAPI(uid, 'remove', { accountId });
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setRemoving(prev => ({ ...prev, [accountId]: false }));
    }
  }

  // Preset selector
  const handleSelectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      brokerType: preset.type,
      server: preset.server,
    }));
  };

  if (!isBrokerSyncAllowed) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-gradient">BROKER LOGIN SYNC</h2>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Direct broker connection without EA</p>
        </header>

        <div className="rounded-2xl border border-border/40 bg-card p-8 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border/40 flex items-center justify-center">
            <LockFill className="w-5 h-5 text-foreground/30" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Pro Feature</h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed max-w-xs">
              Broker Login Sync is available on the Pro plan. Upgrade to connect your MT4/MT5 account directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gradient">BROKER LOGIN SYNC</h2>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Connect MT4/MT5 directly — no EA required</p>
      </header>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] font-black uppercase tracking-wide text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Connected Accounts</h3>
          {accounts.map(account => (
            <div key={account.id} className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">{account.accountName}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {account.brokerType.toUpperCase()} • Login: {account.login}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(account.id)}
                  disabled={removing[account.id]}
                  className="px-2 py-1.5 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-all text-[10px] font-black uppercase disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-[10px]">
                {account.lastSyncStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">Last synced {account.lastSyncTime ? new Date(account.lastSyncTime).toLocaleTimeString() : 'never'}</span>
                  </>
                ) : account.lastSyncStatus === 'failed' ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">Sync failed</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-500">Pending sync</span>
                  </>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground">
                {account.tradeCount} trades synced
              </p>

              {/* Sync button */}
              <button
                onClick={() => handleManualSync(account.id)}
                disabled={syncing[account.id] || loading}
                className="w-full py-2 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <CloudDownload className="w-3 h-3" />
                {syncing[account.id] ? 'Syncing...' : 'Manual Sync Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add account form */}
      {showForm ? (
        <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Add Broker Account</h3>

          <form onSubmit={handleAddAccount} className="space-y-4">
            {/* Account name (optional) */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Account Name (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Main Live Account"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* Broker type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Broker Type
              </label>
              <select
                value={formData.brokerType}
                onChange={(e) => setFormData(prev => ({ ...prev, brokerType: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:border-primary/60"
              >
                <option value="mt5">MT5 (MetaTrader 5)</option>
                <option value="mt4">MT4 (MetaTrader 4)</option>
              </select>
            </div>

            {/* Broker presets */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Popular Brokers
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BROKER_PRESETS.filter(p => p.type === formData.brokerType).map(preset => (
                  <button
                    key={preset.server}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                      formData.server === preset.server
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Server */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Server
              </label>
              <input
                type="text"
                placeholder="e.g., ICMarkets-Live01"
                value={formData.server}
                onChange={(e) => setFormData(prev => ({ ...prev, server: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* Login */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Login
              </label>
              <input
                type="text"
                placeholder="Your broker login"
                value={formData.login}
                onChange={(e) => setFormData(prev => ({ ...prev, login: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:border-primary/60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={formData.passwordVisible ? 'text' : 'password'}
                  placeholder="Your broker password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-sm focus:outline-none focus:border-primary/60"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, passwordVisible: !prev.passwordVisible }))}
                  className="absolute right-3 top-2.5 text-muted-foreground text-xs"
                >
                  {formData.passwordVisible ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Info box */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                Your credentials are encrypted and stored securely. We never access your funds — only trade history.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Connecting...' : 'Connect Account'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg bg-muted/30 text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted/50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-lg border border-primary/40 hover:border-primary/60 text-primary font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Broker Account
        </button>
      )}

      {/* Info section */}
      <div className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-foreground/80">How it works</h4>
        <ul className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
          <li>✓ Enter your MT4/MT5 login credentials</li>
          <li>✓ We connect directly to your broker server</li>
          <li>✓ Closed trades are pulled automatically every 30-60 seconds</li>
          <li>✓ No EA required — works with all brokers</li>
          <li>✓ Credentials are encrypted and never exposed</li>
        </ul>
      </div>
    </div>
  );
}

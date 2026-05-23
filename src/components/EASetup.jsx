// src/components/EASetup.jsx
// Broker Sync Terminal — MT4/MT5 platform selection + broker login

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBrokerAccounts } from '../hooks/useBrokerAccounts';
// connectBrokerCallable and syncBrokerTradesCallable removed in favor of Hono useBrokerAccounts hook
import { getFriendlyErrorMessage } from '../lib/errorUtils';
import { useToast } from './ToastContext';
import {
  Lightning,
  LightningFill,
  LockFill,
  ShieldLockFill,
  CloudDownload,
  Trash2Fill,
  CheckCircleFill,
  ExclamationCircleFill,
  ClockFill,
  ArrowClockwise,
  EyeFill,
  EyeSlashFill,
  PlusCircleFill,
  ExclamationTriangleFill,
} from 'react-bootstrap-icons';

const BROKERS = {
  mt5: [
    { label: 'IC Markets', server: 'ICMarketsSC-Demo' },
    { label: 'Exness', server: 'Exness-Trial' },
    { label: 'FTMO', server: 'FTMO-Server' },
    { label: 'The Funded Trader', server: 'TheFundedTrader-Live' },
    { label: 'Just Markets — Demo', server: 'JustMarkets-Demo' },
    { label: 'Just Markets — Live', server: 'JustMarkets-Live' },
  ],
  mt4: [
    { label: 'IC Markets', server: 'ICMarkets-Demo02' },
    { label: 'Exness', server: 'Exness-Trial' },
    { label: 'FTMO', server: 'FTMO-Server' },
    { label: 'Just Markets — Demo', server: 'JustMarkets-Demo' },
    { label: 'Just Markets — Live', server: 'JustMarkets-Live' },
  ],
};

export default function EASetup() {
  const { plan = 'free', expiry = null, setShowPricingModal: onUpgrade, lastMT5Sync } = useOutletContext();
  const toast = useToast();
  const { accounts, loading: accountsLoading, loadAccounts, addAccount, syncAccount, removeAccount } = useBrokerAccounts();

  // Platform selection
  const [selectedPlatform, setSelectedPlatform] = useState(null); // 'mt4' | 'mt5' | null

  // Form state
  const [broker, setBroker] = useState('');
  const [customServer, setCustomServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Sync state
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Plan checks
  const nowMs = Date.now();
  const isActivePro = plan === 'pro' || (plan === 'pro' && expiry && new Date(expiry).getTime() > nowMs);
  const isGrace = plan === 'grace';
  const isSyncAllowed = isActivePro || isGrace;

  const selectedServer = broker === 'custom' ? customServer.trim() : broker;

  async function handleConnect(e) {
    e.preventDefault();
    if (!selectedServer || !login || !password) {
      toast('Please fill in all fields.', 'error');
      return;
    }
    setConnecting(true);
    try {
      const friendlyName = broker === 'custom' 
        ? `Custom · ${login}` 
        : `${BROKERS[selectedPlatform]?.find(b => b.server === broker)?.label || selectedPlatform.toUpperCase()} · ${login}`;
      
      const result = await addAccount(
        login,
        password,
        selectedServer,
        selectedPlatform,
        friendlyName
      );
      toast(result.message || 'Broker connected successfully!', 'success');
      setLogin('');
      setPassword('');
      setBroker('');
      setCustomServer('');
    } catch (err) {
      toast(getFriendlyErrorMessage(err), 'error');
    } finally {
      setConnecting(false);
    }
  }

  async function handleSyncAll() {
    if (accounts.length === 0) return;
    setSyncingAll(true);
    try {
      let totalNew = 0;
      for (const account of accounts) {
        const result = await syncAccount(account.id);
        totalNew += result.newTrades || 0;
      }
      toast(`Sync completed. ${totalNew} new trade(s) synced.`, 'success');
    } catch (err) {
      toast(getFriendlyErrorMessage(err), 'error');
    } finally {
      setSyncingAll(false);
    }
  }

  async function handleRemove(accountId) {
    if (!window.confirm('Remove this broker account? Historical trades will remain.')) return;
    setRemovingId(accountId);
    try {
      await removeAccount(accountId);
      toast('Account removed.', 'success');
    } catch (err) {
      toast(getFriendlyErrorMessage(err), 'error');
    } finally {
      setRemovingId(null);
    }
  }

  // ── Free / expired gate ────────────────────────────────────────────────
  if (!isSyncAllowed) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-1">
          <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Broker Sync Terminal</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Connect your MT4 / MT5 broker account.</p>
        </header>
        <div className="max-w-lg mx-auto mt-16 rounded-2xl border border-border/40 bg-card p-10 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border/40 flex items-center justify-center">
            <LockFill className="w-7 h-7 text-foreground/30" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">Pro Feature</h3>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed max-w-xs">
              Broker Sync is available on the Pro plan. Upgrade to connect your MT4/MT5 account and automatically sync trades.
            </p>
          </div>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="btn-primary flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Lightning className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentBrokers = selectedPlatform ? (BROKERS[selectedPlatform] || []) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Broker Sync Terminal</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Connect your MT4 / MT5 broker account.</p>
      </header>

      {/* ── Grace period warning ─────────────────────────────────────────── */}
      {isGrace && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-2xl animate-in slide-in-from-top-2 duration-500">
          <ExclamationTriangleFill className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-amber-500">Grace Period Active</p>
            <p className="text-[10px] text-amber-500/70 mt-0.5 leading-relaxed">
              Your Pro subscription has lapsed. Broker sync still works during the grace period. Renew to keep syncing.
            </p>
            {onUpgrade && (
              <button onClick={onUpgrade} className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 underline underline-offset-2 hover:text-amber-400 transition-colors">
                Renew Pro →
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* ── Platform Selector ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Choose Your Platform</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* MT4 Card */}
            <button
              onClick={() => { setSelectedPlatform('mt4'); setBroker(''); setCustomServer(''); }}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ease-[var(--spring-bounce)] hover:scale-[1.03] active:scale-95 ${
                selectedPlatform === 'mt4'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border/40 bg-card hover:border-primary/30 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedPlatform === 'mt4'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30'
                    : 'bg-muted border border-border/40 group-hover:border-blue-500/30'
                }`}>
                  <span className={`text-lg font-black transition-colors ${selectedPlatform === 'mt4' ? 'text-white' : 'text-foreground/60 group-hover:text-blue-500'}`}>MT4</span>
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${selectedPlatform === 'mt4' ? 'text-primary' : 'text-foreground/80'}`}>MetaTrader 4</h3>
                  <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">Classic Platform</p>
                </div>
              </div>
              {selectedPlatform === 'mt4' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircleFill className="w-3 h-3 text-white" />
                </div>
              )}
            </button>

            {/* MT5 Card */}
            <button
              onClick={() => { setSelectedPlatform('mt5'); setBroker(''); setCustomServer(''); }}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ease-[var(--spring-bounce)] hover:scale-[1.03] active:scale-95 ${
                selectedPlatform === 'mt5'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border/40 bg-card hover:border-primary/30 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedPlatform === 'mt5'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30'
                    : 'bg-muted border border-border/40 group-hover:border-purple-500/30'
                }`}>
                  <span className={`text-lg font-black transition-colors ${selectedPlatform === 'mt5' ? 'text-white' : 'text-foreground/60 group-hover:text-purple-500'}`}>MT5</span>
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${selectedPlatform === 'mt5' ? 'text-primary' : 'text-foreground/80'}`}>MetaTrader 5</h3>
                  <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">Next-Gen Platform</p>
                </div>
              </div>
              {selectedPlatform === 'mt5' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircleFill className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* ── Broker Login Form (visible after platform selection) ────────── */}
        {selectedPlatform && (
          <form onSubmit={handleConnect} className="card-premium p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                selectedPlatform === 'mt4'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30'
                  : 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30'
              }`}>
                <LightningFill className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                  Connect {selectedPlatform.toUpperCase()} Account
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Enter your broker credentials to start syncing.</p>
              </div>
            </div>

            {/* Broker selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broker</label>
              <select
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="input-premium h-11 w-full text-sm font-bold"
              >
                <option value="">Select your broker…</option>
                {currentBrokers.map((b) => (
                  <option key={b.server} value={b.server}>{b.label}</option>
                ))}
                <option value="custom">Other (enter server manually)</option>
              </select>
            </div>

            {/* Custom server input */}
            {broker === 'custom' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server Name</label>
                <input
                  type="text"
                  placeholder="e.g. MyBroker-Live01"
                  value={customServer}
                  onChange={(e) => setCustomServer(e.target.value)}
                  className="input-premium h-11 w-full text-sm font-bold"
                />
              </div>
            )}

            {/* Login */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Login</label>
              <input
                type="text"
                placeholder="Your broker account number"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="input-premium h-11 w-full text-sm font-bold"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your broker password (investor password works)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium h-11 w-full text-sm font-bold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  {showPassword ? <EyeSlashFill className="w-4 h-4" /> : <EyeFill className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <ShieldLockFill className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-green-500/80 leading-relaxed">
                <strong className="text-green-500">Zero-Knowledge Security.</strong> Your credentials are never stored in our database. They are cached only in your browser for local session management. Removing the account deletes all connection logs from all servers.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={connecting}
              className="w-full h-12 btn-primary text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              <CloudDownload className={`w-4 h-4 ${connecting ? 'animate-pulse' : ''}`} />
              {connecting ? 'Connecting…' : 'Connect & Sync'}
            </button>
          </form>
        )}

        {/* ── Connected Accounts ─────────────────────────────────────────── */}
        {accounts.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Connected Accounts</h2>
              <button
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <ArrowClockwise className={`w-3 h-3 ${syncingAll ? 'animate-spin' : ''}`} />
                {syncingAll ? 'Syncing…' : 'Sync All'}
              </button>
            </div>

            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="card-premium p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-black ${
                        account.brokerType === 'mt4' || account.platform === 'mt4'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                          : 'bg-gradient-to-br from-purple-500 to-purple-700'
                      }`}>
                        {(account.brokerType || account.platform || 'MT5').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{account.accountName || account.server}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Login: {account.login || account.accountId} • {account.server}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(account.id)}
                      disabled={removingId === account.id}
                      className="px-2 py-1.5 rounded-lg text-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50"
                    >
                      <Trash2Fill className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px]">
                      {account.lastSyncStatus === 'success' ? (
                        <>
                          <CheckCircleFill className="w-3 h-3 text-green-500" />
                          <span className="text-green-500 font-bold">
                            Synced {account.lastSyncTime ? new Date(account.lastSyncTime).toLocaleTimeString() : ''}
                          </span>
                        </>
                      ) : account.lastSyncStatus === 'failed' ? (
                        <>
                          <ExclamationCircleFill className="w-3 h-3 text-destructive" />
                          <span className="text-destructive font-bold">Sync failed</span>
                        </>
                      ) : (
                        <>
                          <ClockFill className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-500 font-bold">Pending sync</span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                      {account.tradeCount || 0} trades
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── How It Works ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-foreground/80">How It Works</h4>
          <ul className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-green-500 shrink-0 mt-px">✓</span> Choose MT4 or MT5 and enter your broker login credentials</li>
            <li className="flex items-start gap-2"><span className="text-green-500 shrink-0 mt-px">✓</span> We connect directly to your broker's trading server</li>
            <li className="flex items-start gap-2"><span className="text-green-500 shrink-0 mt-px">✓</span> Closed trades are pulled into your journal automatically</li>
            <li className="flex items-start gap-2"><span className="text-green-500 shrink-0 mt-px">✓</span> No Expert Advisor required — works with all brokers</li>
            <li className="flex items-start gap-2"><span className="text-green-500 shrink-0 mt-px">✓</span> Zero-Knowledge: credentials are not stored in our database</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

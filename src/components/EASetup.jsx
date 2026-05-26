// src/components/EASetup.jsx
// Broker Sync Terminal — MT4/MT5 platform selection + broker login

import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBrokerAccounts } from '../hooks/useBrokerAccounts';
// connectBrokerCallable and syncBrokerTradesCallable removed in favor of Hono useBrokerAccounts hook
import { getFriendlyErrorMessage } from '../lib/errorUtils';
import { useToast } from './ToastContext';
import { motion as Motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Search,
} from 'react-bootstrap-icons';

const BROKERS = {
  mt5: [
    { label: 'Admirals — Demo', server: 'AdmiralMarkets-Demo' },
    { label: 'Admirals — Live', server: 'AdmiralMarkets-Live' },
    { label: 'Alpha Capital Group — Demo', server: 'AlphaCapital-Demo' },
    { label: 'Alpha Capital Group — Live', server: 'AlphaCapital-Live' },
    { label: 'AvaTrade — Demo', server: 'Ava-Demo' },
    { label: 'AvaTrade — Live', server: 'Ava-Real' },
    { label: 'Axi — Demo', server: 'Axi-Demo' },
    { label: 'Axi — Live', server: 'Axi-Live' },
    { label: 'BlackBull Markets — Demo', server: 'BlackBull-Demo' },
    { label: 'BlackBull Markets — Live', server: 'BlackBull-Live' },
    { label: 'Blueberry Markets — Demo', server: 'BlueberryMarkets-Demo' },
    { label: 'Blueberry Markets — Live', server: 'BlueberryMarkets-Live' },
    { label: 'Darwinex — Demo', server: 'Darwinex-Demo' },
    { label: 'Darwinex — Live', server: 'Darwinex-Live' },
    { label: 'Eightcap — Demo', server: 'Eightcap-Demo' },
    { label: 'Eightcap — Live', server: 'Eightcap-Live' },
    { label: 'Exness — Demo', server: 'Exness-MT5Trial' },
    { label: 'Exness — Live', server: 'Exness-MT5Real' },
    { label: 'FBS — Demo', server: 'FBS-Demo' },
    { label: 'FBS — Live', server: 'FBS-Real' },
    { label: 'FP Markets — Demo', server: 'FPMarkets-Demo' },
    { label: 'FP Markets — Live', server: 'FPMarkets-Live' },
    { label: 'FTMO — Demo', server: 'FTMO-Demo' },
    { label: 'FTMO — Live', server: 'FTMO-Server' },
    { label: 'Funding Pips — Demo', server: 'FundingPips-Demo' },
    { label: 'Funding Pips — Live', server: 'FundingPips-Live' },
    { label: 'Fusion Markets — Demo', server: 'FusionMarkets-Demo' },
    { label: 'Fusion Markets — Live', server: 'FusionMarkets-Live' },
    { label: 'FxPro — Demo', server: 'FxPro-MT5Demo' },
    { label: 'FxPro — Live', server: 'FxPro-MT5Real' },
    { label: 'HFM (HotForex) — Demo', server: 'HFMarkets-Demo' },
    { label: 'HFM (HotForex) — Live', server: 'HFMarkets-Live' },
    { label: 'IC Markets — Demo', server: 'ICMarketsSC-Demo' },
    { label: 'IC Markets — Live', server: 'ICMarketsSC-Live' },
    { label: 'IG — Demo', server: 'IG-Demo' },
    { label: 'IG — Live', server: 'IG-Live' },
    { label: 'IronFX — Demo', server: 'IronFX-Demo' },
    { label: 'IronFX — Live', server: 'IronFX-Live' },
    { label: 'JustMarkets — Demo', server: 'JustMarkets-Demo' },
    { label: 'JustMarkets — Live', server: 'JustMarkets-Live' },
    { label: 'MultiBank — Demo', server: 'MultiBank-Demo' },
    { label: 'MultiBank — Live', server: 'MultiBank-Live' },
    { label: 'MyFundedFX — Demo', server: 'MyFundedFX-Demo' },
    { label: 'MyFundedFX — Live', server: 'MyFundedFX-Live' },
    { label: 'OANDA — Demo', server: 'OANDA-Demo' },
    { label: 'OANDA — Live', server: 'OANDA-Live' },
    { label: 'OctaFX — Demo', server: 'OctaFX-Demo' },
    { label: 'OctaFX — Live', server: 'OctaFX-Live' },
    { label: 'Pepperstone — Demo', server: 'Pepperstone-Demo' },
    { label: 'Pepperstone — Live', server: 'Pepperstone-Live' },
    { label: 'RoboForex — Demo', server: 'RoboForex-Demo' },
    { label: 'RoboForex — Live', server: 'RoboForex-Live' },
    { label: 'The Funded Trader — Demo', server: 'TheFundedTrader-Demo' },
    { label: 'The Funded Trader — Live', server: 'TheFundedTrader-Live' },
    { label: 'ThinkMarkets — Demo', server: 'ThinkMarkets-Demo' },
    { label: 'ThinkMarkets — Live', server: 'ThinkMarkets-Live' },
    { label: 'Tickmill — Demo', server: 'Tickmill-Demo' },
    { label: 'Tickmill — Live', server: 'Tickmill-Live' },
    { label: 'TMGM — Demo', server: 'TMGM-Demo' },
    { label: 'TMGM — Live', server: 'TMGM-Live' },
    { label: 'True Forex Funds — Demo', server: 'TrueForexFunds-Demo' },
    { label: 'True Forex Funds — Live', server: 'TrueForexFunds-Live' },
    { label: 'Vantage — Demo', server: 'Vantage-Demo' },
    { label: 'Vantage — Live', server: 'Vantage-Live' },
    { label: 'XM — Demo', server: 'XM-Demo' },
    { label: 'XM — Live', server: 'XM-Live' }
  ],
  mt4: [
    { label: 'Admirals — Demo', server: 'AdmiralMarkets-Demo' },
    { label: 'Admirals — Live', server: 'AdmiralMarkets-Live' },
    { label: 'AvaTrade — Demo', server: 'Ava-Demo' },
    { label: 'AvaTrade — Live', server: 'Ava-Real' },
    { label: 'Axi — Demo', server: 'Axi-Demo' },
    { label: 'Axi — Live', server: 'Axi-Live' },
    { label: 'BlackBull Markets — Demo', server: 'BlackBull-Demo' },
    { label: 'BlackBull Markets — Live', server: 'BlackBull-Live' },
    { label: 'Blueberry Markets — Demo', server: 'BlueberryMarkets-Demo' },
    { label: 'Blueberry Markets — Live', server: 'BlueberryMarkets-Live' },
    { label: 'Darwinex — Demo', server: 'Darwinex-Demo' },
    { label: 'Darwinex — Live', server: 'Darwinex-Live' },
    { label: 'Eightcap — Demo', server: 'Eightcap-Demo' },
    { label: 'Eightcap — Live', server: 'Eightcap-Live' },
    { label: 'Exness — Demo', server: 'Exness-Trial' },
    { label: 'Exness — Live', server: 'Exness-Real' },
    { label: 'FBS — Demo', server: 'FBS-Demo' },
    { label: 'FBS — Live', server: 'FBS-Real' },
    { label: 'FP Markets — Demo', server: 'FPMarkets-Demo' },
    { label: 'FP Markets — Live', server: 'FPMarkets-Live' },
    { label: 'FTMO — Demo', server: 'FTMO-Demo' },
    { label: 'FTMO — Live', server: 'FTMO-Server' },
    { label: 'Fusion Markets — Demo', server: 'FusionMarkets-Demo' },
    { label: 'Fusion Markets — Live', server: 'FusionMarkets-Live' },
    { label: 'FxPro — Demo', server: 'FxPro-Demo' },
    { label: 'FxPro — Live', server: 'FxPro-Real' },
    { label: 'HFM (HotForex) — Demo', server: 'HFMarkets-Demo' },
    { label: 'HFM (HotForex) — Live', server: 'HFMarkets-Live' },
    { label: 'IC Markets — Demo', server: 'ICMarkets-Demo' },
    { label: 'IC Markets — Live', server: 'ICMarkets-Live' },
    { label: 'IG — Demo', server: 'IG-Demo' },
    { label: 'IG — Live', server: 'IG-Live' },
    { label: 'IronFX — Demo', server: 'IronFX-Demo' },
    { label: 'IronFX — Live', server: 'IronFX-Live' },
    { label: 'JustMarkets — Demo', server: 'JustMarkets-Demo' },
    { label: 'JustMarkets — Live', server: 'JustMarkets-Live' },
    { label: 'MultiBank — Demo', server: 'MultiBank-Demo' },
    { label: 'MultiBank — Live', server: 'MultiBank-Live' },
    { label: 'OANDA — Demo', server: 'OANDA-Demo' },
    { label: 'OANDA — Live', server: 'OANDA-Live' },
    { label: 'OctaFX — Demo', server: 'OctaFX-Demo' },
    { label: 'OctaFX — Live', server: 'OctaFX-Live' },
    { label: 'Pepperstone — Demo', server: 'Pepperstone-Demo' },
    { label: 'Pepperstone — Live', server: 'Pepperstone-Live' },
    { label: 'RoboForex — Demo', server: 'RoboForex-Demo' },
    { label: 'RoboForex — Live', server: 'RoboForex-Live' },
    { label: 'ThinkMarkets — Demo', server: 'ThinkMarkets-Demo' },
    { label: 'ThinkMarkets — Live', server: 'ThinkMarkets-Live' },
    { label: 'Tickmill — Demo', server: 'Tickmill-Demo' },
    { label: 'Tickmill — Live', server: 'Tickmill-Live' },
    { label: 'TMGM — Demo', server: 'TMGM-Demo' },
    { label: 'TMGM — Live', server: 'TMGM-Live' },
    { label: 'Vantage — Demo', server: 'Vantage-Demo' },
    { label: 'Vantage — Live', server: 'Vantage-Live' },
    { label: 'XM — Demo', server: 'XM-Demo' },
    { label: 'XM — Live', server: 'XM-Live' }
  ],
};

export default function EASetup() {
  const { plan = 'free', expiry = null, setShowPricingModal: onUpgrade } = useOutletContext();
  const toast = useToast();
  const { accounts, addAccount, syncAccount, removeAccount } = useBrokerAccounts();

  // Platform selection
  const [selectedPlatform, setSelectedPlatform] = useState(null); // 'mt4' | 'mt5' | null

  // Form state
  const [serverName, setServerName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [brokerSearch, setBrokerSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state
  const [syncingAll, setSyncingAll] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Plan checks
  const nowMs = Date.now();
  const isActivePro = plan === 'pro' || (plan === 'pro' && expiry && new Date(expiry).getTime() > nowMs);
  const isGrace = plan === 'grace';
  const isSyncAllowed = isActivePro || isGrace;

  const selectedServer = serverName.trim();

  async function handleConnect(e) {
    e.preventDefault();
    if (!selectedServer || !login || !password) {
      toast('Please fill in all fields.', 'error');
      return;
    }
    setConnecting(true);
    try {
      const friendlyName = `${selectedServer} · ${login}`;
      
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
      setServerName('');
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
              onClick={() => { setSelectedPlatform('mt4'); setServerName(''); }}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ease-[var(--spring-bounce)] hover:scale-[1.03] active:scale-95 ${
                selectedPlatform === 'mt4'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border/40 bg-card hover:border-primary/30 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 p-1.5 ${
                  selectedPlatform === 'mt4'
                    ? 'bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'bg-muted/30 border border-border/30 group-hover:border-blue-500/20 group-hover:bg-blue-500/5'
                }`}>
                  {/* MT4 Icon — High-Fidelity Official Reconstruction */}
                  <svg
                    viewBox="15 20 70 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-full h-full transition-all duration-500 ${
                      selectedPlatform === 'mt4' ? 'opacity-100 scale-105 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'opacity-40 group-hover:opacity-80'
                    }`}
                  >
                    <defs>
                      <linearGradient id="mt4-green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4ade80" />
                        <stop offset="100%" stop-color="#16a34a" />
                      </linearGradient>
                      <linearGradient id="mt4-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#60a5fa" />
                        <stop offset="100%" stop-color="#1d4ed8" />
                      </linearGradient>
                      <path id="mt4-fig-body" d="M 33,58 C 31,56 33,54 35,55 C 41,59 45,62 50,62 C 55,62 59,59 65,55 C 67,54 69,56 67,58 C 62,70 58,74 50,74 C 42,74 38,70 33,58 Z" />
                    </defs>

                    {/* Left Figure (Green, 120deg) */}
                    <g transform="rotate(120 50 50)">
                      <use href="#mt4-fig-body" fill="url(#mt4-green-gradient)" />
                      <circle cx="50" cy="80" r="7.5" fill="url(#mt4-green-gradient)" />
                    </g>

                    {/* Right Figure (Green, 240deg) */}
                    <g transform="rotate(240 50 50)">
                      <use href="#mt4-fig-body" fill="url(#mt4-green-gradient)" />
                      <circle cx="50" cy="80" r="7.5" fill="url(#mt4-green-gradient)" />
                    </g>

                    {/* Bottom Figure (Blue) */}
                    <g>
                      <use href="#mt4-fig-body" fill="url(#mt4-blue-gradient)" />
                      <circle cx="50" cy="80" r="7.5" fill="url(#mt4-blue-gradient)" />
                    </g>

                    {/* Central Circle (Blue) */}
                    <circle cx="50" cy="50" r="16" fill="url(#mt4-blue-gradient)" stroke="#ffffff" strokeWidth="2.5" />

                    {/* Central Text "4" */}
                    <text x="50" y="56" textAnchor="middle" fill="#ffffff" fontSize="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900">4</text>
                  </svg>
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${selectedPlatform === 'mt4' ? 'text-primary' : 'text-foreground/80'}`}>MetaTrader 4</h3>
                </div>
              </div>
            </button>

            {/* MT5 Card */}
            <button
              onClick={() => { setSelectedPlatform('mt5'); setServerName(''); }}
              className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 ease-[var(--spring-bounce)] hover:scale-[1.03] active:scale-95 ${
                selectedPlatform === 'mt5'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border/40 bg-card hover:border-primary/30 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 p-1.5 ${
                  selectedPlatform === 'mt5'
                    ? 'bg-amber-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                    : 'bg-muted/30 border border-border/30 group-hover:border-amber-500/20 group-hover:bg-amber-500/5'
                }`}>
                  {/* MT5 Icon — High-Fidelity Official Reconstruction */}
                  <svg
                    viewBox="15 20 70 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-full h-full transition-all duration-500 ${
                      selectedPlatform === 'mt5' ? 'opacity-100 scale-105 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'opacity-40 group-hover:opacity-80'
                    }`}
                  >
                    <defs>
                      <linearGradient id="mt5-green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4ade80" />
                        <stop offset="100%" stop-color="#16a34a" />
                      </linearGradient>
                      <linearGradient id="mt5-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fbbf24" />
                        <stop offset="100%" stop-color="#d97706" />
                      </linearGradient>
                      <path id="mt5-fig-body" d="M 33,58 C 31,56 33,54 35,55 C 41,59 45,62 50,62 C 55,62 59,59 65,55 C 67,54 69,56 67,58 C 62,70 58,74 50,74 C 42,74 38,70 33,58 Z" />
                    </defs>

                    {/* Left Figure (Green, 120deg) */}
                    <g transform="rotate(120 50 50)">
                      <use href="#mt5-fig-body" fill="url(#mt5-green-gradient)" />
                      <circle cx="50" cy="80" r="7.5" fill="url(#mt5-green-gradient)" />
                    </g>

                    {/* Right Figure (Green, 240deg) */}
                    <g transform="rotate(240 50 50)">
                      <use href="#mt5-fig-body" fill="url(#mt5-green-gradient)" />
                      <circle cx="50" cy="80" r="7.5" fill="url(#mt5-green-gradient)" />
                    </g>

                    {/* Bottom Figure (Gold) */}
                    <g>
                      <use href="#mt5-fig-body" fill="url(#mt5-gold-gradient)" />
                      <circle cx="50" cy="80" r="7.5" fill="url(#mt5-gold-gradient)" />
                    </g>

                    {/* Central Circle (Gold) */}
                    <circle cx="50" cy="50" r="16" fill="url(#mt5-gold-gradient)" stroke="#ffffff" strokeWidth="2.5" />

                    {/* Central Text "5" */}
                    <text x="50" y="56" textAnchor="middle" fill="#ffffff" fontSize="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900">5</text>
                  </svg>
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${selectedPlatform === 'mt5' ? 'text-primary' : 'text-foreground/80'}`}>MetaTrader 5</h3>
                </div>
              </div>
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
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broker Preset</label>
              <button
                type="button"
                onClick={() => { setDropdownOpen(!dropdownOpen); setBrokerSearch(''); }}
                className={`input-premium h-11 w-full text-sm font-bold bg-background text-left flex items-center justify-between transition-all ${dropdownOpen ? 'ring-2 ring-primary/50 border-primary' : ''}`}
              >
                <span className="text-muted-foreground">
                  Search or select to auto-fill server...
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 p-1 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden flex flex-col max-h-80"
                  >
                    <div className="p-2 border-b border-border/40 shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search brokers..."
                          value={brokerSearch}
                          onChange={(e) => setBrokerSearch(e.target.value)}
                          autoFocus
                          className="w-full bg-background/50 border border-border/50 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto p-1 flex-1">
                      {currentBrokers.filter(b => b.label.toLowerCase().includes(brokerSearch.toLowerCase())).length > 0 ? (
                        currentBrokers.filter(b => b.label.toLowerCase().includes(brokerSearch.toLowerCase())).map((b) => (
                          <button
                            key={b.server}
                            type="button"
                            onClick={() => { setServerName(b.server); setDropdownOpen(false); setBrokerSearch(''); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-foreground/80 hover:bg-white/5 hover:text-foreground`}
                          >
                            {b.label}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-xs font-bold text-muted-foreground">No brokers found.</div>
                      )}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Server Name Input */}
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground">Server Name <span className="text-muted-foreground/50 ml-1">(Required)</span></label>
              <input
                type="text"
                placeholder="e.g. ICMarketsSC-Demo01"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="input-premium h-11 w-full text-sm font-bold border-primary/50 focus:border-primary shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                required
              />
              <p className="text-[9px] text-muted-foreground leading-relaxed mt-1">If your broker has multiple servers (e.g. Real1, Real2), select a preset above and modify this field to match your exact server name.</p>
            </div>

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
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your broker password (investor password works)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium h-11 w-full text-sm font-bold pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-foreground/40 hover:text-foreground/70 bg-transparent hover:bg-transparent border-0 hover:border-0 outline-none focus:outline-none z-10 btn-no-glow hover:!shadow-none hover:!translate-y-0 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlashFill className="w-4 h-4" /> : <EyeFill className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldLockFill className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[10px] text-emerald-300 leading-relaxed">
                <strong className="text-emerald-300 font-black">Zero-Knowledge.</strong> Credentials are never stored on our servers cached in your browser only.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={connecting}
              className="w-full h-12 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
              style={{
                background: connecting
                  ? 'linear-gradient(135deg, #5b21b6, #7c3aed)'
                  : 'linear-gradient(135deg, #7c3aed, #6d28d9, #4f46e5)',
                boxShadow: connecting ? 'none' : '0 0 24px rgba(124, 58, 237, 0.45), 0 4px 12px rgba(0,0,0,0.3)',
                color: 'white',
              }}
            >
              {connecting ? (
                <>
                  <ArrowClockwise className="w-4 h-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Connect & Sync
                </>
              )}
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
        <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">How It Works</h4>
          <ul className="space-y-3 text-[11px] text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2.5"><CheckCircleFill className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> Choose MT4 or MT5 and enter your broker login credentials</li>
            <li className="flex items-start gap-2.5"><CheckCircleFill className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> We connect directly to your broker's trading server</li>
            <li className="flex items-start gap-2.5"><CheckCircleFill className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> Closed trades are pulled into your journal automatically</li>
            <li className="flex items-start gap-2.5"><CheckCircleFill className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> No Expert Advisor required works with all brokers</li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500/90 mt-2">
              <ExclamationTriangleFill className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-500 font-black uppercase tracking-widest text-[10px] block mb-1">Zero-Knowledge Security</strong>
                Credentials are never stored on our servers. They are cached only in your browser. <strong>If you clear your browser storage, you will need to re-login.</strong>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

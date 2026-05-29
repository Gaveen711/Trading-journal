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
  const [selectedPlatform, setSelectedPlatform] = useState('mt4'); // default to mt4

  // Form state
  const [serverName, setServerName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [brokerSearch, setBrokerSearch] = useState('');
  const dropdownRef = useRef(null);

  // Custom interactive sync page states to match the target layout
  const [syncInterval, setSyncInterval] = useState('500ms');
  const [permissions, setPermissions] = useState({
    readPositions: true,
    tradeHistory: true,
    accountBalance: true,
    executeTrades: false
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  async function handleRemove(accountId) {
    if (!window.confirm('Remove this broker account? Historical trades will remain.')) return;
    try {
      await removeAccount(accountId);
      toast('Account removed.', 'success');
    } catch (err) {
      toast(getFriendlyErrorMessage(err), 'error');
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Account & Sync</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Connect your broker accounts for automatic trade sync</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider shrink-0 self-start sm:self-center">
          <ShieldLockFill className="w-3.5 h-3.5" />
          AES-256 Encrypted
        </div>
      </header>

      {/* ── Grace period warning ─────────────────────────────────────────── */}
      {isGrace && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-none animate-in slide-in-from-top-2 duration-500">
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

      {/* ── Bank-Grade Security Alert Banner ─────────────────────────────── */}
      <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-primary/5 border border-primary/10 max-w-none">
        <ShieldLockFill className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-primary">Bank-Grade Security</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            All API keys are encrypted with AES-256 and stored in an isolated vault. We use read-only access by default and never request trading permissions. Your credentials are never logged or transmitted in plain text.
          </p>
        </div>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Pane: SELECT BROKER */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/50 px-1">Select Broker</h2>
          <div className="flex flex-col gap-2.5">
            {/* MT4 Button */}
            <button
              onClick={() => setSelectedPlatform('mt4')}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                selectedPlatform === 'mt4'
                  ? 'border-primary/50 bg-primary/10 shadow-md'
                  : 'border-border/30 bg-card/40 hover:border-primary/20 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${
                  selectedPlatform === 'mt4' ? 'bg-blue-600' : 'bg-blue-600/60'
                }`}>
                  MT4
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">MetaTrader 4</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Forex / CFDs</div>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                accounts.some(a => a.platform === 'mt4') ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-muted-foreground/30'
              }`} />
            </button>

            {/* MT5 Button */}
            <button
              onClick={() => setSelectedPlatform('mt5')}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                selectedPlatform === 'mt5'
                  ? 'border-primary/50 bg-primary/10 shadow-md'
                  : 'border-border/30 bg-card/40 hover:border-primary/20 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 ${
                  selectedPlatform === 'mt5' ? 'bg-purple-600' : 'bg-purple-600/60'
                }`}>
                  MT5
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">MetaTrader 5</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Forex / Stocks / Crypto</div>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                accounts.some(a => a.platform === 'mt5') ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-muted-foreground/30'
              }`} />
            </button>

            {/* cTrader (Coming Soon) */}
            <button
              onClick={() => setSelectedPlatform('ctrader')}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                selectedPlatform === 'ctrader'
                  ? 'border-primary/50 bg-primary/10 shadow-md'
                  : 'border-border/30 bg-card/10 opacity-60 hover:opacity-100 hover:border-primary/20 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                  CT
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">cTrader</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Forex / CFDs</div>
                </div>
              </div>
              <div className="text-[9px] font-black uppercase text-primary tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">Coming</div>
            </button>

            {/* Binance (Coming Soon) */}
            <button
              onClick={() => setSelectedPlatform('binance')}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                selectedPlatform === 'binance'
                  ? 'border-primary/50 bg-primary/10 shadow-md'
                  : 'border-border/30 bg-card/10 opacity-60 hover:opacity-100 hover:border-primary/20 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-black text-white shrink-0">
                  BN
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Binance</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Crypto Spot & Futures</div>
                </div>
              </div>
              <div className="text-[9px] font-black uppercase text-primary tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">Coming</div>
            </button>

            {/* Bybit (Coming Soon) */}
            <button
              onClick={() => setSelectedPlatform('bybit')}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                selectedPlatform === 'bybit'
                  ? 'border-primary/50 bg-primary/10 shadow-md'
                  : 'border-border/30 bg-card/10 opacity-60 hover:opacity-100 hover:border-primary/20 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                  BY
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Bybit</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Crypto Derivatives</div>
                </div>
              </div>
              <div className="text-[9px] font-black uppercase text-primary tracking-wider px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">Coming</div>
            </button>
          </div>
        </div>

        {/* Right Column: Platform Configuration & Sync Details */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPlatform === 'ctrader' || selectedPlatform === 'binance' || selectedPlatform === 'bybit' ? (
            <div className="card-premium p-10 flex flex-col items-center text-center gap-5 justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border/40 flex items-center justify-center animate-pulse">
                <LockFill className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest text-foreground/90">Integration Coming Soon</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-sm">
                  We are actively working on supporting native API sync with {selectedPlatform === 'ctrader' ? 'cTrader' : selectedPlatform === 'binance' ? 'Binance' : 'Bybit'}. For now, please use MetaTrader 4 or MetaTrader 5 to sync your gold trades automatically.
                </p>
              </div>
            </div>
          ) : (
            /* MT4 or MT5 Active Form/Stats Panel */
            <div className="card-premium p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/20 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${
                    selectedPlatform === 'mt4' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {selectedPlatform.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedPlatform === 'mt4' ? 'MetaTrader 4' : 'MetaTrader 5'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Connect via {selectedPlatform.toUpperCase()} Expert Advisor or API bridge</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="shrink-0">
                  {accounts.some(a => a.platform === selectedPlatform) ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                      <CheckCircleFill className="w-3.5 h-3.5 animate-pulse" />
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/30 text-muted-foreground text-xs font-bold">
                      <ExclamationCircleFill className="w-3.5 h-3.5" />
                      Disconnected
                    </div>
                  )}
                </div>
              </div>

              {/* Sync Status Grid (Only visible if selected platform is connected) */}
              {accounts.filter(a => a.platform === selectedPlatform).map((acc) => (
                <div key={acc.id} className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-background/50 border border-border/30">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Last Sync</div>
                    <div className="text-sm font-bold text-foreground">{acc.lastSyncTime ? new Date(acc.lastSyncTime).toLocaleTimeString() : 'N/A'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Trades Synced</div>
                    <div className="text-sm font-bold text-foreground">{acc.tradeCount || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Sync Interval</div>
                    <div className="text-sm font-bold text-primary">{syncInterval}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Status</div>
                    <div className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>
              ))}

              {/* Credentials / Setup Form */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">API Credentials</h4>
                {accounts.some(a => a.platform === selectedPlatform) ? (
                  /* Read-Only connected account details */
                  <div className="space-y-4">
                    {accounts.filter(a => a.platform === selectedPlatform).map((acc) => (
                      <div key={acc.id} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server</label>
                          <input
                            type="text"
                            value={acc.server}
                            readOnly
                            className="input-premium h-11 w-full text-sm font-bold bg-background/30 cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Login</label>
                          <input
                            type="text"
                            value={acc.login}
                            readOnly
                            className="input-premium h-11 w-full text-sm font-bold bg-background/30 cursor-not-allowed opacity-80"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                          <input
                            type="password"
                            value="••••••••••••••••"
                            readOnly
                            className="input-premium h-11 w-full text-sm font-bold bg-background/30 cursor-not-allowed opacity-80"
                          />
                        </div>

                        {/* Connection actions */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <button
                            type="button"
                            onClick={() => syncAccount(acc.id)}
                            className="btn-apple-secondary h-12 w-full text-[10px] font-bold uppercase tracking-wider"
                          >
                            <ArrowClockwise className="w-4 h-4 mr-1.5" />
                            Re-sync Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(acc.id)}
                            className="btn-apple-yellow h-12 w-full text-[10px] font-bold uppercase tracking-wider !bg-rose-600/90 hover:!bg-rose-600 border-none"
                          >
                            <Trash2Fill className="w-4 h-4 mr-1.5" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Connect new broker account form */
                  <form onSubmit={handleConnect} className="space-y-4">
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
                                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-foreground/80 hover:bg-white/5 hover:text-foreground"
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground">Server Name <span className="text-muted-foreground/50 ml-1">(Required)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. ICMarketsSC-Demo01"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        className="input-premium h-11 w-full text-sm font-bold border-primary/50 focus:border-primary shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                        required
                      />
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
                        required
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
                          required
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

                    {/* Submit Button */}
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
              </div>

              {/* Data Permissions */}
              <div className="space-y-4 border-t border-border/20 pt-5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Data Permissions</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">Read Positions</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">View open and closed positions</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPermissions({ ...permissions, readPositions: !permissions.readPositions })}
                      className={`w-9 h-5 rounded-full relative p-0.5 transition-colors duration-250 ease-in-out border-none outline-none focus:outline-none ${permissions.readPositions ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white transition-transform duration-250 ease-in-out ${permissions.readPositions ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">Trade History</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Sync historical trade data</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPermissions({ ...permissions, tradeHistory: !permissions.tradeHistory })}
                      className={`w-9 h-5 rounded-full relative p-0.5 transition-colors duration-250 ease-in-out border-none outline-none focus:outline-none ${permissions.tradeHistory ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white transition-transform duration-250 ease-in-out ${permissions.tradeHistory ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">Account Balance</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">View account balance and equity</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPermissions({ ...permissions, accountBalance: !permissions.accountBalance })}
                      className={`w-9 h-5 rounded-full relative p-0.5 transition-colors duration-250 ease-in-out border-none outline-none focus:outline-none ${permissions.accountBalance ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`block w-4 h-4 rounded-full bg-white transition-transform duration-250 ease-in-out ${permissions.accountBalance ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <div className="text-sm font-bold text-foreground">Execute Trades <span className="text-[10px] text-rose-500 font-bold ml-1">[DISABLED]</span></div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Place and manage orders</div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="w-9 h-5 rounded-full relative p-0.5 bg-muted cursor-not-allowed border-none outline-none focus:outline-none"
                    >
                      <span className="block w-4 h-4 rounded-full bg-white/60 translate-x-0" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sync Settings */}
              <div className="space-y-4 border-t border-border/20 pt-5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Sync Settings</h4>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Interval</label>
                  <div className="glass-tab-container max-w-md">
                    {['250ms', '500ms', '1s', '5s', 'Manual'].map((interval) => (
                      <button
                        key={interval}
                        type="button"
                        onClick={() => setSyncInterval(interval)}
                        className={`glass-tab-button flex-1 py-2 ${syncInterval === interval ? 'glass-tab-button-active' : ''}`}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

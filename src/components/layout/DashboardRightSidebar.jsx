import { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, X, Settings, ChevronDown, Palette, ClipboardList, Shield, Brain, Cpu, Lightbulb } from 'lucide-react';
import { auth } from '../../firebase';
import { calcPnl, todayStr, formatCurrency } from '../../lib/tradeUtils';
import { submitTrade, getRemainingFreeTrades } from '../../services/tradeService';
import { CurrencyConverter } from '../CurrencyConverter';
import { CustomSelect } from '../ui/CustomSelect';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ExclamationTriangleFill,
  EmojiAngryFill,
  EmojiFrownFill,
  EmojiNeutralFill,
  EmojiSmileFill,
  EmojiSunglassesFill,
} from 'react-bootstrap-icons';

import { FREE_TRADE_LIMIT } from '../../config/tradeConfig';

// ─── Tab IDs ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',    label: 'Log',      icon: ClipboardList, color: '#34d399' }, // Emerald-400
  { id: 'risk',     label: 'Risk',     icon: Shield,        color: '#f43f5e' }, // Rose-500
  { id: 'mood',     label: 'Mood',     icon: Brain,         color: '#c084fc' }, // Purple-400
  { id: 'advanced', label: 'Advanced', icon: Cpu,           color: '#fbbf24' }, // Amber-400
];

// ─── Mood options (matching JournalPage icons) ───────────────────────────────
// Labels align with JournalPage moodLabels: Terrible, Bad, Neutral, Good, Excellent
const MOODS = [
  { icon: EmojiAngryFill,      label: 'Terrible',  colorClass: 'text-red-500/80'     },
  { icon: EmojiFrownFill,      label: 'Bad',        colorClass: 'text-orange-500/80'  },
  { icon: EmojiNeutralFill,    label: 'Neutral',    colorClass: 'text-yellow-500/80'  },
  { icon: EmojiSmileFill,      label: 'Good',       colorClass: 'text-green-500/80'   },
  { icon: EmojiSunglassesFill, label: 'Excellent',  colorClass: 'text-emerald-500/80' },
];

// ─── Timeframe options ───────────────────────────────────────────────────────
const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

// ─── Setup grade options ─────────────────────────────────────────────────────
const GRADES = [
  { value: 'A+', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { value: 'A',  color: 'text-green-400  border-green-500/40  bg-green-500/10'  },
  { value: 'B',  color: 'text-blue-400   border-blue-500/40   bg-blue-500/10'   },
  { value: 'C',  color: 'text-amber-400  border-amber-500/40  bg-amber-500/10'  },
  { value: 'D',  color: 'text-rose-400   border-rose-500/40   bg-rose-500/10'   },
];

// ─── Market structure tags ───────────────────────────────────────────────────
const STRUCTURES = ['Trending', 'Ranging', 'Breakout', 'Reversal', 'Consolidation'];

// ─── Confluence factor tags ──────────────────────────────────────────────────
const CONFLUENCE = ['S/R Level', 'Trend Follow', 'SMC', 'ICT', 'EMA Cross', 'News', 'Fib Level', 'Order Block', 'Liquidity'];

export function DashboardRightSidebar({
  plan,
  isTrial,
  isTrialActive,
  renewCountdown,
  trialTimeLeft,
  trades,
  setShowPricingModal,
  toast,
  addTrade,
  isLoadingTrades,
  setShowThemeSelector,
}) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const notifRef = useRef();
  const profileRef = useRef();

  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const isFree = plan === 'basic' && !isTrial;
  const isPro  = plan === 'pro' || plan === 'grace';
  const showLockTimer = !isPro && !!renewCountdown;

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileCard(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── TAB 1: BASIC – Order Form State ────────────────────────────────────────
  const [direction, setDirection] = useState('LONG');
  const [orderType, setOrderType] = useState('Market');
  const [entry, setEntry]         = useState('');
  const [exit,  setExit]          = useState('');
  const [lots,  setLots]          = useState('0.10');
  const [sl,    setSl]            = useState('');
  const [tp,    setTp]            = useState('');
  const [note,  setNote]          = useState('');
  const [session,  setSession]    = useState('');
  const [strategy, setStrategy]   = useState('');
  const [saving, setSaving]       = useState(false);

  // ── TAB 2: RISK – State ────────────────────────────────────────────────────
  const [riskPercent,    setRiskPercent]    = useState('1');
  const [maxDailyLoss,   setMaxDailyLoss]   = useState('');
  const [maxDailyActive, setMaxDailyActive] = useState(false);

  // ── TAB 3: MOOD – State ───────────────────────────────────────────────────
  const [preTradeMood,  setPreTradeMood]  = useState('');
  const [confidence,    setConfidence]    = useState(0);   // 1-10
  const [conviction,    setConviction]    = useState('');   // High / Medium / Low
  const [postReflect,   setPostReflect]   = useState('');

  // ── TAB 4: ADVANCED – State ───────────────────────────────────────────────
  const [timeframe,      setTimeframe]      = useState('');
  const [setupGrade,     setSetupGrade]     = useState('');
  const [marketStructure, setMarketStructure] = useState([]);
  const [confluenceFactors, setConfluenceFactors] = useState([]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleNumericChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) setter(val.replace(',', '.'));
  };

  const toggleArrayItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  // ── PnL preview ────────────────────────────────────────────────────────────
  const pnlData = calcPnl(
    parseFloat(entry) || 0, parseFloat(exit) || 0,
    parseFloat(lots)  || 0, 0,
    parseFloat(sl)    || 0, parseFloat(tp)   || 0,
    direction === 'LONG' ? 'BUY' : 'SELL', 0
  );

  // ── Auto R:R calculation ───────────────────────────────────────────────────
  const autoRR = useMemo(() => {
    const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
    if (!e || !s || !t) return null;
    const risk   = Math.abs(e - s);
    const reward = Math.abs(e - t);
    if (risk === 0) return null;
    return (reward / risk).toFixed(2);
  }, [entry, sl, tp]);

  const remainingFreeTrades = getRemainingFreeTrades(trades);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleLogTrade = async () => {
    if (!entry || !exit || !lots) {
      toast('Please fill in Entry, Exit, and Amount.', 'error');
      return;
    }
    setSaving(true);
    const entryVal = parseFloat(entry);
    const exitVal  = parseFloat(exit);
    const lotsVal  = parseFloat(lots);
    const slVal    = parseFloat(sl) || null;
    const tpVal    = parseFloat(tp) || null;

    const mappedDir = direction === 'LONG' ? 'BUY' : 'SELL';
    const tradeRes  = calcPnl(entryVal, exitVal, lotsVal, 0, slVal, tpVal, mappedDir, 0);
    const { pnl, pips, rr } = tradeRes;
    const outcome = pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE';

    const tradeData = {
      date: todayStr(),
      direction: mappedDir,
      entry: entryVal,
      exit:  exitVal,
      lots:  lotsVal,
      swap: 0,
      sl: slVal,
      tp: tpVal,
      session,
      strategy,
      rr,
      pips,
      market: 'GOLD',
      pnl: parseFloat(pnl.toFixed(2)),
      outcome,
      note: note.trim(),
      timestamp: new Date(),
      // ── New extended fields ──────────────────────────────────────────────
      riskPercent:       riskPercent     ? parseFloat(riskPercent)  : null,
      maxDailyLoss:      maxDailyActive  ? parseFloat(maxDailyLoss) || null : null,
      preTradeMood,
      confidence:        confidence || null,
      conviction,
      postReflect:       postReflect.trim(),
      timeframe,
      setupGrade,
      marketStructure,
      confluenceFactors,
      autoRR:            autoRR ? parseFloat(autoRR) : null,
    };

    try {
      if (addTrade) {
        await submitTrade({ addTrade, tradeData, plan, trades });
        // Reset all tabs
        setEntry(''); setExit(''); setLots('0.10'); setSl(''); setTp('');
        setNote(''); setSession(''); setStrategy('');
        setRiskPercent('1'); setMaxDailyLoss(''); setMaxDailyActive(false);
        setPreTradeMood(''); setConfidence(0); setConviction(''); setPostReflect('');
        setTimeframe(''); setSetupGrade(''); setMarketStructure([]); setConfluenceFactors([]);
        setActiveTab('basic');
        toast(`Trade logged: ${outcome} ${formatCurrency(pnl, true)}`, outcome === 'WIN' ? 'success' : 'error');
      } else {
        toast('Error: Trade submission unavailable.', 'error');
      }
    } catch (err) {
      toast(err?.message || 'Failed to record trade.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Trader';

  // ── Tab badge counts (optional fields filled) ──────────────────────────────
  const riskFilled    = [riskPercent !== '1' && riskPercent, maxDailyActive].filter(Boolean).length;
  const moodFilled    = [preTradeMood, confidence > 0, conviction, postReflect].filter(Boolean).length;
  const advancedFilled = [timeframe, setupGrade, marketStructure.length > 0, confluenceFactors.length > 0].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ─── HEADER: Profile & Notifications ─────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between apple-glass-panel p-2.5 rounded-2xl relative z-50">

        {/* Profile Identity */}
        <div className="flex items-center gap-2.5 relative" ref={profileRef}>
          <div
            onClick={() => setShowProfileCard(!showProfileCard)}
            className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer shadow-sm overflow-hidden select-none"
          >
            <span className="text-xl">🍎</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-foreground capitalize flex items-center gap-1">
              {displayName}
              <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </span>
            <span className="text-[9px] font-black uppercase text-primary tracking-[0.05em] bg-primary/10 px-2 py-0.5 rounded text-center mt-0.5 w-max flex items-center gap-1 font-mono">
              {formattedTime}
            </span>
          </div>

          {showProfileCard && (
            <div className="absolute top-[calc(100%+12px)] left-0 z-50 w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 pb-3 border-b border-border/10">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden select-none">
                  <span className="text-xl">🍎</span>
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-foreground truncate capitalize">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{auth.currentUser?.email}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setShowProfileCard(false); setShowThemeSelector?.(true); }}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted/50 text-foreground transition-colors cursor-pointer text-left"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    Color Accent
                  </span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Change</span>
                </button>

                <div className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted/50 text-foreground transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-primary">
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </svg>
                    Dark Theme
                  </span>
                  <label htmlFor="check-profile" className="theme-switch-toggle" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
                    <input id="check-profile" type="checkbox" className="theme-switch-input" checked={!isLightMode} onChange={toggleTheme} />
                    <div className="theme-switch-icon theme-switch-icon--moon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
                        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="theme-switch-icon theme-switch-icon--sun">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                      </svg>
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => { setShowProfileCard(false); window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank'); }}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-wider">Manage Subscription</span>
                </button>

                <button
                  onClick={() => { localStorage.removeItem('xau-auth-hint'); auth.signOut(); }}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer text-left mt-1 border-t border-border/10 pt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-wider">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 border border-border/40 hover:bg-muted text-muted-foreground transition-all relative shadow-sm"
          >
            <Bell size={16} strokeWidth={2.5} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-card"></span>
          </button>

          {showNotifications && (
            <div className="absolute top-[calc(100%+12px)] right-0 z-50 w-72 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/10 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notifications</span>
                <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">2 New</span>
              </div>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="flex gap-3 items-start p-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <span className="text-blue-500 text-xs">🚀</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Welcome to XauJournal</p>
                    <p className="text-[10px] text-muted-foreground">Your premium trading journey begins now.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <span className="text-amber-500 text-xs">⚠️</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Complete Setup</p>
                    <p className="text-[10px] text-muted-foreground">Connect your MT4/MT5 account to auto-sync trades.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ORDER FORM (ACTION CENTER) ───────────────────────────────────── */}
      <div className="apple-glass-panel flex flex-col rounded-3xl relative z-30 overflow-hidden">

        {/* ── Panel Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center px-5 pt-4 pb-3 border-b border-border/10 shrink-0 relative">
          <div className="flex items-center gap-2 mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#E5B80B] shadow-[0_0_6px_rgba(229,184,11,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">Record Gold Trade</span>
            <span className="text-[8px] font-black uppercase bg-[#E5B80B]/15 text-[#E5B80B] px-1.5 py-0.5 rounded tracking-widest">XAU/USD</span>
          </div>
          {/* PnL live preview badge */}
          {(parseFloat(entry) > 0 && parseFloat(exit) > 0) && (
            <span className={`absolute right-5 text-[10px] font-black px-2 py-0.5 rounded-lg ${(pnlData?.pnl || 0) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {(pnlData?.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(pnlData?.pnl || 0)}
            </span>
          )}
        </div>

        {/* ── Buy / Sell Segmented Control ────────────────────────────────── */}
        <div className="px-4 pt-3 shrink-0">
          <div className="flex bg-muted/60 p-0.5 rounded-xl">
            <button
              disabled={showLockTimer}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${direction === 'LONG' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setDirection('LONG')}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                Buy / Long
              </span>
            </button>
            <button
              disabled={showLockTimer}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${direction === 'SHORT' ? 'bg-rose-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setDirection('SHORT')}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                Sell / Short
              </span>
            </button>
          </div>
        </div>

        {/* ── Order-type sub-tabs ─────────────────────────────────────────── */}
        <div className="flex gap-3 border-b border-border/10 px-5 mt-2 shrink-0">
          {['Market', 'Limit', 'Stop'].map((type) => (
            <button
              key={type}
              disabled={showLockTimer}
              className={`text-[9px] font-black uppercase tracking-widest transition-colors pb-1.5 border-b-2 -mb-[2px] disabled:opacity-50 disabled:cursor-not-allowed ${orderType === type ? 'text-foreground border-primary' : 'text-muted-foreground hover:text-foreground/80 border-transparent'}`}
              onClick={() => setOrderType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ── Feature Tabs ────────────────────────────────────────────────── */}
        <div className="flex gap-0 border-b border-border/10 px-4 mt-1 shrink-0">
          {TABS.map((tab) => {
            const badge = tab.id === 'risk' ? riskFilled : tab.id === 'mood' ? moodFilled : tab.id === 'advanced' ? advancedFilled : 0;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-2.5 py-2 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] group ${
                  activeTab === tab.id
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground hover:text-foreground/70 border-transparent'
                }`}
              >
                <IconComponent 
                  className="w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110"
                  style={activeTab === tab.id ? { color: tab.color, filter: `drop-shadow(0 0 3px ${tab.color})` } : {}}
                />
                {tab.label}
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[7px] font-black flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Lock Timer Banner ───────────────────────────────────────────── */}
        {showLockTimer && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center gap-2 shrink-0 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">Log Window Locked</span>
            <div className="bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-xl text-amber-500 text-sm font-black tracking-[0.15em] font-mono">
              {renewCountdown}
            </div>
          </div>
        )}

        {/* ── Trial / Free Tier Notice ─────────────────────────────────────── */}
        {isTrialActive && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Pro Trial Active
              </span>
              {trialTimeLeft && <span className="text-[9px] font-black text-foreground bg-background/50 px-2 py-0.5 rounded font-mono">{trialTimeLeft}</span>}
            </div>
            <button onClick={() => setShowPricingModal(true)} className="w-full py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all">
              Upgrade to Pro
            </button>
          </div>
        )}

        {isFree && (
          <div className="mx-4 mt-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 overflow-hidden shrink-0">
            {/* Header row */}
            <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Free Tier
              </span>
              <span className={`text-[9px] font-black tabular-nums ${
                remainingFreeTrades === 0 ? 'text-rose-400' :
                remainingFreeTrades <= 5  ? 'text-amber-400' :
                'text-blue-400'
              }`}>
                {FREE_TRADE_LIMIT - remainingFreeTrades} / {FREE_TRADE_LIMIT} trades
              </span>
            </div>

            {/* Progress bar */}
            <div className="px-3 pb-2">
              <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    remainingFreeTrades === 0 ? 'bg-rose-500' :
                    remainingFreeTrades <= 5  ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${((FREE_TRADE_LIMIT - remainingFreeTrades) / FREE_TRADE_LIMIT) * 100}%` }}
                />
              </div>
              {remainingFreeTrades > 0 ? (
                <p className="text-[8px] text-muted-foreground/50 mt-1">
                  {remainingFreeTrades} trade{remainingFreeTrades !== 1 ? 's' : ''} remaining — once limit is reached, resets after 1 hour
                </p>
              ) : (
                <p className="text-[8px] text-rose-400/70 mt-1">
                  Limit reached · Unlocks in: <strong className="text-rose-400 font-mono">{renewCountdown || '01:00:00'}</strong>
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="px-3 pb-3">
              <button
                onClick={() => setShowPricingModal(true)}
                className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all"
              >
                Unlock Unlimited — Upgrade Pro
              </button>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-2.5">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1 — BASIC
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'basic' && (
            <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">

              {/* Amount / Lots */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Amount (Lots)</label>
                <div className="relative">
                  <input
                    type="text" value={lots} onChange={handleNumericChange(setLots)} placeholder="0.10"
                    disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground">LOTS</span>
                </div>
              </div>

              {/* Entry Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Entry Price</label>
                <div className="relative">
                  <input
                    type="text" value={entry} onChange={handleNumericChange(setEntry)} placeholder="2345.50"
                    disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-primary">USD</span>
                </div>
              </div>

              {/* Exit Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Exit Price</label>
                <div className="relative">
                  <input
                    type="text" value={exit} onChange={handleNumericChange(setExit)} placeholder="2350.00"
                    disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-primary">USD</span>
                </div>
              </div>

              {/* TP / SL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Take Profit</label>
                  <input type="text" value={tp} onChange={handleNumericChange(setTp)} placeholder="Optional" disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Stop Loss</label>
                  <input type="text" value={sl} onChange={handleNumericChange(setSl)} placeholder="Optional" disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
              </div>

              {/* Session / Strategy */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Session</label>
                  <CustomSelect value={session} onChange={setSession} placeholder="Session" disabled={showLockTimer} className="h-9 px-3" align="top"
                    options={[
                      { value: 'London',   label: 'London'       },
                      { value: 'NewYork',  label: 'New York'     },
                      { value: 'Tokyo',    label: 'Tokyo'        },
                      { value: 'Sydney',   label: 'Sydney'       },
                    ]}
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Strategy</label>
                  <CustomSelect value={strategy} onChange={setStrategy} placeholder="Strategy" disabled={showLockTimer} className="h-9 px-3" align="top"
                    options={[
                      { value: 'Breakout', label: 'Breakout'    },
                      { value: 'SMC',      label: 'SMC'         },
                      { value: 'ICT',      label: 'ICT'         },
                      { value: 'Scalp',    label: 'Scalp'       },
                      { value: 'Swing',    label: 'Swing'       },
                      { value: 'S/R',      label: 'S/R Bounce'  },
                    ]}
                  />
                </div>
              </div>

              {/* Trade Notes */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Trade Notes</label>
                <textarea
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Why did you take this trade?" rows={2} disabled={showLockTimer}
                  className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Pip Count Live Display */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                (pnlData?.pips || 0) > 0
                  ? 'bg-green-500/5 border-green-500/20'
                  : (pnlData?.pips || 0) < 0
                  ? 'bg-rose-500/5 border-rose-500/20'
                  : 'bg-muted/20 border-border/15'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    (pnlData?.pips || 0) > 0 ? 'bg-green-500' :
                    (pnlData?.pips || 0) < 0 ? 'bg-rose-500' :
                    'bg-muted-foreground/30'
                  }`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pip Count</span>
                </div>
                <span className={`text-sm font-black tabular-nums ${
                  (pnlData?.pips || 0) > 0 ? 'text-green-500' :
                  (pnlData?.pips || 0) < 0 ? 'text-rose-500' :
                  'text-muted-foreground/40'
                }`}>
                  {(pnlData?.pips || 0) !== 0
                    ? `${(pnlData?.pips || 0) > 0 ? '+' : ''}${(pnlData?.pips || 0).toFixed(1)} pips`
                    : '— pips'
                  }
                </span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2 — RISK MANAGER
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'risk' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">

              {/* Auto R:R display */}
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Auto R:R Ratio</span>
                  <span className={`text-lg font-black ${autoRR ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                    {autoRR ? `1 : ${autoRR}` : '—'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Est. Pips</span>
                  <span className="text-sm font-black text-foreground/70">{(pnlData?.pips || 0).toFixed(1)}</span>
                </div>
              </div>
              {!autoRR && (
                <p className="text-[9px] text-muted-foreground/60 text-center -mt-1">Fill Entry, SL & TP in the Log tab to auto-calculate</p>
              )}

              {/* Risk % per Trade */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider">Risk % per Trade</label>
                  <span className="text-[10px] font-black text-primary">{riskPercent || 0}%</span>
                </div>
                <input
                  type="range" min="0.1" max="10" step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  disabled={showLockTimer}
                  className="w-full h-1.5 appearance-none bg-muted/60 rounded-full accent-primary cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground/50 font-bold uppercase px-0.5">
                  <span>0.1%</span><span>2%</span><span>5%</span><span>10%</span>
                </div>
              </div>

              {/* Risk % manual input */}
              <div className="relative">
                <input
                  type="text" value={riskPercent} onChange={handleNumericChange(setRiskPercent)}
                  placeholder="1.0" disabled={showLockTimer}
                  className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground">% RISK</span>
              </div>

              {/* Max Daily Loss */}
              <div className="p-3 rounded-2xl border border-border/20 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider">Max Daily Loss Limit</label>
                  <button
                    onClick={() => setMaxDailyActive(v => !v)}
                    className={`w-9 h-5 rounded-full transition-all relative ${maxDailyActive ? 'bg-primary' : 'bg-muted/60'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${maxDailyActive ? 'left-4.5 left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
                {maxDailyActive && (
                  <div className="relative animate-in fade-in duration-200">
                    <input
                      type="text" value={maxDailyLoss} onChange={handleNumericChange(setMaxDailyLoss)}
                      placeholder="e.g. 50.00" disabled={showLockTimer}
                      className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground">USD</span>
                  </div>
                )}
              </div>

              {/* Risk tip */}
              <div className="flex gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-amber-500 shrink-0 mt-0.5">⚡</span>
                <p className="text-[9px] text-muted-foreground leading-relaxed">Professional traders risk <strong className="text-foreground">1–2%</strong> per trade. Never exceed 5% to protect your capital.</p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3 — MOOD / PSYCHOLOGY
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'mood' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">

              {/* Pre-Trade Mood — same icons as JournalPage */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Pre-Trade Mood</label>
                <div className="flex justify-between bg-muted/40 rounded-[1.25rem] p-1.5 gap-1 border border-border/40">
                  {MOODS.map(({ icon: MoodIcon, label, colorClass }) => (
                    <button
                      key={label}
                      title={label}
                      onClick={() => setPreTradeMood(preTradeMood === label ? '' : label)}
                      className={`flex-1 aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-75 ${
                        preTradeMood === label
                          ? 'bg-background shadow-lg scale-110 ring-1 ring-border/50'
                          : 'hover:bg-background/30 opacity-40 hover:opacity-100'
                      }`}
                    >
                      <MoodIcon className={`w-5 h-5 ${colorClass}`} />
                      <span className={`text-[7px] font-black uppercase tracking-widest leading-none ${
                        preTradeMood === label ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider">Confidence Level</label>
                  <span className="text-[10px] font-black text-primary">{confidence > 0 ? `${confidence}/10` : '—'}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setConfidence(confidence === n ? 0 : n)}
                      className={`flex-1 h-6 rounded-md text-[8px] font-black transition-all ${
                        n <= confidence
                          ? n <= 3  ? 'bg-rose-500/80 text-white'
                          : n <= 6  ? 'bg-amber-500/80 text-white'
                                    : 'bg-primary/80 text-primary-foreground'
                          : 'bg-muted/40 text-muted-foreground/40 hover:bg-muted/60'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground/40 font-bold uppercase px-0.5">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </div>

              {/* Trade Conviction */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Trade Conviction</label>
                <div className="flex gap-2">
                  {['High', 'Medium', 'Low'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setConviction(conviction === lvl ? '' : lvl)}
                      className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        conviction === lvl
                          ? lvl === 'High'   ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : lvl === 'Medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                             : 'bg-rose-500/20  border-rose-500/50  text-rose-400'
                          : 'bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post-Trade Reflection */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Post-Trade Reflection</label>
                <textarea
                  value={postReflect} onChange={(e) => setPostReflect(e.target.value)}
                  placeholder="What did you learn? Did you follow your plan?" rows={3}
                  className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 4 — ADVANCED SETUP
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'advanced' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">

              {/* Timeframe */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Timeframe</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(timeframe === tf ? '' : tf)}
                      className={`py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        timeframe === tf
                          ? 'bg-primary/20 border-primary/50 text-primary shadow-sm'
                          : 'bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setup Grade */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Setup Quality Grade</label>
                <div className="flex gap-2">
                  {GRADES.map(({ value, color }) => (
                    <button
                      key={value}
                      onClick={() => setSetupGrade(setupGrade === value ? '' : value)}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-black border transition-all ${
                        setupGrade === value
                          ? color + ' shadow-sm'
                          : 'bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Market Structure */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Market Structure</label>
                <div className="flex flex-wrap gap-1.5">
                  {STRUCTURES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArrayItem(marketStructure, setMarketStructure, s)}
                      className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                        marketStructure.includes(s)
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confluence Factors */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider">Confluence Factors</label>
                  {confluenceFactors.length > 0 && (
                    <span className="text-[9px] font-black text-primary">{confluenceFactors.length} selected</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CONFLUENCE.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleArrayItem(confluenceFactors, setConfluenceFactors, c)}
                      className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                        confluenceFactors.includes(c)
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {confluenceFactors.includes(c) ? '✓ ' : ''}{c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: Est. PnL + Save Button ──────────────────────────────── */}
        <div className="px-4 pt-2 pb-4 border-t border-border/10 shrink-0 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/60">Est. PnL</span>
            <span className={`text-xs font-black ${(pnlData?.pnl || 0) > 0 ? 'text-green-500' : (pnlData?.pnl || 0) < 0 ? 'text-rose-500' : 'text-foreground/50'}`}>
              {formatCurrency(pnlData?.pnl || 0)}
            </span>
          </div>

          <button
            onClick={handleLogTrade}
            disabled={saving || isLoadingTrades || showLockTimer}
            className={`w-full btn-save-glow ${direction === 'LONG' ? 'btn-save-glow-buy' : 'btn-save-glow-sell'}`}
          >
            {saving ? 'Processing...' : showLockTimer ? `Locked (${renewCountdown})` : `${direction === 'LONG' ? '↑ Buy/Long' : '↓ Sell/Short'} — Save Trade`}
          </button>

          {/* Tab completion hints */}
          {(riskFilled === 0 || moodFilled === 0) && !showLockTimer && (
            <p className="text-[8px] text-muted-foreground/40 text-center flex items-center justify-center gap-1">
              <Lightbulb 
                className="w-2.5 h-2.5 text-amber-400 shrink-0" 
                style={{ filter: 'drop-shadow(0 0 2px #fbbf24)' }}
              />
              Fill <span className="text-primary/60">Risk</span> & <span className="text-primary/60">Mood</span> tabs for deeper insights
            </p>
          )}
        </div>
      </div>

      {/* ─── Currency Converter (Separate Box) ────────────────────────────── */}
      <div className="w-full shrink-0 pb-6 relative z-10">
        <CurrencyConverter />
      </div>
    </div>
  );
}

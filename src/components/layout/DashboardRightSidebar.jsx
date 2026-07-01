import { useState, useMemo } from 'react';
import { Bell, Settings, ChevronDown, Palette, ClipboardList, Shield, Brain, Cpu, Lightbulb } from 'lucide-react';
import { auth, storage } from '../../firebase';
import { calcPnl, todayStr, formatCurrency } from '../../lib/tradeUtils';
import { submitTrade, getRemainingFreeTrades } from '../../services/tradeService';
import { CurrencyConverter } from '../CurrencyConverter';
import { CustomSelect } from '../ui/CustomSelect';

import {
  ExclamationTriangleFill,
  EmojiAngryFill,
  EmojiFrownFill,
  EmojiNeutralFill,
  EmojiSmileFill,
  EmojiSunglassesFill,
  CloudArrowUp,
  LockFill,
  Trash,
} from 'react-bootstrap-icons';
import { requireProFeature } from '../../services/featureGate';
import { ImageViewerModal } from '../ImageViewerModal';
import { AnimatePresence } from 'framer-motion';

import { FREE_TRADE_LIMIT } from '../../config/tradeConfig';

// ─── Tab IDs ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',    label: 'Log',      icon: ClipboardList, color: '#00798C' },
  { id: 'risk',     label: 'Risk',     icon: Shield,        color: '#D1495B' },
  { id: 'mood',     label: 'Mood',     icon: Brain,         color: '#30638E' },
  { id: 'advanced', label: 'Advanced', icon: Cpu,           color: '#EDAE49' },
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
  isExpanded,
  setIsExpanded,
}) {
  const [activeTab, setActiveTab] = useState('basic');

  const isFree = plan === 'basic' && !isTrial;
  const isPro  = plan === 'pro' || plan === 'grace';
  const showLockTimer = !isPro && !!renewCountdown;

  // ── TAB 1: BASIC – Order Form State ────────────────────────────────────────
  const [direction, setDirection] = useState('LONG');
  const [entry, setEntry]         = useState('');
  const [exit,  setExit]          = useState('');
  const [lots,  setLots]          = useState('0.10');
  const [sl,    setSl]            = useState('');
  const [tp,    setTp]            = useState('');
  const [note,  setNote]          = useState('');
  const [session,  setSession]    = useState('');
  const [strategy, setStrategy]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeImageUrl, setActiveImageUrl] = useState(null);

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!requireProFeature(plan, setShowPricingModal, toast, 'attach analysis screenshots')) return;

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls = [];
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast?.('Please sign in to upload images.', 'error');
      setUploading(false);
      return;
    }

    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

    try {
      let completedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
        const storageRef = ref(storage, `users/${userId}/trades/${uniqueName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const totalProgress = ((completedCount + fileProgress / 100) / files.length) * 100;
              setUploadProgress(Math.round(totalProgress));
            },
            (err) => {
              console.error('File upload error in sidebar:', err);
              reject(err);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(url);
              completedCount++;
              resolve();
            }
          );
        });
      }

      setScreenshots(prev => [...prev, ...uploadedUrls]);
      toast?.('Images uploaded successfully.', 'success');
    } catch (err) {
      console.error('Upload error in sidebar:', err);
      toast?.('Failed to upload some images. Please try again.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeScreenshot = (indexToRemove) => {
    setScreenshots(prev => prev.filter((_, i) => i !== indexToRemove));
  };

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
      screenshots,
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
        setScreenshots([]);
        setActiveTab('basic');
        setIsExpanded(false);
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


  // ── Tab badge counts (optional fields filled) ──────────────────────────────
  const riskFilled    = [riskPercent !== '1' && riskPercent, maxDailyActive].filter(Boolean).length;
  const moodFilled    = [preTradeMood, confidence > 0, conviction, postReflect].filter(Boolean).length;
  const advancedFilled = [timeframe, setupGrade, marketStructure.length > 0, confluenceFactors.length > 0].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full">
            {/* ─── ORDER FORM (ACTION CENTER) ───────────────────────────────────── */}
            <div className="apple-glass-panel flex flex-col rounded-3xl relative z-30 overflow-hidden">

        {/* ── Panel Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center px-4 pt-4 pb-3 border-b border-border/10 shrink-0 relative">
          <div className="flex items-center gap-2 mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#E5B80B] shadow-[0_0_6px_rgba(229,184,11,0.6)]" />
            <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-foreground/80">Record Gold Trade</span>
            <span className="text-[10px] md:text-xs font-black uppercase bg-[#E5B80B]/15 text-[#E5B80B] px-1.5 py-0.5 rounded tracking-widest">XAU/USD</span>
          </div>
          <div className="absolute right-4 flex items-center gap-2">
            {/* PnL live preview badge */}
            {(parseFloat(entry) > 0 && parseFloat(exit) > 0) && (
              <span className={`text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg ${(pnlData?.pnl || 0) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {(pnlData?.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(pnlData?.pnl || 0)}
              </span>
            )}
          </div>
        </div>

        {/* ── Buy / Sell Segmented Control ────────────────────────────────── */}
        <div className="px-4 pt-3 shrink-0">
          <div className="flex bg-muted/60 p-0.5 rounded-xl">
            <button
              disabled={showLockTimer}
              className={`flex-1 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${direction === 'LONG' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setDirection('LONG')}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                Buy / Long
              </span>
            </button>
            <button
              disabled={showLockTimer}
              className={`flex-1 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${direction === 'SHORT' ? 'bg-rose-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setDirection('SHORT')}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                Sell / Short
              </span>
            </button>
          </div>
        </div>



        {/* ── Feature Tabs ────────────────────────────────────────────────── */}
        <div className="flex gap-0.5 border-b border-border/10 px-4 mt-1.5 shrink-0 overflow-x-auto scrollbar-none whitespace-nowrap scroll-smooth">
          {TABS.map((tab) => {
            const badge = tab.id === 'risk' ? riskFilled : tab.id === 'mood' ? moodFilled : tab.id === 'advanced' ? advancedFilled : 0;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-[11px] md:text-xs font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] group shrink-0 ${
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
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-black flex items-center justify-center">
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
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-500">Log Window Locked</span>
            <div className="bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 rounded-xl text-amber-500 text-sm font-black tracking-[0.15em] font-mono">
              {renewCountdown}
            </div>
          </div>
        )}

        {/* ── Trial / Free Tier Notice ─────────────────────────────────────── */}
        {isTrialActive && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Pro Trial Active
              </span>
              {trialTimeLeft && <span className="text-[10px] md:text-xs font-black text-foreground bg-background/50 px-2 py-0.5 rounded font-mono">{trialTimeLeft}</span>}
            </div>
            <button onClick={() => setShowPricingModal(true)} className="w-full py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] md:text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all">
              Upgrade to Pro
            </button>
          </div>
        )}

        {isFree && (
          <div className="mx-4 mt-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 overflow-hidden shrink-0">
            {/* Header row */}
            <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Free Tier
              </span>
              <span className={`text-[10px] md:text-xs font-black tabular-nums ${
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
                <p className="text-[9px] md:text-[10.5px] text-muted-foreground/50 mt-1">
                  {remainingFreeTrades} trade{remainingFreeTrades !== 1 ? 's' : ''} remaining — once limit is reached, resets after 1 hour
                </p>
              ) : (
                <p className="text-[9px] md:text-[10.5px] text-rose-400/70 mt-1">
                  Limit reached · Unlocks in: <strong className="text-rose-400 font-mono">{renewCountdown || '01:00:00'}</strong>
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="px-3 pb-3">
              <button
                onClick={() => setShowPricingModal(true)}
                className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all"
              >
                Unlock Unlimited — Upgrade Pro
              </button>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 flex flex-col gap-4">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1 — BASIC
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'basic' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">

              {/* Amount / Lots */}
              <div className="space-y-1">
                <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Amount (Lots)</label>
                <div className="relative">
                  <input
                    type="text" value={lots} onChange={handleNumericChange(setLots)} placeholder="0.10"
                    disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black uppercase text-muted-foreground">LOTS</span>
                </div>
              </div>

              {/* Entry Price */}
              <div className="space-y-1">
                <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Entry Price</label>
                <div className="relative">
                  <input
                    type="text" value={entry} onChange={handleNumericChange(setEntry)} placeholder="2345.50"
                    disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black uppercase text-primary">USD</span>
                </div>
              </div>

              {/* Exit Price */}
              <div className="space-y-1">
                <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Exit Price</label>
                <div className="relative">
                  <input
                    type="text" value={exit} onChange={handleNumericChange(setExit)} placeholder="2350.00"
                    disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black uppercase text-primary">USD</span>
                </div>
              </div>

              {/* TP / SL */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Take Profit</label>
                  <input type="text" value={tp} onChange={handleNumericChange(setTp)} placeholder="Optional" disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Stop Loss</label>
                  <input type="text" value={sl} onChange={handleNumericChange(setSl)} placeholder="Optional" disabled={showLockTimer}
                    className="w-full bg-muted/30 border border-border/20 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
              </div>

              {/* Session / Strategy */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Session</label>
                  <CustomSelect value={session} onChange={setSession} placeholder="Session" disabled={showLockTimer} className="h-10 px-3.5" align="top"
                    options={[
                      { value: 'London',   label: 'London'       },
                      { value: 'NewYork',  label: 'New York'     },
                      { value: 'Tokyo',    label: 'Tokyo'        },
                      { value: 'Sydney',   label: 'Sydney'       },
                    ]}
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Strategy</label>
                  <CustomSelect value={strategy} onChange={setStrategy} placeholder="Strategy" disabled={showLockTimer} className="h-10 px-3.5" align="top"
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
                <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Trade Notes</label>
                <textarea
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Why did you take this trade?" rows={5} disabled={showLockTimer}
                  className="w-full bg-muted/30 border border-border/20 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Screenshots Upload & Edit Zone */}
              <div className="space-y-1">
                <label className="text-[11.5px] md:text-[13px] font-bold uppercase text-foreground/75 tracking-wider pl-1 flex justify-between">
                  <span>Analysis Screenshots</span>
                  {plan !== 'pro' && <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1"><LockFill className="w-2.5 h-2.5" /> Pro Feature</span>}
                </label>

                {plan === 'pro' ? (
                  <div className="space-y-2">
                    <div className="relative border border-dashed border-border/20 hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 bg-muted/10 group hover:bg-muted/20">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading || showLockTimer}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <CloudArrowUp className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                      <span className="text-[10px] md:text-[11px] font-bold text-foreground/80 uppercase tracking-widest text-center">
                        {uploading ? `Uploading (${uploadProgress}%)...` : 'Drag & Drop or Click to Add'}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold text-muted-foreground/60 uppercase">PNG, JPG, WEBP (Max 5MB)</span>
                    </div>

                    {uploading && (
                      <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}

                    {screenshots && screenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {screenshots.map((url, i) => (
                          <div key={i} className="relative w-12 h-12 rounded-lg border border-border/50 overflow-hidden bg-muted group/thumb shadow-sm">
                            <img 
                              src={url} 
                              alt="screenshot preview" 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={() => setActiveImageUrl(url)}
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(i)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive/85 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow active:scale-90"
                              title="Delete screenshot"
                            >
                              <Trash className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => { requireProFeature(plan, setShowPricingModal, toast, 'attach analysis screenshots'); }}
                    className="border border-dashed border-border/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/5 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <LockFill className="w-5 h-5 text-muted-foreground/40" />
                    <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Attach Analysis Screenshots</span>
                    <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 mt-1">Unlock with Pro</span>
                  </div>
                )}
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
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Pip Count</span>
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
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Auto R:R Ratio</span>
                  <span className={`text-lg md:text-xl font-black ${autoRR ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                    {autoRR ? `1 : ${autoRR}` : '—'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">Est. Pips</span>
                  <span className="text-sm md:text-base font-black text-foreground/70">{(pnlData?.pips || 0).toFixed(1)}</span>
                </div>
              </div>
              {!autoRR && (
                <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center -mt-1">Fill Entry, SL & TP in the Log tab to auto-calculate</p>
              )}

              {/* Risk % per Trade */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider">Risk % per Trade</label>
                  <span className="text-[10px] md:text-xs font-black text-primary">{riskPercent || 0}%</span>
                </div>
                <input
                  type="range" min="0.1" max="10" step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  disabled={showLockTimer}
                  className="w-full h-1.5 appearance-none bg-muted/60 rounded-full accent-primary cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground/50 font-bold uppercase px-0.5">
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
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black uppercase text-muted-foreground">% RISK</span>
              </div>

              {/* Max Daily Loss */}
              <div className="p-3 rounded-2xl border border-border/20 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider">Max Daily Loss Limit</label>
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
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black uppercase text-muted-foreground">USD</span>
                  </div>
                )}
              </div>

              {/* Risk tip */}
              <div className="flex gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-amber-500 shrink-0 mt-0.5">⚡</span>
                <p className="text-[10px] md:text-[11.5px] text-muted-foreground leading-relaxed">Professional traders risk <strong className="text-foreground">1–2%</strong> per trade. Never exceed 5% to protect your capital.</p>
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
                <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider pl-1">Pre-Trade Mood</label>
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
                      <span className={`hidden lg:block text-[8px] font-black uppercase tracking-normal leading-none mt-0.5 ${
                        preTradeMood === label ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider">Confidence Level</label>
                  <span className="text-[10px] md:text-xs font-black text-primary">{confidence > 0 ? `${confidence}/10` : '—'}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setConfidence(confidence === n ? 0 : n)}
                      className={`flex-1 h-6 rounded-md text-[10px] md:text-xs font-black transition-all ${
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
                <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground/40 font-bold uppercase px-0.5">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </div>

              {/* Trade Conviction */}
              <div className="space-y-1.5">
                <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider pl-1">Trade Conviction</label>
                <div className="flex gap-2">
                  {['High', 'Medium', 'Low'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setConviction(conviction === lvl ? '' : lvl)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all ${
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
                <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider pl-1">Post-Trade Reflection</label>
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
                <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider pl-1">Timeframe</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(timeframe === tf ? '' : tf)}
                      className={`py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all ${
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
                <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider pl-1">Setup Quality Grade</label>
                <div className="flex gap-2">
                  {GRADES.map(({ value, color }) => (
                    <button
                      key={value}
                      onClick={() => setSetupGrade(setupGrade === value ? '' : value)}
                      className={`flex-1 py-2 rounded-xl text-[11px] md:text-xs font-black border transition-all ${
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
                <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider pl-1">Market Structure</label>
                <div className="flex flex-wrap gap-1.5">
                  {STRUCTURES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArrayItem(marketStructure, setMarketStructure, s)}
                      className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${
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
                  <label className="text-[11px] md:text-xs font-bold uppercase text-foreground/75 tracking-wider">Confluence Factors</label>
                  {confluenceFactors.length > 0 && (
                    <span className="text-[10px] md:text-xs font-black text-primary">{confluenceFactors.length} selected</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CONFLUENCE.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleArrayItem(confluenceFactors, setConfluenceFactors, c)}
                      className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${
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
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-foreground/60">Est. PnL</span>
            <span className={`text-xs md:text-sm font-black ${(pnlData?.pnl || 0) > 0 ? 'text-green-500' : (pnlData?.pnl || 0) < 0 ? 'text-rose-500' : 'text-foreground/50'}`}>
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
            <p className="text-[9px] md:text-[10px] text-muted-foreground/40 text-center flex items-center justify-center gap-1">
              <Lightbulb 
                className="w-2.5 h-2.5 text-[#EDAE49] shrink-0" 
                style={{ filter: 'drop-shadow(0 0 2px #EDAE49)' }}
              />
              Fill <span className="text-primary/60">Risk</span> & <span className="text-primary/60">Mood</span> tabs for deeper insights
            </p>
          )}
        </div>
      </div>
      </div>

      {/* ─── Currency Converter (Separate Box) ────────────────────────────── */}
      <div className="w-full shrink-0 pb-6 relative z-10">
        <CurrencyConverter />
      </div>

      {/* Lightbox for zooming screenshots */}
      <AnimatePresence>
        {activeImageUrl && (
          <ImageViewerModal imageUrl={activeImageUrl} onClose={() => setActiveImageUrl(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

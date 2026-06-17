import { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, X, Settings, ChevronDown, Palette } from 'lucide-react';
import { auth } from '../../firebase';
import { calcPnl, todayStr, formatCurrency } from '../../lib/tradeUtils';
import { CurrencyConverter } from '../CurrencyConverter';
import { CustomSelect } from '../ui/CustomSelect';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

export function DashboardRightSidebar({
  plan,
  isTrial,
  expiry,
  isTrialExpired,
  isTrialActive,
  renewCountdown,
  trialTimeLeft,
  trades,
  walletBalance,
  setShowPricingModal,
  toast,
  openPortal,
  addTrade,
  isLoadingTrades,
  setShowThemeSelector
}) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const notifRef = useRef();
  const profileRef = useRef();
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const isFree = plan === 'basic' && !isTrial;
  const isPro = plan === 'pro' || plan === 'grace';
  const showLockTimer = !isPro && !!renewCountdown;

  // Profile picture is a simple Apple emoji

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileCard(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Order Form State
  const [direction, setDirection] = useState('LONG');
  const [orderType, setOrderType] = useState('Market'); // Market | Limit
  
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [lots, setLots] = useState('0.10');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [note, setNote] = useState('');
  const [session, setSession] = useState('');
  const [strategy, setStrategy] = useState('');
  const [saving, setSaving] = useState(false);

  const handleNumericChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setter(val.replace(',', '.'));
    }
  };

  const pnlData = calcPnl(
    parseFloat(entry) || 0, parseFloat(exit) || 0,
    parseFloat(lots) || 0, 0,
    parseFloat(sl) || 0, parseFloat(tp) || 0,
    direction === 'LONG' ? 'BUY' : 'SELL', 0
  );

  const handleLogTrade = async () => {
    if (!entry || !exit || !lots) {
      toast('Please fill in Entry, Exit, and Amount.', 'error');
      return;
    }
    setSaving(true);
    const entryVal = parseFloat(entry);
    const exitVal = parseFloat(exit);
    const lotsVal = parseFloat(lots);
    const slVal = parseFloat(sl) || null;
    const tpVal = parseFloat(tp) || null;

    const mappedDir = direction === 'LONG' ? 'BUY' : 'SELL';
    const tradeRes = calcPnl(entryVal, exitVal, lotsVal, 0, slVal, tpVal, mappedDir, 0);
    const { pnl, pips, rr } = tradeRes;
    const outcome = pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE';

    const tradeData = {
      date: todayStr(),
      direction: mappedDir,
      entry: entryVal,
      exit: exitVal,
      lots: lotsVal,
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
      timestamp: new Date()
    };

    try {
      if(addTrade) {
        await addTrade(tradeData);
        // Set the 1-hour locked timer target ONLY if they are on a free plan AND have reached or exceeded 25 trades!
        const totalTradesCount = trades ? trades.length : 0;
        const isProUser = plan === 'pro' || plan === 'grace';
        if (!isProUser && totalTradesCount >= 25) {
          const oneHourFromNow = Date.now() + 1 * 60 * 60 * 1000;
          localStorage.setItem('xau-renew-target-v2', String(oneHourFromNow));
        }

        setEntry(''); setExit(''); setLots('0.10'); setSl(''); setTp(''); setNote(''); setSession(''); setStrategy('');
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
  
  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* HEADER: Profile & Notifications */}
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
              
              {/* User Info Header Section */}
              <div className="flex items-center gap-3 pb-3 border-b border-border/10">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden select-none">
                  <span className="text-xl">🍎</span>
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-foreground truncate capitalize">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{auth.currentUser?.email}</span>
                </div>
              </div>

              {/* Settings list */}
              <div className="flex flex-col gap-1.5">
                {/* Accent Theme Selection */}
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

                {/* Dark Mode Switch */}
                <div className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-muted/50 text-foreground transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-primary">
                      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                    </svg>
                    Dark Theme
                  </span>
                  <label htmlFor="check-profile" className="theme-switch-toggle" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
                    <input
                      id="check-profile"
                      type="checkbox"
                      className="theme-switch-input"
                      checked={!isLightMode}
                      onChange={toggleTheme}
                    />
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

                {/* Manage Sub Button (PayPal subscriptions dashboard link) */}
                <button
                  onClick={() => {
                    setShowProfileCard(false);
                    window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank');
                  }}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-wider">Manage Subscription</span>
                </button>

                {/* Logout Button */}
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

      {/* ORDER FORM (ACTION CENTER) - Made more compact for a balanced right column spacing */}
      <div className="apple-glass-panel flex flex-col p-3 rounded-[2rem] relative z-30">
        
        {/* Buy/Long | Sell/Short Segmented Control */}
        <div className="flex bg-muted p-0.5 rounded-xl mb-2 shrink-0">
          <button 
            disabled={showLockTimer}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${direction === 'LONG' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setDirection('LONG')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              Buy / Long
            </span>
          </button>
          <button 
            disabled={showLockTimer}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${direction === 'SHORT' ? 'bg-rose-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setDirection('SHORT')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              Sell / Short
            </span>
          </button>
        </div>

        {/* Order Types */}
        <div className="flex gap-3 border-b border-border/20 mb-2.5 px-1 shrink-0">
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
        
        {/* SCROLLABLE CONTENT - Spacing compressed */}
        <div className="flex flex-col gap-2.5 pb-2">

        {showLockTimer && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group shrink-0 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 z-10 relative">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                Log Window Locked
              </span>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                You can log one trade per hour. The terminal will unlock once the timer expires:
              </p>
            </div>
            <div className="bg-amber-500/15 border border-amber-500/30 px-5 py-2.5 rounded-2xl text-amber-500 text-lg font-black tracking-[0.15em] shadow-inner font-mono">
              {renewCountdown}
            </div>
          </div>
        )}

        {isTrialActive && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-3 relative overflow-hidden group shrink-0">
            <div className="flex justify-between items-center z-10 relative">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Pro Trial Active
              </span>
              {trialTimeLeft && <span className="text-[10px] font-black tracking-widest text-foreground bg-background/50 px-2 py-1 rounded-md">{trialTimeLeft}</span>}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Enjoy unlimited MT4/MT5 sync and AI analytics. Upgrade to lock in your features.
            </p>
            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-md mt-1 z-10 relative"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {isFree && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col gap-3 relative overflow-hidden group shrink-0">
            <div className="flex justify-between items-center z-10 relative">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Free Tier
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              You are on the Free plan. Upgrade to Pro to unlock auto MT4/MT5 syncing and advanced AI analytics.
            </p>
            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-md mt-1 z-10 relative"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* Trade Order Form */}
        <div className="flex flex-col relative group shrink-0 rounded-2xl">

          <div className="flex flex-col gap-2">
          
          {/* Amount / Lots */}
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Amount (Lots)</label>
            <div className="relative">
              <input 
                type="text" 
                value={lots} 
                onChange={handleNumericChange(setLots)} 
                placeholder="0.10"
                disabled={showLockTimer}
                className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-muted-foreground">LOTS</span>
            </div>
          </div>

          {/* Entry Price */}
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Entry Price</label>
            <div className="relative">
              <input 
                type="text" 
                value={entry} 
                onChange={handleNumericChange(setEntry)} 
                placeholder="2345.50"
                disabled={showLockTimer}
                className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-primary">USD</span>
            </div>
          </div>

          {/* Exit Price */}
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Exit Price</label>
            <div className="relative">
              <input 
                type="text" 
                value={exit} 
                onChange={handleNumericChange(setExit)} 
                placeholder="2350.00"
                disabled={showLockTimer}
                className="w-full bg-muted/30 border border-border/20 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-primary">USD</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Take Profit</label>
              <input 
                type="text" 
                value={tp} 
                onChange={handleNumericChange(setTp)} 
                placeholder="Optional"
                disabled={showLockTimer}
                className="w-full bg-muted/30 border border-border/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Stop Loss</label>
              <input 
                type="text" 
                value={sl} 
                onChange={handleNumericChange(setSl)} 
                placeholder="Optional"
                disabled={showLockTimer}
                className="w-full bg-muted/30 border border-border/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Session</label>
              <CustomSelect 
                value={session}
                onChange={setSession}
                placeholder="Select Session"
                disabled={showLockTimer}
                className="h-9 px-3"
                options={[
                  { value: 'London', label: 'London' },
                  { value: 'New York', label: 'New York' },
                  { value: 'Tokyo', label: 'Tokyo' },
                  { value: 'Sydney', label: 'Sydney' },
                  { value: 'Asian', label: 'Asian Range' }
                ]}
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Strategy</label>
              <CustomSelect 
                value={strategy}
                onChange={setStrategy}
                placeholder="Select Strategy"
                disabled={showLockTimer}
                className="h-9 px-3"
                options={[
                  { value: 'Breakout', label: 'Breakout' },
                  { value: 'SMC', label: 'SMC' },
                  { value: 'ICT', label: 'ICT' },
                  { value: 'Scalp', label: 'Scalp' },
                  { value: 'Swing', label: 'Swing' },
                  { value: 'S/R', label: 'S/R Bounce' }
                ]}
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-0.5 mt-0.5">
            <label className="text-[10px] font-bold uppercase text-foreground/75 tracking-wider pl-1">Trade Notes</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why did you take this trade?"
              rows={1.5}
              disabled={showLockTimer}
              className="w-full bg-muted/30 border border-border/20 rounded-xl px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

        </div>

        {/* Order Summary & Execution - Spacing reduced */}
        <div className="mt-2.5 space-y-2 shrink-0">
          
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/75">Est. Value / PnL</span>
            <span className={`text-xs font-black ${(pnlData?.pnl || 0) > 0 ? 'text-green-500' : (pnlData?.pnl || 0) < 0 ? 'text-rose-500' : 'text-foreground'}`}>
              {formatCurrency(pnlData?.pnl || 0)}
            </span>
          </div>
          
          <div className="flex items-center justify-between px-1 border-t border-border/10 pt-1.5 mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/75">Est. Pips</span>
            <span className="text-[9px] font-bold text-foreground/80">{(pnlData?.pips || 0).toFixed(1)} pips</span>
          </div>

          <button 
            onClick={handleLogTrade}
            disabled={saving || isLoadingTrades || showLockTimer}
            className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg active:scale-[0.98] ${
              showLockTimer
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 shadow-none'
                : direction === 'LONG' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20' 
                  : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
            }`}
          >
            {saving ? 'Processing...' : showLockTimer ? `Locked (${renewCountdown})` : `${direction === 'LONG' ? 'Buy/Long' : 'Sell/Short'} XAUUSD`}
          </button>
        </div>
        </div>
        </div>

      </div>

      {/* Currency Converter (Separate Box) */}
      <div className="w-full shrink-0 pb-6 relative z-10">
        <CurrencyConverter />
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  House, HouseFill,
  ClockHistory, ClockFill,
  Calendar3, Calendar3Fill,
  BarChartLine, BarChartLineFill,
  Book, BookFill,
  Gear, GearFill,
  Stars,
  BoxArrowRight,
  SunFill,
  MoonStarsFill,
  CreditCard,
  PersonCircle,
  Lightning,
  LightningFill,
  LockFill,
  Palette,
  ExclamationTriangleFill,
  Bell
} from 'react-bootstrap-icons';
import { auth } from '../../firebase';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useBrokerAccounts } from '../../hooks/useBrokerAccounts';
import Logo from '../Logo';

import { useTrades } from '../../hooks/useTrades';
import { useJournals } from '../../hooks/useJournals';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../ToastContext';
import { DashboardRightSidebar } from './DashboardRightSidebar';

export function DashboardLayout({ user, plan, expiry, isTrial, isTrialExpired, totalTrades, setShowPricingModal, openPortal }) {
  const { isLightMode, toggleTheme, currentTemplate, setTemplate } = useAppTheme();
  const { accounts, syncAccount } = useBrokerAccounts();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showDesktopProfile, setShowDesktopProfile] = useState(false);
  const [showDesktopNotifications, setShowDesktopNotifications] = useState(false);
  const desktopProfileRef = useRef(null);
  const desktopNotifRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('xau-sidebar-expanded');
    return saved !== 'false'; // default to true
  });

  const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Trader';
  const formattedTime = new Date(currentTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  
  // Profile picture is a simple Apple emoji

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const newVal = !prev;
      localStorage.setItem('xau-sidebar-expanded', String(newVal));
      return newVal;
    });
  };

  const [trialTimeLeft, setTrialTimeLeft] = useState('');
  const [renewCountdown, setRenewCountdown] = useState('');

  const hasTrial = isTrial || plan === 'free';
  const computedIsTrialActive = hasTrial && expiry && new Date(expiry) > new Date();
  const computedIsTrialExpired = hasTrial && (!expiry || new Date(expiry) < new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      if (hasTrial && expiry) {
        const exp = new Date(expiry);
        const diff = exp - now;
        if (diff > 0) {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / 1000 / 60) % 60);
          setTrialTimeLeft(`${d}d ${h}h ${m}m`);
        } else {
          setTrialTimeLeft('Expired');
        }
      } else if (hasTrial && !expiry) {
        // Fallback demo timer if no expiry is set in DB
        setTrialTimeLeft('6d 23h 59m');
      }

      // 1-hour renewal countdown (starts only after user logs a trade)
      let target = localStorage.getItem('xau-renew-target-v2');
      if (!target) {
        setRenewCountdown('');
        return;
      }

      const remaining = Number(target) - Date.now();
      if (remaining <= 0) {
        localStorage.removeItem('xau-renew-target-v2');
        setRenewCountdown('');
      } else {
        const rh = Math.floor(remaining / (1000 * 60 * 60));
        const rm = Math.floor((remaining / (1000 * 60)) % 60);
        const rs = Math.floor((remaining / 1000) % 60);
        const hh = String(rh).padStart(2, '0');
        const mm = String(rm).padStart(2, '0');
        const ss = String(rs).padStart(2, '0');
        setRenewCountdown(`${hh}:${mm}:${ss}`);
      }
    };

    updateTimers();
    const intervalId = setInterval(updateTimers, 1000);
    return () => clearInterval(intervalId);
  }, [hasTrial, expiry]);

  // Background sync on dashboard load / mount
  useEffect(() => {
    if (accounts.length > 0) {
      const activeAccount = accounts[0];
      syncAccount(activeAccount.id)
        .then(() => {
          console.log('Background broker sync successful.');
        })
        .catch((err) => {
          console.warn('Background broker sync failed:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length]);

  const profileMenuRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setShowProfileMenu(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (desktopProfileRef.current && !desktopProfileRef.current.contains(event.target)) {
        setShowDesktopProfile(false);
      }
      if (desktopNotifRef.current && !desktopNotifRef.current.contains(event.target)) {
        setShowDesktopNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { trades, isLoading: isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync } = useTrades(user);

  const { journals, isLoading: isLoadingJournals, saveJournalEntry, deleteEntry } = useJournals(user);
  const { walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet } = useWallet(user);

  const navigation = [
    { id: '', name: 'Dashboard', icon: House, iconSolid: HouseFill },
    { id: 'history', name: 'History', icon: ClockHistory, iconSolid: ClockFill },
    { id: 'calendar', name: 'Calendar', icon: Calendar3, iconSolid: Calendar3Fill },
    { id: 'analytics', name: 'Analytics', icon: BarChartLine, iconSolid: BarChartLineFill },
    { id: 'journal', name: 'Journal', icon: Book, iconSolid: BookFill },
    { id: 'sync', name: 'Sync', icon: Lightning, iconSolid: LightningFill }
  ].filter(Boolean);

  return (
    <div className="h-screen md:h-screen min-h-screen flex flex-col md:flex-row bg-background selection:bg-primary/20 relative overflow-y-auto md:overflow-hidden">

      {/* GLASSMORPHIC BACKGROUND MESH */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className={`group hidden md:flex flex-col sticky top-0 h-screen apple-glass-panel border-r-0 z-30 p-5.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'w-64' : 'w-24 items-center'}`}>
        {/* LOGO & TOGGLE */}
        <div className={`flex items-center w-full mb-7 relative ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
          <div 
            className={`flex items-center cursor-pointer transition-all duration-500 ${isSidebarExpanded ? 'gap-2.5' : 'gap-0'}`} 
            onClick={() => navigate('/app')}
          >
            <Logo onlyIcon={!isSidebarExpanded} iconSize="w-7.5 h-7.5" />
            <div className={`flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSidebarExpanded 
                ? 'opacity-100 max-w-[110px] translate-x-0' 
                : 'opacity-0 max-w-0 overflow-hidden pointer-events-none -translate-x-2'
            }`}>
              <span className="text-[9px] font-black uppercase text-primary tracking-widest whitespace-nowrap">
                {plan === 'pro' && isTrial ? 'Pro (Trial)' : `${plan} tier`}
              </span>
            </div>
          </div>
          {/* Collapse/Expand Toggle button */}
          <button
            onClick={toggleSidebar}
            className={`w-6 h-6 rounded-lg bg-muted border border-border/40 flex items-center justify-center text-foreground hover:bg-muted/80 transition-all duration-300 absolute top-1/2 -translate-y-1/2 z-10 ${isSidebarExpanded ? 'right-0' : '-right-2'} opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus:opacity-100 focus:pointer-events-auto active:opacity-100 active:pointer-events-auto`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg
              className={`w-3.5 h-3.5 transform transition-transform duration-300 ${isSidebarExpanded ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="w-full flex-1 flex flex-col gap-3">
          {navigation.map((item) => {
            const isActive = item.id === ''
              ? (location.pathname === '/app' || location.pathname === '/app/') && !location.search.includes('tab=log')
              : item.id.startsWith('?tab=')
                ? location.search.includes(item.id.slice(1))
                : location.pathname.startsWith(`/app/${item.id}`);
            const Icon = isActive ? item.iconSolid : item.icon;
            return (
              <NavLink
                key={item.name}
                to={`/app/${item.id}`}
                className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSidebarExpanded 
                    ? 'px-4 w-full h-12 gap-3 rounded-xl' 
                    : 'px-0 w-12 h-12 justify-center gap-0 rounded-full'
                } ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/15'
                  : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                }`}
                title={!isSidebarExpanded ? item.name : undefined}
              >
                <Icon className="w-[1.25rem] h-[1.25rem] shrink-0" />
                <span className={`text-[12px] font-black uppercase tracking-widest transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSidebarExpanded 
                    ? 'opacity-100 max-w-[150px] ml-0' 
                    : 'opacity-0 max-w-0 ml-0 overflow-hidden pointer-events-none'
                }`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* BROKER SYNC STATUS PANEL */}
        {accounts.length > 0 && (
          <div className={`mt-4 mb-2 rounded-xl border border-border/20 bg-background/30 backdrop-blur-md shadow-sm w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'p-4' : 'p-2'}`}>
            {(() => {
              const acc = accounts[0];
              let statusObj = { label: 'Active', color: 'text-emerald-500', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', desc: 'Syncing automatically' };
              
              if (acc.lastSyncStatus === 'failed') {
                statusObj = { label: 'Disconnected', color: 'text-rose-500', dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]', desc: 'Connection failed' };
              } else if (acc.lastSyncTime) {
                const elapsedMinutes = (currentTime - new Date(acc.lastSyncTime).getTime()) / 60000;
                if (elapsedMinutes > 5) {
                  statusObj = { label: 'Sync Delayed', color: 'text-amber-500', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]', desc: `Last sync: ${Math.round(elapsedMinutes)}m ago` };
                }
              }

              return (
                <div className={`flex flex-col gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? '' : 'items-center gap-1.5'}`}>
                  {/* Top row */}
                  <div className={`flex items-center justify-between w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'flex-row' : 'flex-col justify-center'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'}`}>
                      Broker Terminal
                    </p>
                    <div className="flex items-center gap-1.5" title={statusObj.desc}>
                      <span className={`w-2 h-2 rounded-full ${statusObj.dot} animate-pulse shrink-0`} />
                      <span className={`text-[9px] font-black uppercase tracking-wider transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${statusObj.color} ${isSidebarExpanded ? 'opacity-100 max-w-[80px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'}`}>
                        {statusObj.label}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row / account details */}
                  <div className={`flex items-center justify-between gap-2 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'flex-row' : 'flex-col justify-center'}`}>
                    <div className={`truncate transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'}`}>
                      <p className="text-xs font-bold truncate">{acc.accountName || acc.server}</p>
                      <p className="text-[10px] font-medium text-muted-foreground truncate">{statusObj.desc}</p>
                    </div>
                    {statusObj.label !== 'Active' && (
                      <button
                        onClick={() => navigate('/app/sync')}
                        className={`shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isSidebarExpanded ? 'w-7 h-7' : 'w-6 h-6'
                        }`}
                        title="Manage Sync"
                      >
                        <LightningFill className={isSidebarExpanded ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SIDEBAR FOOTER SECTION */}
        <div className="mt-auto w-full flex flex-col gap-3">
          {/* TRIAL WARNING / EXPIRED CARD */}
          {hasTrial && (
            <div className="w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {isSidebarExpanded ? (
                computedIsTrialActive ? (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex flex-col gap-2 relative overflow-hidden shadow-sm">
                    <div className="flex gap-2">
                      <LightningFill className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-[11px] font-black uppercase tracking-wider text-primary">
                        Trial Active
                      </div>
                    </div>
                    <p className="text-[11.5px] leading-relaxed font-semibold text-foreground/80 m-0">
                      Your 7-day trial is active with sync option. Terminal locks in: <strong className="text-primary">{trialTimeLeft}</strong>
                    </p>
                    <button
                      onClick={() => setShowPricingModal?.(true)}
                      className="w-full mt-1.5 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
                    >
                      Upgrade To Pro
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex flex-col gap-2 relative overflow-hidden shadow-sm">
                    <div className="flex gap-2">
                      <ExclamationTriangleFill className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Terminal Locked
                      </div>
                    </div>
                    <p className="text-[11.5px] leading-relaxed font-semibold text-amber-700/95 dark:text-amber-200/90 m-0">
                      Your 7-day trial has expired. Upgrade to Premium or wait <strong className="text-amber-600 dark:text-amber-400">{renewCountdown}</strong> for access to renew.
                    </p>
                    <button
                      onClick={() => setShowPricingModal?.(true)}
                      className="w-full mt-1.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={() => setShowPricingModal?.(true)}
                  className={`w-12 h-12 mx-auto rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                    computedIsTrialActive 
                      ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                  }`}
                  title={computedIsTrialActive ? `Trial Active - Locks in ${trialTimeLeft}` : `Terminal Locked - Renews in ${renewCountdown}`}
                >
                  {computedIsTrialActive ? <LightningFill className="w-5 h-5" /> : <ExclamationTriangleFill className="w-5 h-5" />}
                </button>
              )}
            </div>
          )}

          {/* DESKTOP PROFILE & NOTIFICATIONS CARD */}
          <div className={`w-full relative z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? '' : 'flex flex-col items-center'}`}>
            <div className={`desktop-profile-card flex items-center justify-between bg-card/45 backdrop-blur-md border border-border/20 rounded-2xl w-full p-2 ${
              isSidebarExpanded ? 'flex-row' : 'flex-col gap-3'
            }`}>
              {/* Profile Identity */}
              <div className="flex items-center gap-2 relative" ref={desktopProfileRef}>
                <div
                  onClick={() => setShowDesktopProfile(!showDesktopProfile)}
                  className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer shadow-sm overflow-hidden select-none"
                >
                  <span className="text-base">🍎</span>
                </div>
                
                {isSidebarExpanded && (
                  <div className="flex flex-col text-left">
                    <span className="text-[12.5px] font-bold text-foreground capitalize flex items-center gap-1">
                      {displayName}
                      <svg className="w-2.5 h-2.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                    <span className="text-[9.5px] font-black uppercase text-primary tracking-[0.05em] bg-primary/10 px-1.5 py-0.5 rounded text-center mt-0.5 w-max flex items-center gap-1 font-mono">
                      {formattedTime}
                    </span>
                  </div>
                )}

                {showDesktopProfile && (
                  <div className="absolute z-50 w-60 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95 bottom-0 left-[calc(100%+12px)]">
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
                        onClick={() => { setShowDesktopProfile(false); setShowThemeSelector?.(true); }}
                        className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-primary" />
                          Color Accent
                        </span>
                        <span className="text-[8px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Change</span>
                      </button>

                      <div className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors text-[10px] font-black uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          {isLightMode ? (
                            <SunFill className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <MoonStarsFill className="w-3.5 h-3.5 text-primary" />
                          )}
                          Dark Theme
                        </span>
                        <label htmlFor="check-desktop-profile" className="theme-switch-toggle" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
                          <input id="check-desktop-profile" type="checkbox" className="theme-switch-input" checked={!isLightMode} onChange={toggleTheme} />
                          <div className="theme-switch-icon theme-switch-icon--moon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={12} height={12}>
                              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="theme-switch-icon theme-switch-icon--sun">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={12} height={12}>
                              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          setShowDesktopProfile(false);
                          window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank');
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider text-left"
                      >
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span>Subscription</span>
                      </button>

                      <button
                        onClick={() => { setShowDesktopProfile(false); localStorage.removeItem('xau-auth-hint'); auth.signOut(); }}
                        className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider text-left mt-1 border-t border-border/10 pt-2"
                      >
                        <BoxArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={desktopNotifRef}>
                <button
                  onClick={() => setShowDesktopNotifications(!showDesktopNotifications)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 border border-border/40 hover:bg-muted text-muted-foreground transition-all relative shadow-sm"
                >
                  <Bell size={15} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 border border-card"></span>
                </button>

                {showDesktopNotifications && (
                  <div className="absolute z-50 w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 bottom-0 left-[calc(100%+12px)]">
                    <div className="flex items-center justify-between border-b border-border/10 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notifications</span>
                      <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">2 New</span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                      <div className="flex gap-2.5 items-start p-1.5 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <span className="text-blue-500 text-xs">🚀</span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-foreground">Welcome to XauJournal</p>
                          <p className="text-[9px] text-muted-foreground leading-snug">Your premium trading journey begins now.</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start p-1.5 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <span className="text-amber-500 text-xs">⚠️</span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-foreground">Complete Setup</p>
                          <p className="text-[9px] text-muted-foreground leading-snug">Connect your MT4/MT5 account to auto-sync trades.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] h-auto md:h-screen overflow-y-auto custom-scrollbar">
        {/* MOBILE HEADER (only visible on mobile/tablet) */}
        <header className={`md:hidden fixed top-3 left-3 right-3 z-40 apple-glass-panel rounded-2xl transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[calc(100%+20px)] opacity-0'}`}>
          <div className="h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app')}>
              <Logo iconSize="w-7 h-7" />
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Template Palette Selector */}
              <button
                onClick={() => setShowThemeSelector(true)}
                className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 border border-border/40 flex items-center justify-center transition-colors cursor-pointer"
                title="Change Accent Template"
              >
                <Palette className="w-4 h-4 text-foreground/70" />
              </button>

              {/* Custom Moon/Sun Theme Toggle Switch */}
              <label htmlFor="check-mobile" className="theme-switch-toggle" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
                <input
                  id="check-mobile"
                  type="checkbox"
                  className="theme-switch-input"
                  checked={!isLightMode}
                  onChange={toggleTheme}
                />
                <div className="theme-switch-icon theme-switch-icon--moon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="theme-switch-icon theme-switch-icon--sun">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
              </label>

              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer overflow-hidden select-none"
              >
                <span className="text-base">🍎</span>
              </button>
            </div>
          </div>
 
          {showProfileMenu && (
            <div className="absolute top-16 right-4 w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 z-50 animate-in fade-in zoom-in-95">
              
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
                  onClick={() => { setShowProfileMenu(false); setShowThemeSelector?.(true); }}
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
                    {isLightMode ? (
                      <SunFill className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <MoonStarsFill className="w-3.5 h-3.5 text-primary" />
                    )}
                    Dark Theme
                  </span>
                  <label htmlFor="check-mobile-profile" className="theme-switch-toggle" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
                    <input
                      id="check-mobile-profile"
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
 
                {/* Manage Sub Button (PayPal billing portal link) */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank');
                  }}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer text-left"
                >
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Manage Subscription</span>
                </button>
 
                {/* Logout Button */}
                <button
                  onClick={() => { setShowProfileMenu(false); localStorage.removeItem('xau-auth-hint'); auth.signOut(); }}
                  className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer text-left mt-1 border-t border-border/10 pt-2"
                >
                  <BoxArrowRight className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Logout</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* 3-COLUMN INNER GRID ON DESKTOP */}
        <div className="flex-1 flex flex-col-reverse lg:flex-row max-w-[1550px] w-full mx-auto pt-20 px-6 pb-6 md:py-6 md:px-6 lg:px-8 gap-6 md:pb-8">

          {/* MIDDLE COLUMN - OUTLET CONTENT */}
          <main className="flex-1 min-w-0 relative">
            {/* Ambient Background Glows for Apple Glass Effect */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-screen" />



            <Outlet context={{
              user, plan, expiry, isTrial, isTrialExpired, totalTrades, setShowPricingModal, openPortal,
              trades, isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades,
              journals, isLoadingJournals, saveJournalEntry, deleteEntry,
              walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, lastMT5Sync
            }} />
          </main>

          {/* RIGHT COLUMN - SIDEBAR (Only visible on Log page) */}
          {(location.pathname === '/app' || location.pathname === '/app/') && (
            <aside className="w-full lg:w-[350px] shrink-0">
              <DashboardRightSidebar
                plan={plan}
                isTrial={isTrial}
                expiry={expiry}
                isTrialExpired={computedIsTrialExpired}
                isTrialActive={computedIsTrialActive}
                renewCountdown={renewCountdown}
                trialTimeLeft={trialTimeLeft}
                trades={trades}
                journals={journals}
                walletBalance={walletBalance}
                setShowPricingModal={setShowPricingModal}
                toast={toast}
                openPortal={openPortal}
                resetTrades={resetTrades}
                updateBalance={updateBalance}
                addTrade={addTrade}
                isLoadingTrades={isLoadingTrades}
                setShowThemeSelector={setShowThemeSelector}
              />
            </aside>
          )}
        </div>

        {/* FOOTER */}
        <footer className="w-full py-8 px-4 border-t border-border/10 bg-muted/5 flex flex-col items-center justify-center gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center animate-pulse">
            made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </p>
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 text-center">
            Copyright © 2026 xaujournal. All Rights Reserved
          </p>
        </footer>
      </div>

      {/* MOBILE NAV */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 transition-[transform,opacity] duration-300 ease-[var(--apple-ease)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="apple-glass-panel rounded-[2rem] h-16 flex items-center justify-between px-2 safe-bottom mb-4">
          {navigation.map((item) => {
            const isActive = item.id === '' ? (location.pathname === '/app' || location.pathname === '/app/') : location.pathname.startsWith(`/app/${item.id}`);
            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <NavLink
                key={item.name}
                to={`/app/${item.id}`}
                className={`group relative flex items-center justify-center h-12 rounded-2xl transition-all duration-500 ease-[var(--apple-ease)] ${isActive
                  ? 'bg-primary text-primary-foreground px-3 sm:px-4 flex-grow mx-0.5 sm:mx-1 shadow-lg shadow-primary/25'
                  : 'text-foreground/60 w-10 sm:w-12 hover:bg-muted mx-0.5'
                  }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'group-hover:scale-110'}`} />

                <AnimatePresence mode="popLayout" initial={false}>
                  {isActive && (
                    <Motion.span
                      layout
                      initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                      animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                      exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      className="text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap overflow-hidden mobile-nav-label"
                    >
                      {item.name}
                    </Motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </div>
      </nav>
      {/* THEME TEMPLATE CUSTOMIZER MODAL */}
      <AnimatePresence>
        {showThemeSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowThemeSelector(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            {/* Modal Box */}
            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-[420px] apple-glass-panel rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative z-10 select-none overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground m-0">Choose Color</h3>
                </div>
                <button
                  onClick={() => setShowThemeSelector(false)}
                  className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors border-0 outline-none text-foreground/50 hover:text-foreground"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'sage-modern', name: 'Sage Modern', desc: 'Minimalist sage green & lavender' },
                  { id: 'obsidian-teal', name: 'Obsidian Teal', desc: 'Sleek dark teal & platinum' },
                  { id: 'nordic-slate', name: 'Nordic Slate', desc: 'Ice blue & frost white' },
                  { id: 'crimson-rust', name: 'Crimson Rust', desc: 'Deep terracotta & copper gold' },
                  { id: 'royal-gold', name: 'Royal Gold', desc: 'Rich gold & dark bronze' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplate(t.id);
                      toast(`Accent changed to ${t.name}`, 'success');
                    }}
                    className={`theme-${t.id} w-full flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-300 ${currentTemplate === t.id
                      ? 'bg-primary/5 border-primary/40'
                      : 'bg-muted/30 hover:bg-muted/70 border-transparent'
                      }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-lg bg-gradient-to-br from-primary to-primary-to"
                      style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.4)' }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-[11px] font-black uppercase tracking-wider text-foreground m-0">{t.name}</p>
                      <p className="text-[9px] font-medium text-muted-foreground/60 m-0 uppercase tracking-widest">{t.desc}</p>
                    </div>
                    {currentTemplate === t.id && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

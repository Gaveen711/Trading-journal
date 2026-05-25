import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  House, HouseFill,
  ClockHistory, ClockFill,
  Calendar3, Calendar3Fill,
  BarChartLine, BarChartLineFill,
  Book, BookFill,
  Stars,
  BoxArrowRight,
  SunFill,
  MoonStarsFill,
  CreditCard,
  PersonCircle,
  Lightning,
  LightningFill,
  ArrowClockwise,
  LockFill
} from 'react-bootstrap-icons';
import { auth } from '../../firebase';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useToast } from '../ToastContext';
import Logo from '../Logo';

import { useTrades } from '../../hooks/useTrades';
import { useJournals } from '../../hooks/useJournals';
import { useWallet } from '../../hooks/useWallet';

export function DashboardLayout({ user, plan, expiry, totalTrades, totalJournals, setShowPricingModal, openBrokerSyncUpsell, openPortal }) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const canBrokerSync = plan === 'pro' || plan === 'grace';

  const profileMenuRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show if scrolling up or at the very top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide if scrolling down and not at the top
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { trades, isLoading: isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync } = useTrades(user);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const thisMonthTradesCount = trades.filter(t => t.date >= monthStart).length;
  const { journals, isLoading: isLoadingJournals, saveJournalEntry, deleteEntry } = useJournals(user);
  const { walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet } = useWallet(user);

  const [copied, setCopied] = useState(false);
  const copyUid = () => {
    navigator.clipboard.writeText(user?.uid || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function handleSyncClick() {
    if (!canBrokerSync) {
      openBrokerSyncUpsell?.();
      return;
    }
    navigate('/app/sync');
  }

  const navigation = [
    { id: '', name: 'Log', icon: House, iconSolid: HouseFill },
    { id: 'history', name: 'History', icon: ClockHistory, iconSolid: ClockFill },
    { id: 'calendar', name: 'Calendar', icon: Calendar3, iconSolid: Calendar3Fill },
    { id: 'analytics', name: 'Analytics', icon: BarChartLine, iconSolid: BarChartLineFill },
    { id: 'journal', name: 'Journal', icon: Book, iconSolid: BookFill },
    (plan === 'pro' || plan === 'grace') && { id: 'sync', name: 'Sync', icon: Lightning, iconSolid: LightningFill }
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">

      {/* TOP NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 safe-top transition-[transform,opacity] duration-300 ease-[var(--apple-ease)] ${isVisible ? 'translate-y-0 opacity-100' : 'max-md:-translate-y-full max-md:opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group transition-all duration-300" onClick={() => navigate('/app')}>
                <Logo iconSize="w-7 h-7" />
                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.15em] border transition-all duration-500 ${plan === 'pro' ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-white/5 text-foreground/40 border-white/10'}`}>
                  {plan}
                </div>
              </div>

              {/* DESKTOP NAV */}
              <div className="hidden md:flex items-center gap-1.5 bg-muted/20 p-1.5 rounded-2xl border border-border/10 backdrop-blur-md">
                {navigation.map((item) => {
                  const isActive = item.id === '' ? (location.pathname === '/app' || location.pathname === '/app/') : location.pathname.startsWith(`/app/${item.id}`);
                  const Icon = isActive ? item.iconSolid : item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={`/app/${item.id}`}
                      className={`group relative flex items-center h-11 px-4 rounded-xl transition-all duration-500 ease-[var(--apple-ease)] ${isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <Icon className={`w-[1.2rem] h-[1.2rem] shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'group-hover:scale-110'}`} />

                      <AnimatePresence mode="popLayout" initial={false}>
                        {isActive && (
                          <Motion.span
                            layout
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: 'auto', opacity: 1, marginLeft: 10 }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden"
                          >
                            {item.name}
                          </Motion.span>
                        )}
                      </AnimatePresence>

                      {/* HOVER LABEL (Only if not active) */}
                      {!isActive && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-foreground text-background text-[8px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-1.5 sm:gap-4 ml-1.5 pl-2 sm:ml-2 sm:pl-4 border-l border-border/20 relative" ref={profileMenuRef}>

              {plan === 'free' && (
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-1 px-2 py-1.5 sm:gap-1.5 sm:px-3 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 group"
                >
                  <Stars className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform duration-500" />
                  <span className="text-[10px] font-black uppercase text-primary hidden sm:inline">Upgrade</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSyncClick}
                title={canBrokerSync ? 'Open broker sync terminal' : 'Pro feature — upgrade to sync'}
                className={`flex items-center gap-1 px-2 py-1.5 sm:gap-1.5 sm:px-3 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                  canBrokerSync
                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105'
                    : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/50 cursor-pointer'
                }`}
              >
                {canBrokerSync ? (
                  <ArrowClockwise className="w-3.5 h-3.5" />
                ) : (
                  <LockFill className="w-3 h-3 opacity-60" />
                )}
                <span className="hidden sm:inline">Sync now</span>
              </button>

              {/* MT5 LIVE SYNC INDICATOR */}
              {lastMT5Sync && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 animate-in fade-in duration-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">MT5</span>
                </div>
              )}

              <button onClick={toggleTheme} className="p-2 sm:p-2.5 rounded-xl border border-border/40 hover:bg-muted hover:scale-110 active:scale-90 transition-all duration-300 text-foreground/70 hover:text-foreground">
                {isLightMode ? <MoonStarsFill className="w-4 h-4" /> : <SunFill className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted border flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 ${showProfileMenu ? 'border-primary ring-2 ring-primary/20' : 'border-border/40'}`}
              >
                <PersonCircle className={`w-5 h-5 transition-colors duration-300 ${showProfileMenu ? 'text-primary' : 'text-foreground/70'}`} />
              </button>

              {/* DROPDOWN */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in zoom-in-95 duration-200">

                  <div className="px-3 py-2 border-b border-border/20 mb-1">
                    <p className="text-[10px] font-black uppercase text-foreground/40">My Profile</p>
                    <p className="text-sm font-bold truncate text-foreground/90">{auth.currentUser?.email}</p>
                  </div>

                  {plan === 'pro' && (
                    <button onClick={() => { setShowProfileMenu(false); openPortal(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 text-primary transition-all duration-200 group">
                      <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black uppercase">Manage Billing</span>
                    </button>
                  )}

                  {plan === 'free' && (
                    <button onClick={() => { setShowProfileMenu(false); setShowPricingModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 text-primary transition-all duration-200 group">
                      <Stars className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span className="text-[11px] font-black uppercase">Upgrade Account</span>
                    </button>
                  )}



                  <button onClick={() => { localStorage.removeItem('xau-auth-hint'); auth.signOut(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-destructive mt-1 hover:bg-destructive/10 rounded-lg transition-all duration-200 group">
                    <BoxArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase">Logout</span>
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 w-full">
        <Outlet context={{
          user, plan, expiry, totalTrades, setShowPricingModal, openPortal,
          trades, isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades,
          journals, isLoadingJournals, saveJournalEntry, deleteEntry,
          walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, lastMT5Sync
        }} />
      </main>

      {/* FOOTER */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-border/10 bg-muted/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">

          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo iconSize="w-7 h-7" />
            </div>

          </div>

          <div className="flex flex-col items-center md:items-end gap-3 uppercase font-black text-[10px] tracking-widest">
            <p className="text-foreground/30 flex items-center gap-3">
              <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</NavLink>
            </p>

            <p className="flex gap-2 uppercase font-black text-[9px] tracking-[0.2em]">
              <span className="text-foreground/30">© {new Date().getFullYear()}</span>
              <span className="animate-rgb cursor-help hover:scale-105 transition-all duration-300">
                xaujournal
              </span>
            </p>
          </div>

        </div>

        <style>{`
          @keyframes rgbCycle {
              0%   { color: #ff0000; }
              16%  { color: #ff8000; }
              33%  { color: #ffff00; }
              50%  { color: #00ff00; }
              66%  { color: #0080ff; }
              83%  { color: #8000ff; }
              100% { color: #ff0000; }
          }
        `}</style>
      </footer>

      {/* MOBILE NAV */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 transition-[transform,opacity] duration-300 ease-[var(--apple-ease)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-background/90 backdrop-blur-xl border border-border/40 rounded-[2rem] h-16 flex items-center justify-between px-2 shadow-2xl safe-bottom mb-4">
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

    </div>
  );
}

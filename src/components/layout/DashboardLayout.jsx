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
import { useBrokerAccounts } from '../../hooks/useBrokerAccounts';
import Logo from '../Logo';

import { useTrades } from '../../hooks/useTrades';
import { useJournals } from '../../hooks/useJournals';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../ToastContext';
import { DashboardRightSidebar } from './DashboardRightSidebar';

export function DashboardLayout({ user, plan, expiry, isTrial, isTrialExpired, totalTrades, setShowPricingModal, openPortal }) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const { accounts, syncAccount } = useBrokerAccounts();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { trades, isLoading: isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync } = useTrades(user);

  const { journals, isLoading: isLoadingJournals, saveJournalEntry, deleteEntry } = useJournals(user);
  const { walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet } = useWallet(user);

  const navigation = [
    { id: '', name: 'Log', icon: House, iconSolid: HouseFill },
    { id: 'history', name: 'History', icon: ClockHistory, iconSolid: ClockFill },
    { id: 'calendar', name: 'Calendar', icon: Calendar3, iconSolid: Calendar3Fill },
    { id: 'analytics', name: 'Analytics', icon: BarChartLine, iconSolid: BarChartLineFill },
    { id: 'journal', name: 'Journal', icon: Book, iconSolid: BookFill },
    (plan === 'pro' || plan === 'grace') && { id: 'sync', name: 'Sync', icon: Lightning, iconSolid: LightningFill }
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background selection:bg-primary/20">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card border-r border-border/30 z-30 p-6">
        {/* LOGO */}
        <div className="flex items-center gap-2.5 mb-8 cursor-pointer" onClick={() => navigate('/app')}>
          <Logo iconSize="w-8 h-8" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-primary tracking-widest">
              {plan === 'pro' && isTrial ? 'Pro (Trial)' : `${plan} tier`}
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 flex flex-col gap-3.5">
          {navigation.map((item) => {
            const isActive = item.id === '' ? (location.pathname === '/app' || location.pathname === '/app/') : location.pathname.startsWith(`/app/${item.id}`);
            const Icon = isActive ? item.iconSolid : item.icon;
            return (
              <NavLink
                key={item.name}
                to={`/app/${item.id}`}
                className={`flex items-center gap-3 h-11 px-4 rounded-xl transition-all duration-300 ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                  : 'text-foreground/75 hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-[1.2rem] h-[1.2rem] shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* SIDEBAR ACTIONS (Logout / Theme) */}
        <div className="mt-auto pt-6 border-t border-border/20 flex flex-col gap-4">
          <div className="flex items-center justify-between mt-2">
            {/* Custom 3D rotate theme switch */}
            <div className="checkbox-wrapper-5" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
              <div className="check">
                <input
                  id="check-desktop"
                  type="checkbox"
                  checked={!isLightMode}
                  onChange={toggleTheme}
                />
                <label htmlFor="check-desktop" />
              </div>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('xau-auth-hint'); auth.signOut(); }}
              className="Btn"
              title="Log out"
            >
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" fill="white" />
                </svg>
              </div>
              <div className="text">Logout</div>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* MOBILE HEADER (only visible on mobile/tablet) */}
        <header className={`md:hidden sticky top-0 z-40 bg-card/85 backdrop-blur-md border-b border-border/40 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app')}>
              <Logo iconSize="w-7 h-7" />
            </div>

            <div className="flex items-center gap-3">
              {/* Custom 3D rotate theme switch */}
              <div className="checkbox-wrapper-5" title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}>
                <div className="check">
                  <input
                    id="check-mobile"
                    type="checkbox"
                    checked={!isLightMode}
                    onChange={toggleTheme}
                  />
                  <label htmlFor="check-mobile" />
                </div>
              </div>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-xl bg-muted border border-border/40 flex items-center justify-center hover:shadow-none"
              >
                <PersonCircle className="w-4 h-4 text-foreground/70" />
              </button>
            </div>
          </div>

          {/* MOBILE DROPDOWN */}
          {showProfileMenu && (
            <div className="absolute top-16 right-4 w-52 bg-background border border-border/50 rounded-2xl p-2 shadow-2xl z-50">
              <div className="px-3 py-1.5 border-b border-border/20 mb-1">
                <p className="text-[9px] font-black uppercase text-muted-foreground">My Profile</p>
                <p className="text-xs font-bold truncate">{auth.currentUser?.email}</p>
              </div>
              <button 
                onClick={() => { setShowProfileMenu(false); auth.signOut(); }}
                className="Btn"
                title="Log out"
              >
                <div className="sign">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" fill="white" />
                  </svg>
                </div>
                <div className="text">Logout</div>
              </button>
            </div>
          )}
        </header>

        {/* 3-COLUMN INNER GRID ON DESKTOP */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 md:p-8 gap-8 pb-24 md:pb-8">
          
          {/* MIDDLE COLUMN - OUTLET CONTENT */}
          <main className="flex-1 min-w-0">
            {isTrialExpired && (
              <div className="mb-6 p-4 md:p-5 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm backdrop-blur-md relative overflow-hidden group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">7-Day Pro Trial Expired</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                    You've been downgraded to the Basic tier. Upgrade to Pro to resume MT4/MT5 auto-sync and unlimited trades.
                  </p>
                </div>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 active:scale-95 shadow-md flex-shrink-0"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}

            <Outlet context={{
              user, plan, expiry, isTrial, isTrialExpired, totalTrades, setShowPricingModal, openPortal,
              trades, isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades,
              journals, isLoadingJournals, saveJournalEntry, deleteEntry,
              walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, lastMT5Sync
            }} />
          </main>

          {/* RIGHT COLUMN - SIDEBAR (Only visible on Log page) */}
          {(location.pathname === '/app' || location.pathname === '/app/') && (
            <aside className="w-full lg:w-80 shrink-0">
              <DashboardRightSidebar
                plan={plan}
                isTrial={isTrial}
                expiry={expiry}
                trades={trades}
                journals={journals}
                walletBalance={walletBalance}
                setShowPricingModal={setShowPricingModal}
                toast={toast}
                openPortal={openPortal}
                resetTrades={resetTrades}
                updateBalance={updateBalance}
              />
            </aside>
          )}
        </div>

        {/* FOOTER */}
        <footer className="w-full py-8 px-4 border-t border-border/10 bg-muted/5 text-center">
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
            Copyright © 2026 xaujournal. All Rights Reserved
          </p>
        </footer>
      </div>

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

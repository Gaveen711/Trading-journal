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
import Logo from '../Logo';

import { useTrades } from '../../hooks/useTrades';
import { useJournals } from '../../hooks/useJournals';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../ToastContext';
import { DashboardRightSidebar } from './DashboardRightSidebar';

export function DashboardLayout({ user, plan, expiry, totalTrades, setShowPricingModal, openBrokerSyncUpsell, openPortal }) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const canBrokerSync = plan === 'pro' || plan === 'grace';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-background selection:bg-primary/20">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card border-r border-border/30 z-30 p-6">
        {/* LOGO */}
        <div className="flex items-center gap-2.5 mb-8 cursor-pointer" onClick={() => navigate('/app')}>
          <Logo iconSize="w-8 h-8" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-widest uppercase text-foreground">XAU Journal</span>
            <span className="text-[9px] font-black uppercase text-primary tracking-widest">{plan} tier</span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 flex flex-col gap-1.5">
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

        {/* SIDEBAR BOTTOM STATUS CARD */}
        <div className="mt-auto pt-6 border-t border-border/20 flex flex-col gap-4">
          <div className="bg-muted/30 border border-border/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 absolute top-4 right-4 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
            <p className="text-[11px] font-bold text-foreground leading-tight">
              {lastMT5Sync ? 'Live MT5 broker terminal connected' : 'Manual logging mode active'}
            </p>
            <button 
              onClick={handleSyncClick}
              className="text-[9px] font-black uppercase text-primary hover:underline text-left mt-1 hover:shadow-none"
            >
              {lastMT5Sync ? 'Manage Sync' : 'Connect Broker ->'}
            </button>
          </div>

          {/* SIDEBAR ACTIONS (Logout / Theme) */}
          <div className="flex items-center justify-between mt-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl border border-border/40 hover:bg-muted text-foreground/70 hover:text-foreground transition-all hover:shadow-none"
              title="Toggle theme"
            >
              {isLightMode ? <MoonStarsFill className="w-4 h-4" /> : <SunFill className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { localStorage.removeItem('xau-auth-hint'); auth.signOut(); }}
              className="flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-black text-[10px] uppercase hover:shadow-none"
              title="Log out"
            >
              <BoxArrowRight className="w-4 h-4" />
              <span>Logout</span>
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
              <span className="text-xs font-black uppercase tracking-widest">XAU Journal</span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl border border-border/40 text-foreground/70 hover:shadow-none">
                {isLightMode ? <MoonStarsFill className="w-3.5 h-3.5" /> : <SunFill className="w-3.5 h-3.5" />}
              </button>
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
                className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg text-[10px] font-black uppercase hover:shadow-none"
              >
                <BoxArrowRight className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        {/* 3-COLUMN INNER GRID ON DESKTOP */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 md:p-8 gap-8 pb-24 md:pb-8">
          
          {/* MIDDLE COLUMN - OUTLET CONTENT */}
          <main className="flex-1 min-w-0">
            <Outlet context={{
              user, plan, expiry, totalTrades, setShowPricingModal, openPortal,
              trades, isLoadingTrades, addTrade, removeTrade, editTrade, resetTrades,
              journals, isLoadingJournals, saveJournalEntry, deleteEntry,
              walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, lastMT5Sync
            }} />
          </main>

          {/* RIGHT COLUMN - SIDEBAR */}
          <aside className="w-full lg:w-80 shrink-0">
            <DashboardRightSidebar
              plan={plan}
              trades={trades}
              journals={journals}
              walletBalance={walletBalance}
              setShowPricingModal={setShowPricingModal}
              toast={toast}
            />
          </aside>
        </div>

        {/* FOOTER */}
        <footer className="w-full py-8 px-4 border-t border-border/10 bg-muted/5 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
            &copy; {new Date().getFullYear()} XAU Journal. All rights reserved.
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

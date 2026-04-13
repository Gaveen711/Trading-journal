import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  PersonCircle
} from 'react-bootstrap-icons';
import { auth } from '../../firebase';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTrades } from '../../hooks/useTrades';
import { useJournals } from '../../hooks/useJournals';
import { useWallet } from '../../hooks/useWallet';

export function DashboardLayout({ user, plan, setShowPricingModal, openPortal }) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { trades, isLoadingTrades, addTrade, removeTrade, editTrade } = useTrades(user);
  const { journals, isLoadingJournals, saveJournalEntry, deleteEntry } = useJournals(user);
  const { startingBalance, updateBalance } = useWallet();

  const navigation = [
    { id: '', name: 'Log', icon: House, iconSolid: HouseFill },
    { id: 'history', name: 'History', icon: ClockHistory, iconSolid: ClockFill },
    { id: 'calendar', name: 'Calendar', icon: Calendar3, iconSolid: Calendar3Fill },
    { id: 'analytics', name: 'Analytics', icon: BarChartLine, iconSolid: BarChartLineFill },
    { id: 'journal', name: 'Journal', icon: Book, iconSolid: BookFill }
  ];

  const activeIndex = navigation.findIndex(item => 
    item.id === '' ? location.pathname === '/' : location.pathname.startsWith(`/${item.id}`)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-500 selection:bg-primary/20">
      
      {/* TOP NAVBAR */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group hover:scale-105 transition-transform duration-300" onClick={() => (window.location.href = '/')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">My</div>
                <span className="font-bold tracking-tight hidden sm:block">Journal</span>
              </div>
              
              {/* DESKTOP NAV */}
              <div className="hidden md:flex relative bg-muted/40 p-1.5 rounded-full border border-border/20">
                <div 
                  className="absolute top-1.5 bottom-1.5 left-1.5 bg-background shadow-sm border border-border/50 rounded-full transition-all duration-500"
                  style={{ width: '115px', transform: `translateX(calc(${activeIndex} * 115px))` }}
                />
                
                {navigation.map((item) => {
                  const isActive = item.id === '' ? location.pathname === '/' : location.pathname.startsWith(`/${item.id}`);
                  const Icon = isActive ? item.iconSolid : item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={`/${item.id}`}
                      className={`relative z-10 w-[115px] py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 ${
                        isActive ? 'text-primary' : 'text-foreground/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'scale-110' : ''}`} />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3 sm:gap-4 ml-2 pl-4 border-l border-border/20 relative" ref={profileMenuRef}>

              {plan === 'free' && (
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <Stars className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary">Upgrade</span>
                </button>
              )}

              <button onClick={toggleTheme} className="p-2.5 rounded-xl border">
                {isLightMode ? <MoonStarsFill /> : <SunFill />}
              </button>

              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-xl bg-muted border flex items-center justify-center"
              >
                <PersonCircle className="w-5 h-5" />
              </button>

              {/* DROPDOWN */}
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">

                  <div className="px-3 py-2 border-b border-border/20 mb-1">
                    <p className="text-[10px] font-black uppercase text-foreground/40">My Profile</p>
                    <p className="text-sm font-bold truncate text-foreground/90">{auth.currentUser?.email}</p>
                  </div>

                  {plan === 'pro' && (
                    <button onClick={() => { setShowProfileMenu(false); openPortal(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 text-primary">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase">Manage Billing</span>
                    </button>
                  )}

                  {plan === 'free' && (
                    <button onClick={() => { setShowProfileMenu(false); setShowPricingModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 text-primary">
                      <Stars className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase">Upgrade Account</span>
                    </button>
                  )}

                  <button onClick={() => auth.signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 text-destructive mt-2">
                    <BoxArrowRight className="w-4 h-4" />
                    Logout
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
        <Outlet context={{ 
          user, plan,
          trades, isLoadingTrades, addTrade, removeTrade, editTrade,
          journals, isLoadingJournals, saveJournalEntry, deleteEntry,
          startingBalance, updateBalance
        }} />
      </main>

      {/* FOOTER */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 border-t border-border/10 bg-muted/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">

          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-[10px]">
                My
              </div>
              <span className="text-sm font-black uppercase tracking-widest">Journal</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <p className="text-[10px] font-black uppercase text-foreground/50">
              © {new Date().getFullYear()} XAU Journal
            </p>

            <p className="text-[11px] font-black uppercase flex gap-2">
              Curated by
              <span style={{ animation: "rgbCycle 3s linear infinite" }}>
                Gaveen Perera.
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
        `}</style>
      </footer>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
        <div className="bg-background border rounded-[2rem] h-20 flex items-center justify-around">

          {navigation.map((item) => {
            const isActive =
              item.id === ''
                ? location.pathname === '/'
                : location.pathname.startsWith(`/${item.id}`);

            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <NavLink key={item.name} to={`/${item.id}`} className="flex flex-col items-center text-xs">
                <Icon />
                {item.name}
              </NavLink>
            );
          })}

        </div>
      </nav>

    </div>
  );
}
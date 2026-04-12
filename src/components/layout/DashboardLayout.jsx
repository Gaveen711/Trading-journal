import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  House, 
  HouseFill,
  ClockHistory, 
  ClockFill,
  Calendar3, 
  Calendar3Fill,
  BarChartLine, 
  BarChartLineFill,
  Book,
  BookFill,
  Stars,
  BoxArrowRight,
  SunFill,
  MoonStarsFill,
  XLg
} from 'react-bootstrap-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTrades } from '../../hooks/useTrades';
import { useJournals } from '../../hooks/useJournals';
import { useWallet } from '../../hooks/useWallet';

export function DashboardLayout({ user, plan, setShowPricingModal }) {
  const { isLightMode, toggleTheme } = useAppTheme();
  const location = useLocation();
  
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
    <div className="min-h-screen bg-background transition-colors duration-500 pb-20 md:pb-0 selection:bg-primary/20">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group hover:scale-105 transition-transform duration-300" onClick={() => (window.location.href = '/')}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">XAU</div>
                <span className="font-bold tracking-tight hidden sm:block">Journal</span>
              </div>
              
              {/* Desktop Sliding Nav */}
              <div className="hidden md:flex relative bg-muted/40 p-1.5 rounded-full border border-border/20">
                {/* Sliding Pill */}
                <div 
                  className="absolute top-1.5 bottom-1.5 left-1.5 bg-background shadow-sm border border-border/50 rounded-full transition-all duration-500 ease-[var(--spring-bounce)]"
                  style={{ 
                    width: '115px',
                    transform: `translateX(calc(${activeIndex} * 115px))`
                  }}
                />
                
                {navigation.map((item) => {
                  const isActive = item.id === '' ? location.pathname === '/' : location.pathname.startsWith(`/${item.id}`);
                  const Icon = isActive ? item.iconSolid : item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={`/${item.id}`}
                      className={`relative z-10 w-[115px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-300 ${
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`} />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Upgrade Button (Minimal) */}
              {plan === 'free' && (
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
                >
                  <Stars className="w-3.5 h-3.5 text-primary group-hover:animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Upgrade</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className={`
                  relative w-11 h-5 rounded-full p-1 transition-all duration-500 ease-in-out border border-border/40 shadow-inner
                  ${isLightMode ? 'bg-muted/80' : 'bg-primary/20'}
                `}
                aria-label="Toggle theme"
              >
                <div 
                  className={`
                    absolute top-0.5 left-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 transform
                    ${isLightMode ? 'translate-x-0 bg-white shadow-sm' : 'translate-x-6 bg-primary'}
                  `}
                >
                  {isLightMode ? (
                    <SunFill className="w-2.5 h-2.5 text-amber-500" />
                  ) : (
                    <MoonStarsFill className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </button>

              {/* User Profile Area */}
              <div className="flex items-center gap-3 sm:gap-4 ml-2 pl-4 border-l border-border/20">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-tight text-foreground/70 leading-none mb-1">
                    {auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tight leading-none ${plan === 'free' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {plan === 'free' ? 'Standard' : 'Pro Asset'}
                  </span>
                </div>
                
                <div className="w-8 h-8 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-xs font-black text-primary uppercase shadow-inner active:scale-90 transition-transform cursor-pointer overflow-hidden">
                  {auth.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    auth.currentUser?.email?.[0] || 'U'
                  )}
                </div>

                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all active:scale-75"
                  title="Secure Logout"
                >
                  <BoxArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mb-4">
        <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-5 duration-700 ease-[var(--spring-bounce)]">
          <Outlet context={{ 
            user, plan, setShowPricingModal,
            trades, isLoadingTrades, addTrade, removeTrade, editTrade,
            journals, isLoadingJournals, saveJournalEntry, deleteEntry,
            startingBalance, updateBalance
          }} />
        </div>
      </main>

      {/* Premium Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
        <div className="bg-background/80 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] h-20 flex items-center justify-around px-4">
          {navigation.map((item, idx) => {
            const isActive = item.id === '' ? location.pathname === '/' : location.pathname.startsWith(`/${item.id}`);
            const Icon = isActive ? item.iconSolid : item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={`/${item.id}`}
                className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 active:scale-75 ${
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-500 scale-100 ${isActive ? 'bg-primary/10 shadow-inner' : ''}`}>
                  <Icon className="w-6 h-6 transition-transform" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}


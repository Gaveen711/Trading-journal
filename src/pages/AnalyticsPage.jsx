import { useState, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { formatCurrencyCompact, formatCurrency } from '../lib/tradeUtils';
import { BarChartLine, ClockFill, ShieldExclamation, Share, Wallet2, ArrowUpRight, GraphUp, GraphDown, Award, Activity, LockFill } from 'react-bootstrap-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { ShareTradeModal } from '../components/ShareTradeModal';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-24 bg-muted rounded-2xl"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-80 bg-muted rounded-2xl"></div>
      <div className="h-80 bg-muted rounded-2xl"></div>
    </div>
    <div className="h-64 bg-muted rounded-2xl"></div>
  </div>
);

const PremiumOverlay = ({ title, description, onUpgrade }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[6px] border border-border/10 rounded-[2rem] p-6 text-center animate-in fade-in duration-300">
    <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
      <LockFill className="w-5 h-5" />
    </div>
    <h4 className="text-sm font-black uppercase tracking-wider text-foreground mb-1">{title}</h4>
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 max-w-[240px] leading-relaxed mb-4">{description}</p>
    <button
      onClick={onUpgrade}
      className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
    >
      Upgrade to Pro
    </button>
  </div>
);

export function AnalyticsPage() {
  const { trades, isLoadingTrades, walletBalance, plan, isTrial, setShowPricingModal } = useOutletContext();
  const isFree = (plan === 'basic' || plan === 'free') && !isTrial;
  const navigate = useNavigate();
  const { isLightMode } = useAppTheme();
  
  const [showExact, setShowExact] = useState({});
  const [sharingTrade, setSharingTrade] = useState(null);

  const setExact = useCallback((index, val) => {
    setShowExact(prev => ({ ...prev, [index]: val }));
  }, []);
  
  const stats = useMemo(() => {
    const tradesList = trades || [];
    const wins = tradesList.filter(t => t.outcome === 'WIN');
    const losses = tradesList.filter(t => t.outcome === 'LOSS');
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const wr = tradesList.length ? wins.length / tradesList.length : 0;
    const expectancy = (wr * avgWin) + ((1 - wr) * avgLoss);
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const pf = grossLoss > 0 ? grossWin / grossLoss : null;

    let peak = walletBalance || 0, maxDD = 0, running = walletBalance || 0;
    const sortedTrades = [...tradesList].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const drawdownCurve = [0];
    const drawdownLabels = ['Start'];

    sortedTrades.forEach(t => {
      running += t.pnl;
      if (running > peak) peak = running;
      const dd = running - peak;
      if (Math.abs(dd) > maxDD) maxDD = Math.abs(dd);
      drawdownCurve.push(parseFloat(dd.toFixed(2)));
      drawdownLabels.push(t.date);
    });

    const sessionDataMap = {};
    const PLAYBOOK_STRATEGIES = ['Breakout', 'SMC', 'ICT', 'Scalp', 'Swing', 'S/R'];
    const strategyDataMap = {};
    
    // Initialize standard playbook strategies
    PLAYBOOK_STRATEGIES.forEach(strat => {
      strategyDataMap[strat] = { pnl: 0, wins: 0, total: 0 };
    });

    tradesList.forEach(t => {
      const s = t.session || 'Unknown';
      if (!sessionDataMap[s]) sessionDataMap[s] = { pnl: 0, wins: 0, total: 0 };
      sessionDataMap[s].pnl += t.pnl;
      sessionDataMap[s].total++;
      if (t.outcome === 'WIN') sessionDataMap[s].wins++;

      const tags = (t.strategies && t.strategies.length > 0)
        ? t.strategies
        : t.setup
          ? [t.setup]
          : [];

      tags.forEach(tag => {
        if (!tag) return;
        const normTag = tag.trim().toLowerCase();
        
        // Match standard playbook strategy names (case-insensitive)
        const found = PLAYBOOK_STRATEGIES.find(strat => {
          const normStrat = strat.toLowerCase();
          return normTag === normStrat || normTag.includes(normStrat) || normStrat.includes(normTag);
        });

        const key = found || tag.trim();

        if (!strategyDataMap[key]) {
          strategyDataMap[key] = { pnl: 0, wins: 0, total: 0 };
        }
        strategyDataMap[key].pnl += t.pnl;
        strategyDataMap[key].total++;
        if (t.outcome === 'WIN') strategyDataMap[key].wins++;
      });
    });

    // Ensure all standard strategies and custom strategy tags are included
    const allStrategies = Array.from(new Set([...PLAYBOOK_STRATEGIES, ...Object.keys(strategyDataMap)]));

    // 1. Setup Performance List
    const setupPerformanceList = allStrategies.map(name => {
      const data = strategyDataMap[name] || { pnl: 0, wins: 0, total: 0 };
      const wins = data.wins;
      const losses = data.total - data.wins;
      const winRate = data.total > 0 ? Math.round((wins / data.total) * 100) : 0;
      return {
        name,
        wins,
        losses,
        winRate,
        pnl: data.pnl,
        total: data.total
      };
    }).sort((a, b) => b.pnl - a.pnl);

    // 2. Monthly P/L
    const monthlyPnlMap = {};
    tradesList.forEach(t => {
      if (!t.date) return;
      const dateObj = new Date(t.date);
      const monthName = dateObj.toLocaleString('en-US', { month: 'short' }); // "May", "Jun", etc.
      monthlyPnlMap[monthName] = (monthlyPnlMap[monthName] || 0) + t.pnl;
    });

    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsWithTrades = new Set(Object.keys(monthlyPnlMap));
    const monthlyPnlLabels = monthsOrder.filter(m => monthsWithTrades.has(m));
    const monthlyPnlValues = monthlyPnlLabels.map(m => monthlyPnlMap[m] || 0);

    const monthlyPnlChartData = {
      labels: monthlyPnlLabels,
      datasets: [{
        label: 'Monthly P/L',
        data: monthlyPnlValues,
        backgroundColor: monthlyPnlValues.map(v => v >= 0 ? 'rgba(163, 230, 53, 0.6)' : 'rgba(248, 113, 113, 0.6)'),
        borderColor: monthlyPnlValues.map(v => v >= 0 ? '#84cc16' : '#ef4444'),
        borderWidth: 1.5,
        borderRadius: 8,
      }]
    };

    // 3. Session Edge Analysis Grouped Bar Chart & Stats
    const getNormalizedSession = (s) => {
      if (!s) return 'Asia';
      const norm = s.toLowerCase().trim();
      if (norm.includes('london')) return 'London';
      if (norm.includes('ny') || norm.includes('new york') || norm.includes('new-york') || norm.includes('newyork')) return 'NY';
      if (norm.includes('asia') || norm.includes('tokyo') || norm.includes('sydney')) return 'Asia';
      if (norm.includes('overlap')) return 'Overlap';
      return 'Asia';
    };

    const sessionWeeklyPnl = {
      London: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      NY: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      Asia: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      Overlap: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
    };

    const sessionSummaryMap = {
      Asia: { wins: 0, total: 0 },
      London: { wins: 0, total: 0 },
      Overlap: { wins: 0, total: 0 },
      NY: { wins: 0, total: 0 }
    };

    tradesList.forEach(t => {
      const session = getNormalizedSession(t.session);
      
      // Update summary maps
      if (sessionSummaryMap[session]) {
        sessionSummaryMap[session].total++;
        if (t.outcome === 'WIN') {
          sessionSummaryMap[session].wins++;
        }
      }

      // Update weekly P&L
      if (t.date) {
        const dateObj = new Date(t.date);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[dateObj.getDay()];
        if (sessionWeeklyPnl[session] && sessionWeeklyPnl[session][dayName] !== undefined) {
          sessionWeeklyPnl[session][dayName] += t.pnl;
        }
      }
    });

    const sessionColors = {
      London: '#E5B80B',
      NY: '#8b5cf6',
      Asia: '#10b981',
      Overlap: '#f97316'
    };

    const sessionWeeklyChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: ['London', 'NY', 'Asia', 'Overlap'].map(session => ({
        label: session,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => parseFloat(sessionWeeklyPnl[session][day].toFixed(2))),
        backgroundColor: sessionColors[session],
        borderRadius: 4,
        borderWidth: 0,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      }))
    };

    const sessionSummary = ['Asia', 'London', 'Overlap', 'NY'].map(key => {
      const s = sessionSummaryMap[key];
      const winRate = s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0;
      return {
        key,
        label: key === 'NY' ? 'NY' : key.toUpperCase(),
        winRate,
        total: s.total
      };
    });

    // 5. Performance by Strategy
    const strategyLabels = Object.keys(strategyDataMap).sort((a, b) => strategyDataMap[b].pnl - strategyDataMap[a].pnl);
    const strategyValues = strategyLabels.map(l => strategyDataMap[l].pnl);
    
    const performanceByStrategyChartData = {
      labels: strategyLabels,
      datasets: [{
        label: 'Strategy Performance',
        data: strategyValues,
        backgroundColor: strategyValues.map(v => v >= 0 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
        borderColor: strategyValues.map(v => v >= 0 ? '#8b5cf6' : '#ef4444'),
        borderWidth: 1.5,
        borderRadius: 8,
      }]
    };

    const totalPnl = tradesList.reduce((s, t) => s + t.pnl, 0);
    const currentWalletBalance = (walletBalance || 0) + totalPnl;
    const winRatePercent = tradesList.length ? (wins.length / tradesList.length * 100).toFixed(0) : 0;

    return {
      wins,
      losses,
      avgWin,
      avgLoss,
      expectancy,
      pf,
      sortedTrades,
      setupPerformanceList,
      monthlyPnlChartData,
      sessionWeeklyChartData,
      sessionSummary,
      performanceByStrategyChartData,
      currentWalletBalance,
      winRatePercent
    };
  }, [trades, walletBalance]);

  const {
    wins,
    losses,
    avgWin,
    avgLoss,
    expectancy,
    pf,
    sortedTrades,
    setupPerformanceList,
    monthlyPnlChartData,
    sessionWeeklyChartData,
    sessionSummary,
    performanceByStrategyChartData,
    currentWalletBalance,
    winRatePercent
  } = stats;

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    animation: { duration: 220 },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 13, 20, 0.9)',
        padding: 12,
        borderRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: isLightMode ? '#64748b' : '#94a3b8', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: isLightMode ? '#64748b' : '#94a3b8', font: { size: 11 } } }
    }
  }), [isLightMode]);

  const monthlyPnlOptions = useMemo(() => ({
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, display: true }
    }
  }), [chartOptions]);

  const sessionWeeklyOptions = useMemo(() => ({
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false }
    },
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, display: true }
    }
  }), [chartOptions]);

  const performanceByStrategyOptions = monthlyPnlOptions;
  const recentSignals = useMemo(() => sortedTrades.slice(-5).reverse(), [sortedTrades]);

  const statCards = useMemo(() => [
    { 
      label: 'Wallet Balance', 
      value: showExact[0] ? formatCurrency(currentWalletBalance) : formatCurrencyCompact(currentWalletBalance), 
      sub: 'Current Liquidity', 
      color: 'text-primary',
      isInteractive: true,
      index: 0,
      Icon: Wallet2,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      iconBorder: 'border-primary/20',
      glowBg: 'bg-primary/5',
      glowHoverBg: 'group-hover:bg-primary/10',
      subPrefix: '',
      subPrefixColor: ''
    },
    { 
      label: 'Win Rate', 
      value: `${winRatePercent}%`, 
      sub: `${wins.length} successful`, 
      color: 'text-green-500',
      isInteractive: false,
      index: 1,
      Icon: ArrowUpRight,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      iconBorder: 'border-green-500/20',
      glowBg: 'bg-green-500/5',
      glowHoverBg: 'group-hover:bg-green-500/10',
      subPrefix: '▲',
      subPrefixColor: 'text-green-500'
    },
    { 
      label: 'Expectancy', 
      value: trades.length ? (showExact[2] ? formatCurrency(expectancy) : formatCurrencyCompact(expectancy)) : '—', 
      sub: trades.length ? 'Average per trade' : 'Average per trade', 
      color: expectancy > 0 ? 'text-green-500' : expectancy < 0 ? 'text-red-500' : '',
      isInteractive: trades.length > 0,
      index: 2,
      Icon: trades.length ? (expectancy > 0 ? GraphUp : expectancy < 0 ? GraphDown : Activity) : Activity,
      iconColor: trades.length ? (expectancy > 0 ? 'text-green-500' : expectancy < 0 ? 'text-red-500' : 'text-muted-foreground') : 'text-muted-foreground',
      iconBg: trades.length ? (expectancy > 0 ? 'bg-green-500/10' : expectancy < 0 ? 'bg-red-500/10' : 'bg-zinc-500/10') : 'bg-zinc-500/10',
      iconBorder: trades.length ? (expectancy > 0 ? 'border-green-500/20' : expectancy < 0 ? 'border-red-500/20' : 'border-zinc-500/20') : 'border-zinc-500/20',
      glowBg: trades.length ? (expectancy > 0 ? 'bg-green-500/5' : expectancy < 0 ? 'bg-red-500/5' : 'bg-zinc-500/5') : 'bg-zinc-500/5',
      glowHoverBg: trades.length ? (expectancy > 0 ? 'group-hover:bg-green-500/10' : expectancy < 0 ? 'group-hover:bg-red-500/10' : 'group-hover:bg-zinc-500/10') : 'group-hover:bg-zinc-500/10',
      subPrefix: trades.length ? (expectancy > 0 ? '▲' : expectancy < 0 ? '▼' : '') : '',
      subPrefixColor: expectancy > 0 ? 'text-green-500' : expectancy < 0 ? 'text-red-500' : ''
    },
    { 
      label: 'Avg Win', 
      value: wins.length ? (showExact[3] ? formatCurrency(avgWin) : formatCurrencyCompact(avgWin)) : '—', 
      sub: `${wins.length} winners`, 
      color: 'text-green-500',
      isInteractive: wins.length > 0,
      index: 3,
      Icon: GraphUp,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      iconBorder: 'border-green-500/20',
      glowBg: 'bg-green-500/5',
      glowHoverBg: 'group-hover:bg-green-500/10',
      subPrefix: wins.length ? '▲' : '',
      subPrefixColor: 'text-green-500'
    },
    { 
      label: 'Avg Loss', 
      value: losses.length ? (showExact[4] ? formatCurrency(avgLoss) : formatCurrencyCompact(avgLoss)) : '—', 
      sub: `${losses.length} losers`, 
      color: 'text-red-500',
      isInteractive: losses.length > 0,
      index: 4,
      Icon: GraphDown,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10',
      iconBorder: 'border-red-500/20',
      glowBg: 'bg-red-500/5',
      glowHoverBg: 'group-hover:bg-red-500/10',
      subPrefix: losses.length ? '▼' : '',
      subPrefixColor: 'text-red-500'
    },
    { 
      label: 'Profit Factor', 
      value: pf !== null ? pf.toFixed(2) : '—', 
      sub: 'Gross Profit / Loss', 
      color: pf >= 1.5 ? 'text-green-500' : pf < 1 ? 'text-red-500' : '',
      isInteractive: false,
      index: 5,
      Icon: pf !== null ? (pf >= 1.5 ? Award : pf < 1 ? ShieldExclamation : Activity) : Activity,
      iconColor: pf !== null ? (pf >= 1.5 ? 'text-green-500' : pf < 1 ? 'text-red-500' : 'text-amber-500') : 'text-muted-foreground',
      iconBg: pf !== null ? (pf >= 1.5 ? 'bg-green-500/10' : pf < 1 ? 'bg-red-500/10' : 'bg-amber-500/10') : 'bg-zinc-500/10',
      iconBorder: pf !== null ? (pf >= 1.5 ? 'border-green-500/20' : pf < 1 ? 'border-red-500/20' : 'border-amber-500/20') : 'border-zinc-500/20',
      glowBg: pf !== null ? (pf >= 1.5 ? 'bg-green-500/5' : pf < 1 ? 'bg-red-500/5' : 'bg-amber-500/5') : 'bg-zinc-500/5',
      glowHoverBg: pf !== null ? (pf >= 1.5 ? 'group-hover:bg-green-500/10' : pf < 1 ? 'group-hover:bg-red-500/10' : 'group-hover:bg-amber-500/10') : 'group-hover:bg-zinc-500/10',
      subPrefix: pf !== null ? (pf >= 1.5 ? '▲' : pf < 1 ? '▼' : '▲') : '',
      subPrefixColor: pf >= 1.5 ? 'text-green-500' : pf < 1 ? 'text-red-500' : 'text-amber-500'
    },
  ], [avgLoss, avgWin, currentWalletBalance, expectancy, losses.length, pf, showExact, trades.length, winRatePercent, wins.length]);

  if (isLoadingTrades) return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-foreground">Analytics</h1>
      </header>
      <AnalyticsSkeleton />
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Deep insights into your edge, consistency, and risk management.</p>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat, i) => {
          const isLocked = isFree && stat.index > 1;
          return (
            <div 
              key={i} 
              onMouseEnter={() => !isLocked && stat.isInteractive && setExact(stat.index, true)}
              onMouseLeave={() => !isLocked && stat.isInteractive && setExact(stat.index, false)}
              onFocus={() => !isLocked && stat.isInteractive && setExact(stat.index, true)}
              onBlur={() => !isLocked && stat.isInteractive && setExact(stat.index, false)}
              onClick={() => {
                if (isLocked) {
                  setShowPricingModal(true);
                } else if (stat.isInteractive) {
                  setExact(stat.index, !showExact[stat.index]);
                }
              }}
              role={stat.isInteractive || isLocked ? 'button' : undefined}
              tabIndex={stat.isInteractive || isLocked ? 0 : undefined}
              aria-label={isLocked ? `Unlock ${stat.label} with Pro` : stat.isInteractive ? `${stat.label}: toggle exact value` : stat.label}
              className={`apple-glass-panel p-4 sm:p-5 rounded-3xl flex items-center justify-between relative overflow-hidden group hover:border-primary/50 active:scale-[0.98] transition-colors duration-200 border border-border/10 animate-in zoom-in-90 fill-both ${
                stat.isInteractive || isLocked ? 'cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50' : ''
              }`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className={`space-y-1 relative z-10 min-w-0 flex-1 transition-all duration-300 ${isLocked ? 'blur-[4px] select-none pointer-events-none opacity-50' : ''}`}>
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">{stat.label}</span>
                <h2 className={`text-lg sm:text-2xl font-black tracking-tight mt-0.5 tabular-nums break-words ${stat.color}`}>{stat.value}</h2>
                <div className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground mt-0.5 flex items-center gap-1">
                  {stat.subPrefix && <span className={stat.subPrefixColor}>{stat.subPrefix}</span>}
                  <span className="truncate min-w-0">{stat.sub}</span>
                </div>
              </div>
              
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${stat.iconBg} ${stat.iconBorder} flex items-center justify-center ${stat.iconColor} relative z-10 shrink-0 ml-2 transition-all duration-300 ${isLocked ? 'blur-[4px] opacity-30' : ''}`}>
                <stat.Icon className="w-4 h-4 sm:w-5 h-5" />
              </div>
              
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.glowBg} rounded-full blur-2xl pointer-events-none ${stat.glowHoverBg} transition-colors`} />
              
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/10 backdrop-blur-[2px] transition-colors group-hover:bg-primary/5">
                  <LockFill className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] animate-in zoom-in-50 duration-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2x2 Grid of Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Setup Performance Card */}
        <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-left-4 duration-700 delay-300 flex flex-col relative overflow-hidden">
          <div className={`flex flex-col flex-1 ${isFree ? 'blur-sm select-none pointer-events-none opacity-40' : ''}`}>
            <div className="flex items-center gap-2 mb-1 shrink-0">
              <span className="w-1.5 h-4 bg-[#10b981] rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">
                Setup Performance
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-6 shrink-0">
              Win rate metrics and Net P&L distribution by playbook setup.
            </p>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[256px] space-y-4">
              {setupPerformanceList.map((setup) => {
                // Custom map for strategy specific colors to give distinct identity to each playbook setup
                const strategyColorsMap = {
                  'Breakout': '#06b6d4', // Cyan
                  'SMC': '#8b5cf6',      // Purple
                  'ICT': '#f97316',      // Orange
                  'Scalp': '#10b981',    // Emerald
                  'Swing': '#6366f1',    // Indigo
                  'S/R': '#E5B80B',      // Amber/Gold
                };
                
                // Fallback palette for any custom user strategies
                const defaultPalette = ['#ec4899', '#f43f5e', '#a855f7', '#06b6d4'];
                const pbColor = strategyColorsMap[setup.name] || defaultPalette[Math.abs(setup.name.charCodeAt(0) || 0) % defaultPalette.length];

                return (
                  <div key={setup.name} className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-muted/10 transition-colors">
                    {/* Setup Name */}
                    <div className="w-24 sm:w-28 shrink-0">
                      <span className="text-xs font-black tracking-tight text-foreground/80 truncate block">
                        {setup.name}
                      </span>
                    </div>

                    {/* Progress & Stats Bar */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex justify-between items-baseline text-[9px] font-black uppercase tracking-wider">
                        <span className="text-muted-foreground/60">
                          {setup.wins}W / {setup.losses}L
                        </span>
                        <span className="font-bold" style={{ color: pbColor }}>
                          {setup.winRate}%
                        </span>
                      </div>
                      
                      {/* Horizontal Progress Bar */}
                      <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${setup.winRate}%`,
                            backgroundColor: pbColor
                          }}
                        />
                      </div>
                    </div>

                    {/* Net P&L Far Right */}
                    <div className="w-20 text-right shrink-0">
                      <span className={`text-xs md:text-sm font-black tabular-nums ${
                        setup.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {setup.pnl >= 0 ? '+' : ''}{formatCurrency(setup.pnl)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {setupPerformanceList.length === 0 && (
                <div className="text-center py-12 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                  No setup data found.
                </div>
              )}
            </div>
          </div>
          {isFree && (
            <PremiumOverlay
              title="Setup Performance"
              description="Unlock win rate metrics and net P&L distribution by playbook setup."
              onUpgrade={() => setShowPricingModal(true)}
            />
          )}
        </div>

        {/* Chart 2: Monthly P/L */}
        <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-right-4 duration-700 delay-300">
          <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Monthly P/L
          </h3>
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-8">Net profit and loss distribution across individual calendar months.</p>
          <div className="h-64">
            <Bar data={monthlyPnlChartData} options={monthlyPnlOptions} />
          </div>
        </div>

        {/* Session Edge Analysis */}
        <div className="card-premium p-4 sm:p-8 lg:col-span-2 animate-in slide-in-from-bottom-4 duration-700 delay-400 relative overflow-hidden">
          <div className={`flex flex-col flex-1 ${isFree ? 'blur-sm select-none pointer-events-none opacity-40' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground/80">
                  <ClockFill className="w-4 h-4 text-primary" />
                  Session Edge Analysis
                </h3>
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mt-1">
                  Comparative weekly session edge analysis and win rates.
                </p>
              </div>
              
              {/* Custom HTML Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E5B80B' }} />
                  <span>London</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                  <span>NY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }} />
                  <span>Asia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }} />
                  <span>Overlap</span>
                </div>
              </div>
            </div>

            <div className="h-64 mb-8">
              <Bar 
                data={sessionWeeklyChartData} 
                options={sessionWeeklyOptions} 
              />
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/40">
              {sessionSummary.map((session) => {
                const sessionColorsMap = {
                  London: '#E5B80B',
                  NY: '#8b5cf6',
                  Asia: '#10b981',
                  Overlap: '#f97316'
                };
                const pbColor = sessionColorsMap[session.key] || '#10b981';
                return (
                  <div key={session.key} className="p-3.5 rounded-xl bg-muted/20 border border-border/20 flex flex-col justify-between group hover:border-primary/20 transition-all duration-300">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/80 group-hover:text-primary transition-colors">
                      {session.label}
                    </span>
                    
                    <div className="mt-2 mb-1 flex items-baseline justify-between">
                      <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                        {session.winRate}%
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-tight">
                        Win Rate
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mt-1 mb-2">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${session.winRate}%`,
                          backgroundColor: pbColor
                        }}
                      />
                    </div>

                    <span className="text-[10px] text-foreground/75 font-black uppercase tracking-tighter">
                      {session.total} {session.total === 1 ? 'trade' : 'trades'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {isFree && (
            <PremiumOverlay
              title="Session Edge Analysis"
              description="Unlock comparative session edge analysis, win rates, and weekly performance."
              onUpgrade={() => setShowPricingModal(true)}
            />
          )}
        </div>

        {/* Chart 5: Performance by Strategy */}
        <div className="card-premium p-4 sm:p-8 lg:col-span-2 animate-in slide-in-from-bottom-4 duration-700 delay-500 relative overflow-hidden">
          <div className={`flex flex-col flex-1 ${isFree ? 'blur-sm select-none pointer-events-none opacity-40' : ''}`}>
            <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/80">
              <BarChartLine className="w-4 h-4 text-primary" />
              Performance by Strategy / Playbook
            </h3>
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-8">Net profit and loss distributed across your custom strategies.</p>
            <div className="h-64">
              <Bar data={performanceByStrategyChartData} options={performanceByStrategyOptions} />
            </div>
          </div>
          {isFree && (
            <PremiumOverlay
              title="Strategy Performance"
              description="Unlock detailed reports and performance metrics across custom playbook setups."
              onUpgrade={() => setShowPricingModal(true)}
            />
          )}
        </div>
      </div>

      <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-bottom-4 duration-700 delay-500">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Recent Signals
          </h3>
          <button 
            onClick={() => navigate('/app/history')} 
            className="min-h-11 px-3 -mr-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            View All History →
          </button>
        </div>
        <div className="space-y-3">
          {recentSignals.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <div className={`w-12 h-7 rounded-md flex items-center justify-center text-[9px] font-black uppercase tracking-widest ${t.direction === 'BUY' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {t.direction}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black tracking-tight">{t.date}</span>
                  <span className="text-[9px] text-foreground/70 font-bold uppercase tracking-widest">{t.session} · {t.setup}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className={`text-sm font-black tracking-tighter tabular-nums ${t.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(t.pnl, true)}
                </div>
                <button
                  type="button"
                  onClick={() => setSharingTrade(t)}
                  aria-label={`Share trade from ${t.date}`}
                  className="w-11 h-11 rounded-xl bg-muted/50 hover:bg-primary/20 hover:text-primary text-muted-foreground flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Share className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {sortedTrades.length === 0 && (
            <div className="text-center py-8 text-[10px] uppercase tracking-widest text-muted-foreground/60">
              No recent signals found.
            </div>
          )}
        </div>
      </div>

      {sharingTrade && (
        <ShareTradeModal trade={sharingTrade} onClose={() => setSharingTrade(null)} />
      )}
    </div>
  );
}




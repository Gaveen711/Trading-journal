import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { BarChartLine, CurrencyDollar, ArrowUpRight, AwardFill, Activity } from 'react-bootstrap-icons';
import { formatCurrency } from '../lib/tradeUtils';
import { useAppTheme } from '../hooks/useAppTheme';
import { LiveMarketWidget } from '../components/LiveMarketWidget';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function LogTradePage() {
  const { trades, walletBalance, isExpanded, setIsExpanded } = useOutletContext();
  const { isLightMode } = useAppTheme();
  const [equityPeriod, setEquityPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('history');

  // Markets Open Status Badge logic
  const [isMarketOpen, setIsMarketOpen] = useState(true);

  useEffect(() => {
    const checkMarket = () => {
      const date = new Date();
      const day = date.getUTCDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
      const hour = date.getUTCHours();
      let open = true;
      if (day === 0) {
        open = hour >= 22; // Sunday 22:00 GMT
      } else if (day === 5) {
        open = hour < 22;  // Friday 22:00 GMT
      } else if (day === 6) {
        open = false;      // Saturday closed
      }
      setIsMarketOpen(open);
    };

    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  // Shared live tickers state from LiveMarketWidget
  const [liveTickers, setLiveTickers] = useState(null);
  const [marketInterval, setMarketInterval] = useState('1m');

  // Gold Bias Gauge calculations using real-time market signals
  const biasPercentage = useMemo(() => {
    const ticker = liveTickers?.xauusd;
    const history = ticker?.history || [];
    const change = ticker?.change || 0;

    // Default base bias (neutral)
    let score = 50;

    // A. Daily Change Contribution (up to +/- 25%)
    // If gold is up 1%, add 20%. Clamped between -25% and +25%.
    score += Math.max(-25, Math.min(25, change * 20));

    // B. Moving Average Trend (up to +/- 15%)
    // Check if current price is above the average of recent prices.
    if (history.length > 1) {
      const avg = history.reduce((s, p) => s + p, 0) / history.length;
      const current = history[history.length - 1];
      if (current > avg) score += 15;
      else score -= 15;
    }

    // C. Momentum / RSI Proxy (up to +/- 15%)
    // Calculate simple relative strength from historical price fluctuations.
    if (history.length > 2) {
      let gains = 0;
      let losses = 0;
      for (let i = 1; i < history.length; i++) {
        const diff = history[i] - history[i - 1];
        if (diff > 0) gains += diff;
        else losses += Math.abs(diff);
      }
      const rs = losses === 0 ? 100 : gains / losses;
      const rsi = 100 - (100 / (1 + rs));
      score += (rsi - 50) * 0.3; // Adds up to +15% or subtracts down to -15%
    }

    // D. User Trade Sentiment Contribution (up to +/- 15%)
    // Factor in the user's own long vs short ratio to personalize the bias.
    const buyTrades = trades.filter(t => {
      const dir = (t.direction || '').toUpperCase();
      return dir === 'BUY' || dir === 'LONG';
    });
    const totalDirectionalTrades = trades.filter(t => {
      const dir = (t.direction || '').toUpperCase();
      return dir === 'BUY' || dir === 'LONG' || dir === 'SELL' || dir === 'SHORT';
    });
    if (totalDirectionalTrades.length > 0) {
      const buyRatio = buyTrades.length / totalDirectionalTrades.length;
      score += (buyRatio - 0.5) * 30; // Adds up to +15% or subtracts down to -15%
    }

    // Clamp between 5% and 95% for realistic sentiment levels
    return Math.max(5, Math.min(95, Math.round(score)));
  }, [liveTickers, trades]);

  // Fallback state variables if LiveMarketWidget hasn't loaded yet
  const [goldPrice, setGoldPrice] = useState(2389.33);
  const [goldChange, setGoldChange] = useState(14.18);

  useEffect(() => {
    const fetchGoldPriceFallback = async () => {
      try {
        const res = await fetch('/api/spot-price/XAU');
        if (res.ok) {
          const data = await res.json();
          if (data && data.price) {
            const price = Number(data.price);
            setGoldPrice(price);
            const baselineClose = 2375.15;
            const diff = price - baselineClose;
            setGoldChange(Number(diff.toFixed(2)));
          }
        }
      } catch (err) {
        console.warn('Error fetching fallback gold price:', err);
      }
    };

    fetchGoldPriceFallback();
    const interval = setInterval(fetchGoldPriceFallback, 30000);
    return () => clearInterval(interval);
  }, []);

  // Synchronized gold values (always preferred from liveTickers state)
  const goldPriceValue = liveTickers?.xauusd?.price || goldPrice;
  const goldChangeValue = useMemo(() => {
    const ticker = liveTickers?.xauusd;
    if (ticker) {
      if (ticker.history && ticker.history.length > 0) {
        // Absolute change is current price minus the start-of-day price (history[0])
        return ticker.price - ticker.history[0];
      }
      return ticker.price * (ticker.change / 100);
    }
    return goldChange;
  }, [liveTickers, goldChange]);

  const { needleX, needleY } = useMemo(() => {
    // 0% Bearish is at 210 degrees (bottom-left), 100% Bullish is at -30 degrees (bottom-right).
    // Angle = 210 - (percentage / 100) * 240
    const angle = 210 - (biasPercentage / 100) * 240;
    const rad = (angle * Math.PI) / 180;
    const r = 46; // needle length
    const pivotX = 100;
    const pivotY = 75;
    const x = pivotX + r * Math.cos(rad);
    const y = pivotY - r * Math.sin(rad);
    return { needleX: x, needleY: y };
  }, [biasPercentage]);

  // KPI calculations
  const mtdTrades = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return trades.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
    });
  }, [trades]);

  const mtdPnl = useMemo(() => {
    return mtdTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  }, [mtdTrades]);

  const lastMonthPnl = useMemo(() => {
    const now = new Date();
    let prevYear = now.getFullYear();
    let prevMonth = now.getMonth() - 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    const lmTrades = trades.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getFullYear() === prevYear && tDate.getMonth() === prevMonth;
    });
    return lmTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  }, [trades]);

  const pnlPercentChange = useMemo(() => {
    if (lastMonthPnl === 0) {
      return mtdPnl > 0 ? 12.0 : 0.0;
    }
    const change = ((mtdPnl - lastMonthPnl) / Math.abs(lastMonthPnl)) * 100;
    return parseFloat(change.toFixed(1));
  }, [mtdPnl, lastMonthPnl]);

  const winRateMtd = useMemo(() => {
    const targetTrades = mtdTrades.length > 0 ? mtdTrades : trades;
    if (targetTrades.length === 0) return 0;
    const wins = targetTrades.filter(t => t.outcome === 'WIN').length;
    return Math.round((wins / targetTrades.length) * 100);
  }, [mtdTrades, trades]);

  const winCountMtd = useMemo(() => {
    const targetTrades = mtdTrades.length > 0 ? mtdTrades : trades;
    return targetTrades.filter(t => t.outcome === 'WIN').length;
  }, [mtdTrades, trades]);

  const totalCountMtd = useMemo(() => {
    const targetTrades = mtdTrades.length > 0 ? mtdTrades : trades;
    return targetTrades.length;
  }, [mtdTrades, trades]);

  const bestTradeMtd = useMemo(() => {
    const targetTrades = mtdTrades.length > 0 ? mtdTrades : trades;
    if (targetTrades.length === 0) return null;
    return [...targetTrades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0))[0];
  }, [mtdTrades, trades]);

  const bestTradeVal = useMemo(() => {
    return bestTradeMtd ? bestTradeMtd.pnl : 0;
  }, [bestTradeMtd]);

  const bestTradeMarket = useMemo(() => {
    return bestTradeMtd ? (bestTradeMtd.market || 'XAU/USD') : '—';
  }, [bestTradeMtd]);

  const bestTradeSession = useMemo(() => {
    return bestTradeMtd ? (bestTradeMtd.session || 'London') : '—';
  }, [bestTradeMtd]);

  const avgRRatio = useMemo(() => {
    const tradesWithRR = trades.filter(t => t.rr !== undefined && t.rr !== null && !isNaN(Number(t.rr)) && Number(t.rr) > 0);
    if (tradesWithRR.length === 0) return 0;
    const sum = tradesWithRR.reduce((s, t) => s + Number(t.rr), 0);
    return parseFloat((sum / tradesWithRR.length).toFixed(1));
  }, [trades]);

  const chartVisibleTrades = useMemo(() => {
    const sortedForChart = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    if (equityPeriod === '30') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      return sortedForChart.filter(t => t.date >= cutoffStr);
    }
    return sortedForChart;
  }, [trades, equityPeriod]);

  const chartData = useMemo(() => {
    const sortedForChart = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let initialBalanceForChart = walletBalance || 0;

    if (equityPeriod === '30') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      const olderTrades = sortedForChart.filter(t => t.date < cutoffStr);
      initialBalanceForChart += olderTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    }

    const chartLabels = ['Start', ...chartVisibleTrades.map(t => t.date)];
    let currentBalance = initialBalanceForChart;
    const chartDataPoints = [currentBalance, ...chartVisibleTrades.map(t => {
      currentBalance += t.pnl;
      return parseFloat(currentBalance.toFixed(2));
    })];

    return {
      labels: chartLabels,
      datasets: [{
        label: 'Equity',
        data: chartDataPoints,
        borderColor: '#E5B80B',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(229, 184, 11, 0.15)');
          gradient.addColorStop(1, 'rgba(229, 184, 11, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      }]
    };
  }, [trades, walletBalance, equityPeriod, chartVisibleTrades]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 13, 20, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        padding: 12,
        borderRadius: 8,
        displayColors: false,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
        ticks: { color: isLightMode ? '#64748b' : '#94a3b8', font: { size: 11 } }
      }
    }
  }), [isLightMode]);


  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-200 pb-6">

      {/* HEADER SECTION WITH TITLE AND NEW TRADE TOGGLE */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-foreground">Dashboard</h1>
          <p className="text-[10px] md:text-sm uppercase tracking-widest text-muted-foreground">Overview & Trade Intelligence</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Markets Open Badge */}
          <div className="flex items-center gap-1.5 py-1.5 px-2 sm:px-3 rounded-xl border border-border/10 bg-muted/20 text-[9px] md:text-xs font-black uppercase tracking-widest select-none shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-gray-500'} shrink-0`} />
            <span className={isMarketOpen ? 'text-green-500' : 'text-muted-foreground'}>
              {isMarketOpen ? 'Markets Open' : 'Markets Closed'}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`hidden md:flex py-1.5 px-2.5 sm:px-3 rounded-xl font-black uppercase tracking-wider text-[10px] md:text-xs transition-all duration-300 items-center justify-center gap-1.5 active:scale-[0.96] cursor-pointer select-none shrink-0 shadow-md ${
              isExpanded
                ? 'bg-[#D1495B]/10 border border-[#D1495B]/30 text-[#D1495B] hover:bg-[#D1495B]/20 shadow-[#D1495B]/5'
                : 'bg-[#EDAE49] hover:bg-[#D99A32] text-[#003D5B] border border-transparent shadow-[#EDAE49]/10'
            }`}
            title={isExpanded ? 'Close Trade' : 'New Trade'}
          >
            {isExpanded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Close Trade</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                <span className="hidden sm:inline">New Trade</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TOP TIER: METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">

        {/* Metric 1: Net P&L (MTD) */}
        <div className="apple-glass-panel p-5 rounded-3xl flex items-center justify-between relative overflow-hidden group hover:border-primary/50 transition-colors border border-border/10">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">Net P&L (MTD)</span>
            <h2 className="text-2xl font-black tracking-tight text-[#E5B80B] mt-1">
              {mtdPnl >= 0 ? '+' : ''}{formatCurrency(mtdPnl)}
            </h2>
            <div className="flex items-center gap-1 text-[10px] md:text-xs font-black uppercase mt-1">
              <span className="text-muted-foreground">vs last month</span>
              <span className={pnlPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {pnlPercentChange >= 0 ? '▲' : '▼'} {Math.abs(pnlPercentChange)}%
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 relative z-10 shrink-0">
            <CurrencyDollar className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* Metric 2: Win Rate */}
        <div className="apple-glass-panel p-5 rounded-3xl flex items-center justify-between relative overflow-hidden group hover:border-primary/50 transition-colors border border-border/10">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">Win Rate</span>
            <h2 className="text-2xl font-black tracking-tight text-green-500 mt-1">
              {winRateMtd}%
            </h2>
            <div className="text-[10px] md:text-xs font-black uppercase text-muted-foreground mt-1 flex items-center gap-1">
              {totalCountMtd > 0 && <span className="text-green-500">▲</span>}
              <span>{winCountMtd} of {totalCountMtd} trades</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 relative z-10 shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-green-500/10 transition-colors" />
        </div>

        {/* Metric 3: Best Trade */}
        <div className="apple-glass-panel p-5 rounded-3xl flex items-center justify-between relative overflow-hidden group hover:border-primary/50 transition-colors border border-border/10">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">Best Trade</span>
            <h2 className="text-2xl font-black tracking-tight text-purple-400 mt-1">
              {bestTradeVal > 0 ? '+' : ''}{formatCurrency(bestTradeVal)}
            </h2>
            <div className="text-[10px] md:text-xs font-black uppercase text-muted-foreground mt-1 flex items-center gap-1">
              {bestTradeVal > 0 && <span className="text-green-500">▲</span>}
              <span>{bestTradeVal > 0 ? `${bestTradeMarket} - ${bestTradeSession}` : 'No Trades'}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 relative z-10 shrink-0">
            <AwardFill className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
        </div>

        {/* Metric 4: Avg R:R */}
        <div className="apple-glass-panel p-5 rounded-3xl flex items-center justify-between relative overflow-hidden group hover:border-primary/50 transition-colors border border-border/10">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">Avg R:R</span>
            <h2 className="text-2xl font-black tracking-tight text-amber-500 mt-1">
              1:{avgRRatio}
            </h2>
            <div className="text-[10px] md:text-xs font-black uppercase text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-green-500">▲</span>
              <span>Risk-adjusted</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 relative z-10 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-yellow-500/10 transition-colors" />
        </div>

      </div>

      {/* MIDDLE TIER: LIVE MARKET WIDGET */}
      <div className="shrink-0 w-full relative z-20">
        <LiveMarketWidget onTickersUpdate={setLiveTickers} onIntervalChange={setMarketInterval} />
      </div>

      {/* BOTTOM TIER: BIAS GAUGE & PERFORMANCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">

        {/* GOLD BIAS GAUGE CARD */}
        <div className="apple-glass-panel rounded-3xl p-6 flex flex-col relative overflow-hidden border border-border/10 hover:border-primary/30 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-left relative z-10">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-[4px] h-[16px] bg-[#facc15] rounded-full shrink-0" />
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-[#9e9ea7]">GOLD BIAS GAUGE</span>
            </div>
            <span className="rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {marketInterval}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-4 relative z-10">
            <svg viewBox="0 0 200 145" className="w-full max-w-[220px] mx-auto overflow-visible">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4b55" />
                  <stop offset="40%" stopColor="#facc15" />
                  <stop offset="70%" stopColor="#a3e635" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* Background Track (240-degree arc) */}
              <path
                d="M 46.31,106 A 62,62 0 1,1 153.69,106"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Filled Arc (240-degree arc) */}
              <path
                d="M 46.31,106 A 62,62 0 1,1 153.69,106"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="259.7"
                strokeDashoffset={259.7 - (259.7 * biasPercentage) / 100}
                className="transition-all duration-1000 ease-out"
              />
              {/* Labels */}
              <text x="62" y="80" className="text-[10px] md:text-xs font-black fill-[#ff4b55] uppercase tracking-wider" textAnchor="middle">BEAR</text>
              <text x="138" y="80" className="text-[10px] md:text-xs font-black fill-[#10b981] uppercase tracking-wider" textAnchor="middle">BULL</text>

              {/* Center percentage and text */}
              <text x="100" y="108" className={`text-3xl font-black tracking-tight ${biasPercentage >= 60 ? 'fill-[#10b981]' : biasPercentage <= 40 ? 'fill-[#ff4b55]' : 'fill-[#facc15]'}`} textAnchor="middle">
                {biasPercentage}%
              </text>
              <text x="100" y="124" className={`text-xs md:text-sm font-black uppercase tracking-[0.22em] ${biasPercentage >= 60 ? 'fill-[#10b981]' : biasPercentage <= 40 ? 'fill-[#ff4b55]' : 'fill-[#facc15]'}`} textAnchor="middle">
                {biasPercentage >= 60 ? 'BULLISH' : biasPercentage <= 40 ? 'BEARISH' : 'NEUTRAL'}
              </text>

              {/* Needle */}
              <line
                x1="100"
                y1="75"
                x2={needleX}
                y2={needleY}
                className="stroke-[#facc15] stroke-[2.2] stroke-round transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              {/* Pivot */}
              <circle cx="100" cy="75" r="4.5" className="fill-[#13131a] stroke-[#facc15] stroke-[2.2]" />
            </svg>
          </div>

          {/* Bottom sub-panel (left-aligned cards with dividers) */}
          <div className="grid grid-cols-3 gap-1 bg-[#0b0b0f]/40 border border-white/5 rounded-2xl p-3.5 mt-4 relative z-10 text-left">
            <div className="flex flex-col pl-1">
              <span className="text-[10px] md:text-xs font-black uppercase text-[#9e9ea7]/60 tracking-wider">XAU/USD</span>
              <span className="text-sm md:text-base font-black text-[#facc15] mt-1">
                {goldPriceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-4">
              <span className="text-[10px] md:text-xs font-black uppercase text-[#9e9ea7]/60 tracking-wider">24H Change</span>
              <span className={`text-sm md:text-base font-black mt-1 ${goldChangeValue >= 0 ? 'text-[#10b981]' : 'text-[#ff4b55]'}`}>
                {goldChangeValue >= 0 ? '+' : ''}{goldChangeValue.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-4">
              <span className="text-[10px] md:text-xs font-black uppercase text-[#9e9ea7]/60 tracking-wider">Trend</span>
              <span className="text-sm md:text-base font-black text-purple-400 mt-1 flex items-center gap-1 select-none">
                {goldChangeValue >= 0 ? '▲ Uptrend' : '▼ Downtrend'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Chart (Equity Curve) */}
        <div className="apple-glass-panel rounded-3xl flex flex-col relative overflow-hidden border border-border/10 hover:border-primary/30 transition-colors lg:col-span-2">
          <div className="p-5 flex justify-between items-center border-b border-border/10 relative z-20">
            <div className="flex items-center gap-3 border-l-4 border-yellow-500 pl-3">
              <div className="w-8 h-8 rounded-full bg-[#E5B80B]/20 flex items-center justify-center text-[#E5B80B] font-bold text-xs md:text-sm">Au</div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Equity Curve</h3>
                <p className="text-[10px] md:text-sm uppercase tracking-widest text-muted-foreground">Historical Performance</p>
              </div>
            </div>
            <div className="flex bg-muted/50 rounded-xl p-1">
              <button onClick={() => setEquityPeriod('30')} className={`px-3 py-1.5 text-[10px] md:text-xs font-black uppercase rounded-lg transition-colors ${equityPeriod === '30' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>30D</button>
              <button onClick={() => setEquityPeriod('all')} className={`px-3 py-1.5 text-[10px] md:text-xs font-black uppercase rounded-lg transition-colors ${equityPeriod === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>All</button>
            </div>
          </div>
          <div className="flex-1 w-full p-4 relative z-10 min-h-[300px]">
            {trades.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-muted/50 border border-border/50 flex items-center justify-center shadow-inner">
                  <BarChartLine className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-sm font-bold text-foreground opacity-80">No Performance Data</span>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 px-8 leading-relaxed">Log trades to see your performance curve.</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>

      </div>

      {/* BOTTOM TIER: HISTORY TABLE */}
      <div className="w-full shrink-0">
        <div className="apple-glass-panel rounded-3xl flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-5 flex gap-6 border-b border-border/10">
            <button
              className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] pb-1 border-b-2 -mb-[21px] transition-colors ${activeTab === 'history' ? 'text-foreground border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              onClick={() => setActiveTab('history')}
            >
              Positions / History
            </button>
            <button
              className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] pb-1 border-b-2 -mb-[21px] transition-colors ${activeTab === 'orders' ? 'text-foreground border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>

          {activeTab === 'history' ? (
            <div className="flex-1 overflow-x-auto p-2">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border/10 text-muted-foreground uppercase text-[10px] md:text-xs font-black tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 hidden md:table-cell">Strategy</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Session</th>
                    <th className="py-3 px-4">Entry</th>
                    <th className="py-3 px-4">Exit</th>
                    <th className="py-3 px-4">Lots</th>
                    <th className="py-3 px-4 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {trades.slice(0, 10).map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 font-medium text-foreground/80 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{t.date}</td>
                      <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5B80B]" />
                        {t.market || 'GOLD'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-black tracking-widest ${t.direction === 'BUY' || t.direction === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>{t.direction}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {t.strategy || (t.strategies && t.strategies[0]) || t.setup ? (
                          <span className="px-2 py-0.5 rounded text-[10px] md:text-xs font-black tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {t.strategy || (t.strategies && t.strategies[0]) || t.setup}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                        {t.session ? (
                          <span className="px-2 py-0.5 rounded text-[10px] md:text-xs font-black tracking-widest bg-muted text-muted-foreground border border-border/30">
                            {t.session}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{t.entry}</td>
                      <td className="py-3 px-4 text-muted-foreground">{t.exit || '-'}</td>
                      <td className="py-3 px-4">{t.lots}</td>
                      <td className={`py-3 px-4 text-right font-black ${t.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>{t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}</td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest">No positions logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-muted-foreground gap-4">
              <div className="w-16 h-16 rounded-[2rem] bg-muted/50 border border-border/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-foreground opacity-80">No Active Orders</p>
                <p className="text-xs md:text-sm uppercase tracking-widest opacity-40 leading-relaxed">Limit and Stop orders will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

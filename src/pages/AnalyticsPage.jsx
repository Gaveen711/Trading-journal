import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { formatCurrencyCompact, formatCurrency } from '../lib/tradeUtils';
import { BarChartLine, ClockFill, LightningFill, ShieldExclamation } from 'react-bootstrap-icons';
import { useAppTheme } from '../hooks/useAppTheme';
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

export function AnalyticsPage() {
  const { trades, isLoadingTrades, walletBalance } = useOutletContext();
  const navigate = useNavigate();
  const { isLightMode } = useAppTheme();
  
  const [showExact, setShowExact] = useState({});

  const setExact = (index, val) => {
    setShowExact(prev => ({ ...prev, [index]: val }));
  };
  
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
    const setupDataMap = {};
    
    tradesList.forEach(t => {
      const s = t.session || 'Unknown';
      if (!sessionDataMap[s]) sessionDataMap[s] = { pnl: 0, wins: 0, total: 0 };
      sessionDataMap[s].pnl += t.pnl;
      sessionDataMap[s].total++;
      if (t.outcome === 'WIN') sessionDataMap[s].wins++;

      const set = t.setup || 'Unknown';
      if (!setupDataMap[set]) setupDataMap[set] = { pnl: 0, wins: 0, total: 0 };
      setupDataMap[set].pnl += t.pnl;
      setupDataMap[set].total++;
      if (t.outcome === 'WIN') setupDataMap[set].wins++;
    });

    // 1. Equity Curve
    let runningBalance = walletBalance || 0;
    const equityCurvePoints = [runningBalance];
    const equityCurveLabels = ['Start'];
    sortedTrades.forEach(t => {
      runningBalance += t.pnl;
      equityCurvePoints.push(parseFloat(runningBalance.toFixed(2)));
      equityCurveLabels.push(t.date);
    });

    const equityCurveChartData = {
      labels: equityCurveLabels,
      datasets: [{
        label: 'Equity Curve',
        data: equityCurvePoints,
        borderColor: 'rgb(59, 130, 246)', // elegant blue line
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 0, // no visible dots on the line
        pointHoverRadius: 6,
        borderWidth: 2.5,
      }]
    };

    // 2. Monthly P/L
    const monthlyPnlMap = {};
    tradesList.forEach(t => {
      if (!t.date) return;
      const dateObj = new Date(t.date);
      const monthName = dateObj.toLocaleString('en-US', { month: 'short' }); // "May", "Jun", etc.
      monthlyPnlMap[monthName] = (monthlyPnlMap[monthName] || 0) + t.pnl;
    });

    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyPnlLabels = monthsOrder.filter(m => monthlyPnlMap[m] !== undefined || Object.keys(monthlyPnlMap).includes(m));
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

    // 3. Session Performance Pie Chart
    const sessionNames = ['London', 'New York', 'Tokyo', 'Sydney'];
    const sessionPnlMap = { London: 0, 'New York': 0, Tokyo: 0, Sydney: 0 };
    
    tradesList.forEach(t => {
      // Standardize casing for key matching
      let s = t.session || '';
      if (s.toLowerCase() === 'london') sessionPnlMap.London += t.pnl;
      else if (s.toLowerCase() === 'new york' || s.toLowerCase() === 'new-york' || s.toLowerCase() === 'newyork') sessionPnlMap['New York'] += t.pnl;
      else if (s.toLowerCase() === 'tokyo') sessionPnlMap.Tokyo += t.pnl;
      else if (s.toLowerCase() === 'sydney') sessionPnlMap.Sydney += t.pnl;
    });

    const sessionChartLabels = sessionNames.map(name => {
      const val = sessionPnlMap[name];
      const sign = val >= 0 ? '+' : '';
      return `${name}: ${sign}${formatCurrency(val)}`;
    });

    const sessionChartData = {
      labels: sessionChartLabels,
      datasets: [{
        data: sessionNames.map(name => Math.max(1, Math.abs(sessionPnlMap[name]))), // segment sizing by volume weight
        backgroundColor: [
          'rgb(59, 130, 246)',   // London (Blue)
          'rgb(16, 185, 129)',   // New York (Green)
          'rgb(245, 158, 11)',   // Tokyo (Orange)
          'rgb(239, 68, 68)'     // Sydney (Red)
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }]
    };

    // 4. Performance by Day
    const dayPnlMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    tradesList.forEach(t => {
      if (!t.date) return;
      const dateObj = new Date(t.date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[dateObj.getDay()];
      if (dayName && dayPnlMap[dayName] !== undefined) {
        dayPnlMap[dayName] += t.pnl;
      }
    });

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayValues = dayLabels.map(d => dayPnlMap[d]);

    const performanceByDayChartData = {
      labels: dayLabels,
      datasets: [{
        label: 'Performance by Day',
        data: dayValues,
        backgroundColor: 'rgba(77, 124, 15, 0.85)', // darker shade of green
        borderColor: '#4d7c0f',
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
      equityCurveChartData,
      monthlyPnlChartData,
      sessionChartData,
      performanceByDayChartData,
      currentWalletBalance,
      winRatePercent
    };
  }, [trades, walletBalance]);

  if (isLoadingTrades) return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gradient">Analytics</h1>
      </header>
      <AnalyticsSkeleton />
    </div>
  );

  const {
    wins,
    losses,
    avgWin,
    avgLoss,
    expectancy,
    pf,
    sortedTrades,
    equityCurveChartData,
    monthlyPnlChartData,
    sessionChartData,
    performanceByDayChartData,
    currentWalletBalance,
    winRatePercent
  } = stats;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
  };

  const statCards = [
    { 
      label: 'Wallet Balance', 
      value: showExact[0] ? formatCurrency(currentWalletBalance) : formatCurrencyCompact(currentWalletBalance), 
      sub: 'Current Liquidity', 
      color: 'text-primary',
      isInteractive: true,
      index: 0
    },
    { 
      label: 'Win Rate', 
      value: `${winRatePercent}%`, 
      sub: `${wins.length} successful`, 
      color: 'text-green-500',
      isInteractive: false,
      index: 1
    },
    { 
      label: 'Expectancy', 
      value: trades.length ? (showExact[2] ? formatCurrency(expectancy) : formatCurrencyCompact(expectancy)) : '—', 
      sub: trades.length ? 'Average per trade' : 'Average per trade', 
      color: expectancy > 0 ? 'text-green-500' : expectancy < 0 ? 'text-red-500' : '',
      isInteractive: trades.length > 0,
      index: 2
    },
    { 
      label: 'Avg Win', 
      value: wins.length ? (showExact[3] ? formatCurrency(avgWin) : formatCurrencyCompact(avgWin)) : '—', 
      sub: `${wins.length} winners`, 
      color: 'text-green-500',
      isInteractive: wins.length > 0,
      index: 3
    },
    { 
      label: 'Avg Loss', 
      value: losses.length ? (showExact[4] ? formatCurrency(avgLoss) : formatCurrencyCompact(avgLoss)) : '—', 
      sub: `${losses.length} losers`, 
      color: 'text-red-500',
      isInteractive: losses.length > 0,
      index: 4
    },
    { 
      label: 'Profit Factor', 
      value: pf !== null ? pf.toFixed(2) : '—', 
      sub: 'Gross Profit / Loss', 
      color: pf >= 1.5 ? 'text-green-500' : pf < 1 ? 'text-red-500' : '',
      isInteractive: false,
      index: 5
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Deep insights into your edge, consistency, and risk management.</p>
      </header>
      
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            onMouseEnter={() => stat.isInteractive && setExact(stat.index, true)}
            onMouseLeave={() => stat.isInteractive && setExact(stat.index, false)}
            className={`card-premium p-3 sm:p-5 flex flex-col justify-between h-28 sm:h-32 group hover:scale-[1.03] active:scale-95 transition-all duration-500 ease-[var(--spring-bounce)] animate-in zoom-in-90 fill-both ${
              stat.isInteractive ? 'cursor-default select-none hover:border-primary/30' : ''
            }`}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/85 group-hover:text-primary transition-colors">{stat.label}</span>
            <div className="space-y-1">
              <div className={`text-xl sm:text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-foreground/90 font-black uppercase tracking-tighter truncate">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2x2 Grid of Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Equity Curve */}
        <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-left-4 duration-700 delay-300">
          <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Equity Curve
          </h3>
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-8">Progression of total account equity over logged operations.</p>
          <div className="h-64">
            <Line data={equityCurveChartData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: { ...chartOptions.scales.x, display: true }
              }
            }} />
          </div>
        </div>

        {/* Chart 2: Monthly P/L */}
        <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-right-4 duration-700 delay-300">
          <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Monthly P/L
          </h3>
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-8">Net profit and loss distribution across individual calendar months.</p>
          <div className="h-64">
            <Bar data={monthlyPnlChartData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: { ...chartOptions.scales.x, display: true }
              }
            }} />
          </div>
        </div>

        {/* Chart 3: Session Performance */}
        <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-bottom-4 duration-700 delay-400">
          <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Session Performance
          </h3>
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-8">Net profit and loss distributed across global trading sessions.</p>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <Pie data={sessionChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: isLightMode ? '#1e293b' : '#e2e8f0',
                      font: { size: 12, weight: 'bold' },
                      padding: 12
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Chart 4: Performance by Day */}
        <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-bottom-4 duration-700 delay-400">
          <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Performance by Day
          </h3>
          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mb-8">Historical trading day edge and net efficiency performance.</p>
          <div className="h-64">
            <Bar data={performanceByDayChartData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: { ...chartOptions.scales.x, display: true }
              }
            }} />
          </div>
        </div>
      </div>

      <div className="card-premium p-4 sm:p-8 animate-in slide-in-from-bottom-4 duration-700 delay-500">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground/80">
            <BarChartLine className="w-4 h-4 text-primary" />
            Recent Signals
          </h3>
          <button 
            onClick={() => navigate('/history')} 
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            View All History →
          </button>
        </div>
        <div className="space-y-3">
          {sortedTrades.slice(-5).reverse().map((t) => (
            <div key={t.id} className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className={`w-12 h-7 rounded-md flex items-center justify-center text-[9px] font-black uppercase tracking-widest ${t.direction === 'BUY' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {t.direction}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-tight">{t.date}</span>
                  <span className="text-[9px] text-foreground/70 font-bold uppercase tracking-widest">{t.session} · {t.setup}</span>
                </div>
              </div>
              <div className={`text-sm font-black tracking-tighter ${t.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(t.pnl, true)}
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
    </div>
  );
}




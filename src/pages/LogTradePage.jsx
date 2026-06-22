import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { BarChartLine } from 'react-bootstrap-icons';
import { formatCurrency } from '../lib/tradeUtils';
import { useAppTheme } from '../hooks/useAppTheme';
import { LiveMarketWidget } from '../components/LiveMarketWidget';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function LogTradePage() {
  const { trades, walletBalance, monthlyGoal, updateMonthlyGoal, isExpanded, setIsExpanded } = useOutletContext();
  const { isLightMode } = useAppTheme();
  const [equityPeriod, setEquityPeriod] = useState('all');
  const [activeTab, setActiveTab] = useState('history');
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const handleStartEditGoal = () => {
    setGoalInput(monthlyGoal ? monthlyGoal.toString() : '0');
    setIsEditingGoal(true);
  };

  const handleSaveGoal = async () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val >= 0) {
      if (updateMonthlyGoal) {
        await updateMonthlyGoal(val);
      }
    }
    setIsEditingGoal(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveGoal();
    if (e.key === 'Escape') setIsEditingGoal(false);
  };

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
        borderColor: '#8B5CF6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
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

  const currentWalletBalance = (walletBalance || 0) + trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const winRate = chartVisibleTrades.length ? (chartVisibleTrades.filter(t => t.outcome === 'WIN').length / chartVisibleTrades.length * 100).toFixed(0) : 0;

  const thisMonthPnl = trades.filter(t => {
    const d = new Date();
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    return t.date >= monthStart;
  }).reduce((s, t) => s + (t.pnl || 0), 0);
  const goalProgress = Math.min(100, Math.max(0, (thisMonthPnl / (monthlyGoal || 1)) * 100));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-200 pb-6">
      
      {/* HEADER SECTION WITH TITLE AND NEW TRADE TOGGLE */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-foreground">Dashboard</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Overview & Trade Intelligence</p>
        </div>
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="py-1.5 px-3 rounded-xl font-black uppercase tracking-wider text-[9px] transition-all duration-200 flex items-center justify-center gap-1 border border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary active:scale-[0.96] cursor-pointer select-none"
          >
            <span className="text-xs font-light leading-none">+</span>
            New Trade
          </button>
        )}
      </div>

      {/* TOP TIER: METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        
        {/* Metric 1: Total Balance */}
        <div className="apple-glass-panel p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start z-10 relative">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Balance</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${thisMonthPnl >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {thisMonthPnl >= 0 ? '+' : ''}{thisMonthPnl.toFixed(2)} this month
            </span>
          </div>
          <div className="z-10 relative mt-3">
            <h2 className="text-3xl font-black text-foreground tracking-tight">{formatCurrency(currentWalletBalance)}</h2>
            {isEditingGoal ? (
              <div className="flex items-center gap-1.5 mt-1 animate-in fade-in duration-200">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Goal: $</span>
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                      setGoalInput(val.replace(',', '.'));
                    }
                  }}
                  onBlur={handleSaveGoal}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-muted/50 border border-primary/40 rounded px-1.5 py-0.5 text-[10px] font-bold text-foreground focus:outline-none w-20 shadow-inner"
                />
              </div>
            ) : (
              <p 
                onClick={handleStartEditGoal}
                className="text-[10px] font-black uppercase text-muted-foreground mt-1 cursor-pointer hover:text-primary transition-colors flex items-center gap-1 group/goal"
                title="Click to edit monthly goal"
              >
                Goal: {formatCurrency(monthlyGoal)}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 opacity-0 group-hover/goal:opacity-100 transition-opacity text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </p>
            )}
          </div>
          <div className="z-10 relative pt-3">
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10">
              <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* Metric 2: Monthly PnL */}
        <div className="apple-glass-panel p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden group hover:border-primary/50 transition-colors">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground z-10 relative">Monthly PnL</span>
          <div className="z-10 relative mt-3">
            <h2 className={`text-3xl font-black tracking-tight ${thisMonthPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {thisMonthPnl >= 0 ? '+' : ''}{formatCurrency(thisMonthPnl)}
            </h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">Realized Returns</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-green-500/10 transition-colors" />
        </div>

        {/* Metric 3: Win Rate */}
        <div className="apple-glass-panel p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden group hover:border-primary/50 transition-colors">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground z-10 relative">Overall Win Rate</span>
          <div className="z-10 relative mt-3">
            <h2 className="text-3xl font-black text-foreground tracking-tight">{winRate}%</h2>
            <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">Based on {chartVisibleTrades.length} trades</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
        </div>

      </div>

      {/* MIDDLE TIER: LIVE MARKET WIDGET */}
      <div className="shrink-0 w-full relative z-20">
        <LiveMarketWidget />
      </div>

      {/* BOTTOM TIER: PERFORMANCE & HISTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0 min-h-[400px]">
        
        {/* Performance Chart */}
        <div className="apple-glass-panel rounded-3xl flex flex-col relative overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-border/10 relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5B80B]/20 flex items-center justify-center text-[#E5B80B] font-bold text-[10px]">Au</div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Equity Curve</h3>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Historical Performance</p>
              </div>
            </div>
            <div className="flex bg-muted/50 rounded-xl p-1">
              <button onClick={() => setEquityPeriod('30')} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors ${equityPeriod === '30' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>30D</button>
              <button onClick={() => setEquityPeriod('all')} className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors ${equityPeriod === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>All</button>
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
                  <p className="text-[10px] uppercase tracking-widest opacity-40 px-8 leading-relaxed">Log trades to see your performance curve.</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* History Table */}
        <div className="apple-glass-panel rounded-3xl flex flex-col overflow-hidden min-h-[300px]">
          <div className="p-5 flex gap-6 border-b border-border/10">
            <button 
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 -mb-[21px] transition-colors ${activeTab === 'history' ? 'text-foreground border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              onClick={() => setActiveTab('history')}
            >
              Positions / History
            </button>
            <button 
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 -mb-[21px] transition-colors ${activeTab === 'orders' ? 'text-foreground border-primary' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>
          
          {activeTab === 'history' ? (
            <div className="flex-1 overflow-x-auto p-2">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border/10 text-muted-foreground uppercase text-[9px] font-black tracking-wider">
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
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${
                        t.direction === 'BUY' || t.direction === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>{t.direction}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {t.strategy || (t.strategies && t.strategies[0]) || t.setup ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {t.strategy || (t.strategies && t.strategies[0]) || t.setup}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                      {t.session ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest bg-muted text-muted-foreground border border-border/30">
                          {t.session}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{t.entry}</td>
                    <td className="py-3 px-4 text-muted-foreground">{t.exit || '-'}</td>
                    <td className="py-3 px-4">{t.lots}</td>
                    <td className={`py-3 px-4 text-right font-black ${
                      t.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>{t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}</td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">No positions logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground gap-4">
              <div className="w-16 h-16 rounded-[2rem] bg-muted/50 border border-border/50 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-foreground opacity-80">No Active Orders</p>
                <p className="text-[10px] uppercase tracking-widest opacity-40 leading-relaxed">Limit and Stop orders will appear here.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
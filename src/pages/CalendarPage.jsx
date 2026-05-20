
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { pad2 } from '../lib/tradeUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar3, 
  Clock, 
  Activity, 
  TrophyFill, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LightningChargeFill,
  ShieldCheck,
  GraphUp,
  GraphDown
} from 'react-bootstrap-icons';

export function CalendarPage() {
  const { trades, plan } = useOutletContext();
  
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  const formatDate = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const fmtDate = (dateString) => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dateString + 'T00:00:00'));

  const dayTrades = (y, m, d) => {
    const key = formatDate(y, m, d);
    return trades.filter(t => t.date === key);
  };

  // ── Calculate Monthly Stats ───────────────────────────────────────────────
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthlyTrades = trades.filter(t => {
    if (!t.date) return false;
    const [y, m, d] = t.date.split('-').map(Number);
    return y === calYear && (m - 1) === calMonth;
  });

  const monthlyPnl = monthlyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalMonthlyTrades = monthlyTrades.length;

  let winDays = 0;
  let lossDays = 0;
  let activeDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayTrs = dayTrades(calYear, calMonth, d);
    if (dayTrs.length > 0) {
      activeDays++;
      const dayPnl = dayTrs.reduce((sum, t) => sum + (t.pnl || 0), 0);
      if (dayPnl > 0.01) winDays++;
      else if (dayPnl < -0.01) lossDays++;
    }
  }
  const consistencyRate = activeDays > 0 ? (winDays / activeDays) * 100 : 0;
  const totalLots = monthlyTrades.reduce((sum, t) => sum + (Number(t.lots) || 0), 0);
  const totalPips = monthlyTrades.reduce((sum, t) => sum + (Number(t.pips) || 0), 0);

  // ── Monthly Analytics (Session & Setup) ──────────────────────────────────
  const setupStats = {};
  monthlyTrades.forEach(t => {
    const sName = t.setup || 'Direct Execution';
    if (!setupStats[sName]) setupStats[sName] = { pnl: 0, count: 0, wins: 0 };
    setupStats[sName].pnl += (t.pnl || 0);
    setupStats[sName].count++;
    if (t.pnl > 0.01) setupStats[sName].wins++;
  });
  const sortedSetups = Object.entries(setupStats).map(([name, data]) => ({
    name,
    ...data,
    winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0
  })).sort((a, b) => b.pnl - a.pnl).slice(0, 2);

  const sessionStats = { 'London': { pnl: 0, count: 0 }, 'New York': { pnl: 0, count: 0 }, 'Asian': { pnl: 0, count: 0 } };
  monthlyTrades.forEach(t => {
    let s = t.session || '';
    if (s.toLowerCase().includes('london')) s = 'London';
    else if (s.toLowerCase().includes('york') || s.toLowerCase().includes('ny')) s = 'New York';
    else if (s.toLowerCase().includes('asia') || s.toLowerCase().includes('tokyo')) s = 'Asian';
    else return;

    sessionStats[s].pnl += (t.pnl || 0);
    sessionStats[s].count++;
  });

  let bestSession = '';
  let bestSessionPnl = -Infinity;
  Object.entries(sessionStats).forEach(([name, data]) => {
    if (data.count > 0 && data.pnl > bestSessionPnl) {
      bestSessionPnl = data.pnl;
      bestSession = name;
    }
  });

  let bestSetup = '';
  let bestSetupPnl = -Infinity;
  sortedSetups.forEach(s => {
    if (s.pnl > bestSetupPnl) {
      bestSetupPnl = s.pnl;
      bestSetup = s.name;
    }
  });

  let smartTip = "Log more trades to unlock personalized consistency insights.";
  if (bestSession && bestSessionPnl > 0) {
    smartTip = `Your edge is strongest during the ${bestSession} session this month. Focus execution there.`;
    if (bestSetup && bestSetupPnl > 0) {
      smartTip = `Your highest consistency setup is '${bestSetup}' during ${bestSession}. Prioritize these setups.`;
    }
  } else if (bestSetup && bestSetupPnl > 0) {
    smartTip = `The '${bestSetup}' setup is driving your growth this month. Keep practicing selective execution.`;
  }

  // ── Render Calendar Cells ──────────────────────────────────────────────────
  const renderCells = () => {
    const cells = [];
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    // 1. Prev Month Padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push(
        <div key={`prev-${d}`} className="relative aspect-square rounded-2xl bg-muted/2 border border-transparent p-2 sm:p-3 flex flex-col items-start justify-start opacity-20 cursor-default select-none">
          <span className="text-[10px] sm:text-xs font-semibold text-foreground/45">{d}</span>
        </div>
      );
    }

    // 2. Active Month Days
    for (let d = 1; d <= daysInMonth; d++) {
      const ts = dayTrades(calYear, calMonth, d);
      const pnl = ts.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const hasTrades = ts.length > 0;
      const isWin = pnl > 0.01;
      const isLoss = pnl < -0.01;
      
      const todayDate = new Date();
      const isToday = d === todayDate.getDate() && calMonth === todayDate.getMonth() && calYear === todayDate.getFullYear();
      const isSelected = d === selectedCalDay;
      
      cells.push(
        <button 
          key={`day-${d}`} 
          className={`relative aspect-square rounded-2xl transition-all duration-300 flex flex-col justify-between p-2 sm:p-3 group ${
            isSelected 
              ? 'border-2 border-primary ring-2 ring-primary/20 shadow-[0_0_25px_rgba(139,92,246,0.25)] bg-primary/5 scale-105 z-10' 
              : hasTrades 
                ? (isWin 
                    ? 'bg-green-500/[0.04] border border-green-500/25 hover:border-green-500/50 hover:bg-green-500/[0.08] hover:scale-[1.03] shadow-sm shadow-green-500/5' 
                    : isLoss 
                      ? 'bg-red-500/[0.04] border border-red-500/25 hover:border-red-500/50 hover:bg-red-500/[0.08] hover:scale-[1.03] shadow-sm shadow-red-500/5' 
                      : 'bg-muted/10 border border-border/80 hover:bg-muted/20 hover:scale-[1.03]') 
                : 'bg-muted/5 border border-border/10 hover:bg-muted/10 hover:border-border/30 hover:scale-[1.03]'
          }`}
          onClick={() => setSelectedCalDay(d)}
        >
          {/* Day Number (Top Left) */}
          <div className="w-full flex justify-between items-center">
            <span className={`text-[10px] sm:text-xs font-black transition-colors ${
              isToday 
                ? 'bg-primary text-primary-foreground px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] shadow-sm' 
                : isSelected 
                  ? 'text-primary' 
                  : 'text-foreground/60 group-hover:text-foreground'
            }`}>
              {d}
            </span>
            {isToday && !isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          {/* PNL Badge (Center) */}
          <div className="w-full flex items-center justify-center py-1">
            {hasTrades ? (
              <div className={`px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[11px] font-black tracking-tight border shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-105 ${
                isWin 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                  : isLoss 
                    ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                    : 'bg-muted text-muted-foreground border-border'
              }`}>
                {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}
              </div>
            ) : (
              <div className="h-5 sm:h-6" />
            )}
          </div>

          {/* Micro-signals: Trade dots (Bottom) */}
          <div className="w-full h-1.5 flex items-center justify-center gap-0.5 overflow-hidden">
            {hasTrades && ts.slice(0, 4).map((t, idx) => (
              <div 
                key={t.id || idx} 
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-transform group-hover:scale-110 ${
                  t.pnl > 0.01 
                    ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' 
                    : t.pnl < -0.01 
                      ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]' 
                      : 'bg-slate-400'
                }`}
              />
            ))}
            {ts.length > 4 && (
              <span className="text-[7px] font-bold text-muted-foreground/60 leading-none">+</span>
            )}
          </div>

          {isSelected && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
        </button>
      );
    }

    // 3. Next Month Padding
    const totalCellsFilled = firstDayIndex + daysInMonth;
    const nextMonthPadding = 42 - totalCellsFilled;
    for (let i = 1; i <= nextMonthPadding; i++) {
      cells.push(
        <div key={`next-${i}`} className="relative aspect-square rounded-2xl bg-muted/2 border border-transparent p-2 sm:p-3 flex flex-col items-start justify-start opacity-20 cursor-default select-none">
          <span className="text-[10px] sm:text-xs font-semibold text-foreground/45">{i}</span>
        </div>
      );
    }

    return cells;
  };

  const selectedTrades = selectedCalDay ? dayTrades(calYear, calMonth, selectedCalDay) : [];
  const selectedDate = selectedCalDay ? formatDate(calYear, calMonth, selectedCalDay) : '';
  const selectedTotal = selectedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const selectedLots = selectedTrades.reduce((sum, t) => sum + (Number(t.lots) || 0), 0);
  const selectedPips = selectedTrades.reduce((sum, t) => sum + (Number(t.pips) || 0), 0);
  const selectedWins = selectedTrades.filter(t => t.pnl > 0.01).length;
  const selectedDayWinRate = selectedTrades.length > 0 ? (selectedWins / selectedTrades.length) * 100 : 0;

  const changeMonth = (delta) => {
    let nextMonth = calMonth + delta, nextYear = calYear;
    if (nextMonth < 0) { nextMonth = 11; nextYear--; }
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    setCalMonth(nextMonth);
    setCalYear(nextYear);
    setSelectedCalDay(null);
  };

  // SVG Gauge calculations for Insights
  const radius = 36;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (consistencyRate / 100) * circumference;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Consistency Terminal</h1>
            {plan === 'free' && (
              <span className="px-2 py-0.5 rounded-md bg-primary/5 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
                Basic Edition
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm font-medium">Visualize your daily market impact and discipline.</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => {
              setCalMonth(new Date().getMonth());
              setCalYear(new Date().getFullYear());
              setSelectedCalDay(null);
            }}
            className="h-11 px-4 border border-border/40 hover:bg-muted/50 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all text-foreground/80 shrink-0"
          >
            Today
          </button>
          
          <div className="flex bg-muted/50 p-1 rounded-full border border-border/40 shadow-inner justify-between items-center flex-1 sm:flex-initial">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-background rounded-full transition-all active:scale-90 flex items-center justify-center">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 py-2 text-[10px] font-black min-w-[130px] text-center uppercase tracking-[0.2em] self-center text-foreground/90 select-none">
              {new Date(calYear, calMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-background rounded-full transition-all active:scale-90 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MONTH STATISTICS SUMMARY ROW */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-premium p-5 flex flex-col justify-between h-[110px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute right-4 top-4 text-foreground/5 opacity-50 group-hover:rotate-12 transition-transform duration-500">
            {monthlyPnl >= 0 ? <GraphUp size={36} className="text-green-500" /> : <GraphDown size={36} className="text-red-500" />}
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Monthly Net P&L</span>
          <h4 className={`text-2xl font-black tracking-tighter ${monthlyPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {monthlyPnl >= 0 ? '+' : '-'}${Math.abs(monthlyPnl).toFixed(2)}
          </h4>
          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Realized in closed trades</span>
        </div>

        <div className="card-premium p-5 flex flex-col justify-between h-[110px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute right-4 top-4 text-foreground/5 opacity-50 group-hover:rotate-12 transition-transform duration-500">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Consistency (Win Rate)</span>
          <h4 className="text-2xl font-black tracking-tighter text-foreground">
            {consistencyRate.toFixed(1)}%
          </h4>
          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">{winDays} Green / {activeDays} Traded Days</span>
        </div>

        <div className="card-premium p-5 flex flex-col justify-between h-[110px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute right-4 top-4 text-foreground/5 opacity-50 group-hover:rotate-12 transition-transform duration-500">
            <LightningChargeFill size={36} className="text-yellow-500" />
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Signals</span>
          <h4 className="text-2xl font-black tracking-tighter text-foreground">
            {totalMonthlyTrades}
          </h4>
          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Executions logged this month</span>
        </div>

        <div className="card-premium p-5 flex flex-col justify-between h-[110px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute right-4 top-4 text-foreground/5 opacity-50 group-hover:rotate-12 transition-transform duration-500">
            <Activity size={36} className="text-sky-500" />
          </div>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Volume & Pips</span>
          <h4 className="text-2xl font-black tracking-tighter text-foreground">
            {totalPips >= 0 ? '+' : ''}{totalPips.toFixed(0)} <span className="text-xs text-muted-foreground">Pips</span>
          </h4>
          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">{totalLots.toFixed(2)} Total Lots Traded</span>
        </div>
      </section>

      {/* MAIN CONTAINER: CALENDAR GRID + INTELLIGENCE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Grid Card */}
        <div className="lg:col-span-2 card-premium p-5 sm:p-8 animate-in slide-in-from-left-4 duration-700">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-4 border-b border-border/10 pb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">{d}</div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5 sm:gap-4">
            {renderCells()}
          </div>
          
          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-border/10 flex flex-wrap gap-x-6 gap-y-3 text-[9px] uppercase font-black tracking-widest text-muted-foreground/80">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500/10 border border-green-500/30"></div> Profit Day</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500/10 border border-red-500/30"></div> Loss Day</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-muted/10 border border-border/10"></div> No Operations</div>
          </div>
        </div>

        {/* Intelligence Feed Panel (Right Column) */}
        <div className="card-premium p-5 sm:p-6 h-fit shadow-xl shadow-primary/5 animate-in slide-in-from-right-4 duration-700 delay-200">
          
          {selectedCalDay ? (
            /* Day Details View */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground/85">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Day Intelligence
                </h3>
                <button 
                  onClick={() => setSelectedCalDay(null)}
                  className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground/70 active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>

              {/* Day Header Box */}
              <div className="p-5 rounded-[2rem] bg-muted/30 border border-border/50 shadow-inner space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em]">{fmtDate(selectedDate)}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${selectedTotal >= 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} animate-pulse`} />
                </div>
                
                <div className="flex justify-between items-end text-foreground/90">
                  <div className="flex flex-col">
                    <span className={`text-3xl font-black tracking-tighter ${selectedTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {selectedTotal >= 0 ? '+' : '-'}${Math.abs(selectedTotal).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{selectedTotal >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-background/50 border border-border/50">
                    {selectedTrades.length} {selectedTrades.length === 1 ? 'Signal' : 'Signals'}
                  </span>
                </div>
              </div>

              {/* Day Metrics Mini Row */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-muted/10 border border-border/20">
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Lots</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{selectedLots.toFixed(2)}</div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/10 border border-border/20">
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Win Rate</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{selectedDayWinRate.toFixed(0)}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/10 border border-border/20">
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Pips</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{selectedPips >= 0 ? '+' : ''}{selectedPips.toFixed(0)}</div>
                </div>
              </div>

              {/* Trade Signal Feed */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Signal Executions</p>
                {selectedTrades.map((trade, idx) => (
                  <div 
                    key={trade.id} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:bg-muted/20 transition-all group animate-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-transform group-hover:rotate-12 ${
                        trade.direction?.toUpperCase() === 'BUY' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {trade.direction ? trade.direction[0] : 'S'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground tracking-tight">XAU/USD</span>
                        <span className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest truncate max-w-[120px]">{trade.setup || 'Direct Execution'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-black ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toFixed(2)}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground/50 uppercase flex items-center gap-1">
                        <Clock size={8} /> {trade.session || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Default Monthly Performance Insights view */
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-foreground/85">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Monthly Analytics
              </h3>

              {/* SVG Win Rate Gauge Card */}
              <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/40 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[160px]">
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="text-muted/10" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r={radius} 
                      className="text-primary transition-all duration-1000 ease-out" 
                      strokeWidth={strokeWidth} 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center mt-0.5">
                    <span className="text-xl font-black leading-none">{consistencyRate.toFixed(0)}%</span>
                    <span className="text-[8px] uppercase font-black text-muted-foreground/80 tracking-widest mt-0.5">Consistency</span>
                  </div>
                </div>
                <div className="text-center mt-3 space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/90">{winDays} of {activeDays} Trading Days Green</span>
                </div>
              </div>

              {/* Setups Breakdown */}
              <div className="space-y-3">
                <p className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">Best Execution Setups</p>
                {sortedSetups.length > 0 ? (
                  sortedSetups.map((setup, idx) => (
                    <div key={setup.name} className="p-3 rounded-2xl bg-muted/10 border border-border/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-foreground truncate max-w-[140px]">{setup.name}</span>
                        <span className={`text-xs font-black ${setup.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {setup.pnl >= 0 ? '+' : '-'}${Math.abs(setup.pnl).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${setup.winRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase shrink-0">{setup.winRate.toFixed(0)}% Win</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs font-bold text-muted-foreground/60 uppercase">No Setups Recorded</div>
                )}
              </div>

              {/* Session Performance */}
              <div className="space-y-3">
                <p className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">Session Performance</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.entries(sessionStats).map(([name, data]) => {
                    const isSessionWin = data.pnl > 0.01;
                    const isSessionLoss = data.pnl < -0.01;
                    return (
                      <div key={name} className="p-2.5 rounded-xl bg-muted/15 border border-border/10 flex flex-col justify-between items-center text-center gap-1">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{name}</span>
                        <span className={`text-xs font-black ${isSessionWin ? 'text-green-500' : isSessionLoss ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {data.count > 0 ? `${data.pnl >= 0 ? '+' : '-'}$${Math.abs(data.pnl).toFixed(0)}` : '—'}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase">{data.count} Trades</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cognitive coach tip */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 items-start select-none">
                <TrophyFill className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Tip</p>
                  <p className="text-xs leading-relaxed text-muted-foreground font-semibold uppercase">{smartTip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




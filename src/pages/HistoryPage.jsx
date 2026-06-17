import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { Download, Search, XLg, PencilSquare, Share } from 'react-bootstrap-icons';
import { AnimatePresence } from 'framer-motion';
import { CustomSelect } from '../components/ui/CustomSelect';
import { EditTradeModal } from '../components/EditTradeModal';
import { ImageViewerModal } from '../components/ImageViewerModal';
import { ShareTradeModal } from '../components/ShareTradeModal';
import { formatCurrency, formatPrice, formatNumber } from '../lib/tradeUtils';

const HistorySkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex gap-4 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 bg-muted rounded-lg w-full"></div>
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 bg-muted rounded-2xl w-full"></div>
      ))}
    </div>
  </div>
);

export function HistoryPage() {
  const { trades, isLoadingTrades, removeTrade, editTrade, plan, setShowPricingModal } = useOutletContext();
  const toast = useToast();
  
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDir, setFilterDir] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterTimeframe, setFilterTimeframe] = useState('');
  const [filterSort, setFilterSort] = useState('newest');
  const [isCompactMode, setIsCompactMode] = useState(false);
  
  const [editingTrade, setEditingTrade] = useState(null);
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [activeImageUrl, setActiveImageUrl] = useState(null);
  const [sharingTrade, setSharingTrade] = useState(null);

  const formatTradeTime = (timestamp) => {
    if (!timestamp) return '';
    let dateObj = null;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      dateObj = new Date(timestamp);
    } else if (timestamp.seconds !== undefined) {
      dateObj = new Date(timestamp.seconds * 1000);
    }
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const getTimestampMs = (t) => {
    if (!t.timestamp) return 0;
    if (t.timestamp.toDate && typeof t.timestamp.toDate === 'function') {
      return t.timestamp.toDate().getTime();
    }
    if (t.timestamp instanceof Date) {
      return t.timestamp.getTime();
    }
    if (typeof t.timestamp === 'string' || typeof t.timestamp === 'number') {
      return new Date(t.timestamp).getTime();
    }
    if (t.timestamp.seconds !== undefined) {
      return t.timestamp.seconds * 1000;
    }
    return 0;
  };

  const handleFilterSearch = (val) => {
    setFilterSearch(val);
    setVisibleCount(30);
  };
  const handleFilterDir = (val) => {
    setFilterDir(val);
    setVisibleCount(30);
  };
  const handleFilterOutcome = (val) => {
    setFilterOutcome(val);
    setVisibleCount(30);
  };
  const handleFilterSession = (val) => {
    setFilterSession(val);
    setVisibleCount(30);
  };
  const handleFilterStrategy = (val) => {
    setFilterStrategy(val);
    setVisibleCount(30);
  };
  const handleFilterMood = (val) => {
    setFilterMood(val);
    setVisibleCount(30);
  };
  const handleFilterGrade = (val) => {
    setFilterGrade(val);
    setVisibleCount(30);
  };
  const handleFilterTimeframe = (val) => {
    setFilterTimeframe(val);
    setVisibleCount(30);
  };
  const handleFilterSort = (val) => {
    setFilterSort(val);
    setVisibleCount(30);
  };

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = trades.filter(t => {
      if (filterSearch && !t.note?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      if (filterDir && t.direction !== filterDir) return false;
      if (filterOutcome && t.outcome !== filterOutcome) return false;
      if (filterSession && t.session !== filterSession) return false;
      if (filterStrategy) {
        const hasStrat = t.strategies?.includes(filterStrategy);
        const hasLegacySetup = t.setup === filterStrategy;
        if (!hasStrat && !hasLegacySetup) return false;
      }
      if (filterMood && t.preTradeMood !== filterMood) return false;
      if (filterGrade && t.setupGrade !== filterGrade) return false;
      if (filterTimeframe && t.timeframe !== filterTimeframe) return false;
      return true;
    });

    if (filterSort === 'oldest') {
      filtered.sort((a, b) => {
        const timeA = getTimestampMs(a);
        const timeB = getTimestampMs(b);
        if (timeA && timeB && timeA !== timeB) return timeA - timeB;
        return (a.date || '').localeCompare(b.date || '');
      });
    } else if (filterSort === 'best') {
      filtered.sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    } else if (filterSort === 'worst') {
      filtered.sort((a, b) => (a.pnl || 0) - (b.pnl || 0));
    } else {
      // default 'newest': assuming descending date and time order
      filtered.sort((a, b) => {
        const timeA = getTimestampMs(a);
        const timeB = getTimestampMs(b);
        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
        return (b.date || '').localeCompare(a.date || '');
      });
    }
    return filtered;
  }, [trades, filterSearch, filterDir, filterOutcome, filterSession, filterStrategy, filterMood, filterGrade, filterTimeframe, filterSort]);

  const uniqueStrategies = useMemo(() => {
    const strats = new Set();
    trades.forEach(t => {
      if (t.strategies && t.strategies.length > 0) {
        t.strategies.forEach(s => strats.add(s));
      } else if (t.setup) {
        strats.add(t.setup);
      }
    });
    return Array.from(strats).sort();
  }, [trades]);

  const strategyOptions = [
    { value: '', label: 'All strategies' },
    ...uniqueStrategies.map(s => ({ value: s, label: s }))
  ];

  const displayedTrades = useMemo(() => {
    return filteredAndSortedTrades.slice(0, visibleCount);
  }, [filteredAndSortedTrades, visibleCount]);

  if (isLoadingTrades) return <HistorySkeleton />;

  const onExportCSV = () => {
    if (plan !== 'pro') {
      setShowPricingModal(true);
      return toast('Upgrade to Pro to export your trade data.', 'warn');
    }
    if (!trades.length) return toast('No trades to export.', 'warn');
    const headers = ['Date', 'Direction', 'Entry', 'Exit', 'P&L', 'Swap', 'Pips', 'Session', 'Setup', 'Outcome', 'Note'];
    const rows = trades.map(t => [
      t.date, t.direction, t.entry, t.exit, t.pnl, t.swap || 0, t.pips || 0, t.session, t.setup, t.outcome, `"${(t.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    
    // Modern Blob + URL approach for large datasets
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trading_journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    toast('CSV exported.', 'success');
  };

  const onSaveEdit = async (id, data) => {
    try {
      await editTrade(id, data);
      setEditingTrade(null);
      toast('Trade log updated.', 'success');
    } catch {
      toast('Failed to update log.', 'error');
    }
  };

  const onDeleteTrade = async (id) => {
    if (confirm('Delete this trade?')) {
      try {
        await removeTrade(id);
        toast('Trade deleted.', 'warn');
      } catch (e) {
        console.error('Delete error:', e);
        toast('Failed to delete trade.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Trade History</h1>
          <p className="text-muted-foreground text-sm font-medium">A comprehensive log of your past performance.</p>
        </div>
        <div className="flex flex-row-reverse sm:flex-row items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center bg-muted/30 rounded-xl p-1 border border-border/40 shrink-0">
            <button 
              onClick={() => setIsCompactMode(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isCompactMode ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Cards
            </button>
            <button 
              onClick={() => setIsCompactMode(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isCompactMode ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Compact
            </button>
          </div>
          <button onClick={onExportCSV} className="learn-more shrink-0 scale-90 sm:scale-100 origin-right">
            <span className="circle" aria-hidden="true">
              <span className="icon arrow" />
            </span>
            <span className="button-text">Export</span>
          </button>
        </div>
      </header>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={filterSearch} 
            onChange={e => handleFilterSearch(e.target.value)} 
            className="input-premium col-span-2 md:col-span-1"
          />
          <CustomSelect 
            value={filterDir} 
            onChange={handleFilterDir}
            placeholder="All directions"
            options={[
              { value: '', label: 'All directions' },
              { value: 'BUY', label: 'BUY' },
              { value: 'SELL', label: 'SELL' }
            ]}
          />
          <CustomSelect 
            value={filterOutcome} 
            onChange={handleFilterOutcome}
            placeholder="All outcomes"
            options={[
              { value: '', label: 'All outcomes' },
              { value: 'WIN', label: 'WIN' },
              { value: 'LOSS', label: 'LOSS' },
              { value: 'BE', label: 'Breakeven' }
            ]}
          />
          <CustomSelect 
            value={filterSession} 
            onChange={handleFilterSession}
            placeholder="All sessions"
            options={[
              { value: '', label: 'All sessions' },
              { value: 'Sydney', label: 'Sydney' },
              { value: 'Tokyo', label: 'Tokyo' },
              { value: 'London', label: 'London' },
              { value: 'NewYork', label: 'New York' }
            ]}
          />
          <CustomSelect 
            value={filterStrategy} 
            onChange={handleFilterStrategy}
            placeholder="All strategies"
            options={strategyOptions}
          />
          <CustomSelect 
            value={filterMood} 
            onChange={handleFilterMood}
            placeholder="All moods"
            options={[
              { value: '', label: 'All moods' },
              { value: 'Terrible', label: 'Terrible 😡' },
              { value: 'Bad', label: 'Bad 🙁' },
              { value: 'Neutral', label: 'Neutral 😐' },
              { value: 'Good', label: 'Good 🙂' },
              { value: 'Excellent', label: 'Excellent 😎' }
            ]}
          />
          <CustomSelect 
            value={filterGrade} 
            onChange={handleFilterGrade}
            placeholder="All grades"
            options={[
              { value: '', label: 'All grades' },
              { value: 'A+', label: 'A+' },
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' }
            ]}
          />
          <CustomSelect 
            value={filterTimeframe} 
            onChange={handleFilterTimeframe}
            placeholder="All timeframes"
            options={[
              { value: '', label: 'All timeframes' },
              { value: 'M1', label: 'M1' },
              { value: 'M5', label: 'M5' },
              { value: 'M15', label: 'M15' },
              { value: 'M30', label: 'M30' },
              { value: 'H1', label: 'H1' },
              { value: 'H4', label: 'H4' },
              { value: 'D1', label: 'D1' },
              { value: 'W1', label: 'W1' }
            ]}
          />
          <CustomSelect 
            value={filterSort} 
            onChange={handleFilterSort}
            options={[
              { value: 'newest', label: 'Newest first' },
              { value: 'oldest', label: 'Oldest first' },
              { value: 'best', label: 'Best P&L' },
              { value: 'worst', label: 'Worst P&L' }
            ]}
          />
        </div>

        {filteredAndSortedTrades.length === 0 ? (
          <div className="card-premium p-12 text-center text-muted-foreground italic flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-2 shadow-inner">
              <Search className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-40">No trades match the current filter</span>
          </div>
        ) : (
          <div className={isCompactMode ? "card-premium overflow-hidden divide-y divide-border/10" : "space-y-4"}>
            {displayedTrades.map((t, idx) => {
              const isWin = t.pnl >= 0;
              const formattedPnL = formatCurrency(t.pnl, true);
              const formattedPips = `${formatNumber(t.pips || 0, 0)} pips`;
              
              return isCompactMode ? (
                <div 
                  key={t.id}
                  className="flex flex-col p-3 sm:p-4 hover:bg-muted/10 cursor-pointer group transition-colors animate-in fade-in"
                  onClick={() => setExpandedTradeId(prev => prev === t.id ? null : t.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <div className="flex items-center gap-3 w-full sm:w-2/5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isWin ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                      <div className="font-bold whitespace-nowrap text-foreground">
                        {t.date} {t.timestamp ? `· ${formatTradeTime(t.timestamp)}` : ''}
                      </div>
                      <div className="text-muted-foreground hidden sm:block whitespace-nowrap">{t.market || 'XAU/USD'}</div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isWin ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.direction}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-3/5 justify-between sm:justify-end mt-2 sm:mt-0">
                      <div className="flex items-center gap-2 md:gap-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        {((t.strategies?.length > 0) ? t.strategies : (t.setup ? [t.setup] : [])).map((strat, i) => (
                          <span key={i} className="hidden md:inline-block border border-border/20 px-1.5 rounded">{strat}</span>
                        ))}
                        {t.rr && <span className="text-blue-500/70">RR: {t.rr}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className={`font-black tracking-tight text-sm ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                            {formattedPnL}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{formattedPips}</span>
                        </div>
                        <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setSharingTrade(t); }} className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-blue-500"><Share size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); setEditingTrade(t); }} className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary"><PencilSquare size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); onDeleteTrade(t.id); }} className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive"><XLg size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedTradeId === t.id && (
                    <div className="w-full mt-3 pt-3 border-t border-border/10 text-[11px] text-muted-foreground space-y-3">
                      {/* Extended Fields Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-muted/20 border border-border/10 p-3 rounded-xl text-left">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block">Risk %</span>
                          <span className="text-xs font-bold text-foreground">{t.riskPercent ? `${t.riskPercent}%` : '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block">Max Loss</span>
                          <span className="text-xs font-bold text-foreground">{t.maxDailyLoss ? `$${t.maxDailyLoss}` : '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block">Mood</span>
                          <span className="text-xs font-bold text-foreground">{t.preTradeMood || '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block">Conviction</span>
                          <span className={`text-xs font-black uppercase tracking-wider ${t.conviction === 'High' ? 'text-green-500' : t.conviction === 'Medium' ? 'text-amber-500' : t.conviction === 'Low' ? 'text-rose-500' : 'text-muted-foreground/45'}`}>{t.conviction || '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block">Timeframe</span>
                          <span className="text-xs font-bold text-foreground">{t.timeframe || '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block">Setup Quality</span>
                          <span className="text-xs font-bold text-foreground">{t.setupGrade || '—'}</span>
                        </div>
                      </div>

                      {/* Notes & Reflections side-by-side or stacked */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div className="bg-black/10 p-3 rounded-lg border border-white/5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Notes:</span>
                          <div className="text-xs font-semibold text-foreground/80 leading-relaxed whitespace-pre-wrap">{t.note || 'No notes.'}</div>
                        </div>
                        <div className="bg-black/10 p-3 rounded-lg border border-white/5">
                          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider block mb-1">Reflection:</span>
                          <div className="text-xs font-semibold text-foreground/80 leading-relaxed whitespace-pre-wrap">{t.postReflect || 'No reflection.'}</div>
                        </div>
                      </div>

                      {t.screenshots && t.screenshots.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">Screenshots attached</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  key={t.id} 
                  className="card-premium p-5 cursor-pointer group hover:bg-muted/10 animate-in slide-in-from-bottom-2 duration-500 ease-[var(--apple-ease)] space-y-4 text-left" 
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => setExpandedTradeId(prev => prev === t.id ? null : t.id)}
                >
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Icon + Symbol + Date */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isWin ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isWin ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 6l-9.5 9.5-5-5L1 18" />
                            <path d="M17 6h6v6" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 18l-9.5-9.5-5 5L1 6" />
                            <path d="M17 18h6v-6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm font-black text-foreground flex items-center gap-2">
                          {t.market || 'XAU/USD'}
                          {t.source === 'MT5_AUTO' && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">MT5</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold mt-0.5">
                          {t.date} {t.timestamp ? `· ${formatTradeTime(t.timestamp)}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Right: P&L + Pips + Action buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/5 w-full sm:w-auto">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className={`text-lg font-black tracking-tight ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                          {formattedPnL}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold mt-0.5">{formattedPips}</span>
                      </div>

                      {/* Share, Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          className="w-8 h-8 rounded-lg border border-border/40 bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-blue-500 transition-all active:scale-90"
                          onClick={e => { e.stopPropagation(); setSharingTrade(t); }}
                        >
                          <Share className="w-4 h-4" />
                        </button>
                        <button 
                          className="w-8 h-8 rounded-lg border border-border/40 bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-90"
                          onClick={e => { e.stopPropagation(); setEditingTrade(t); }}
                        >
                          <PencilSquare className="w-4 h-4" />
                        </button>
                        <button 
                          className="w-8 h-8 rounded-lg border border-border/40 bg-card hover:bg-destructive/10 flex items-center justify-center text-muted-foreground/60 hover:text-destructive transition-all active:scale-90"
                          onClick={e => { e.stopPropagation(); onDeleteTrade(t.id); }}
                        >
                          <XLg className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-3 sm:pt-2 text-left">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Entry</div>
                      <div className="text-xs font-bold text-foreground">{formatPrice(t.entry)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Exit</div>
                      <div className="text-xs font-bold text-foreground">{formatPrice(t.exit)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Stop Loss</div>
                      <div className="text-xs font-bold text-foreground">{t.sl ? formatPrice(t.sl) : '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Take Profit</div>
                      <div className="text-xs font-bold text-foreground">{t.tp ? formatPrice(t.tp) : '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">R:R</div>
                      <div className="text-xs font-black text-blue-500">{t.rr ? `${t.rr}` : '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Risk</div>
                      <div className="text-xs font-bold text-foreground">{t.risk ? `${t.risk}%` : '2%'}</div>
                    </div>
                  </div>

                  {/* Tags and Meta Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/10">
                    {((t.strategies?.length > 0) ? t.strategies : (t.setup ? [t.setup] : [])).map((strat, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {strat}
                      </span>
                    ))}
                    {t.session && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border/30">
                        {t.session}
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isWin ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {t.direction}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground ml-auto">
                      Confidence: {t.confidence ? `${t.confidence}/10` : '8/10'}
                    </span>
                  </div>

                  {/* Notes Area (Collapsible) */}
                  {expandedTradeId === t.id && (
                    <div className="mt-3 pt-3 border-t border-border/20 animate-in slide-in-from-top-2 duration-500 ease-[var(--apple-ease)] space-y-4">
                      
                      {/* Extended Fields Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 bg-muted/20 border border-border/20 p-4 rounded-2xl text-left">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Risk Percent</span>
                          <span className="text-xs font-bold text-foreground">{t.riskPercent ? `${t.riskPercent}%` : '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Max Daily Loss</span>
                          <span className="text-xs font-bold text-foreground">{t.maxDailyLoss ? `$${t.maxDailyLoss}` : '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Pre-Trade Mood</span>
                          <span className="text-xs font-bold text-foreground">{t.preTradeMood ? t.preTradeMood : '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Conviction</span>
                          <span className={`text-xs font-black uppercase tracking-wider ${t.conviction === 'High' ? 'text-green-500' : t.conviction === 'Medium' ? 'text-amber-500' : t.conviction === 'Low' ? 'text-rose-500' : 'text-muted-foreground/45'}`}>{t.conviction || '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Auto R:R</span>
                          <span className="text-xs font-bold text-foreground">{t.autoRR ? `1 : ${t.autoRR}` : '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Timeframe</span>
                          <span className="text-xs font-bold text-foreground">{t.timeframe || '—'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Setup Quality</span>
                          <span className="text-xs font-bold text-foreground">{t.setupGrade || '—'}</span>
                        </div>
                      </div>

                      {/* Tags Lists */}
                      {( (t.marketStructure && t.marketStructure.length > 0) || (t.confluenceFactors && t.confluenceFactors.length > 0) ) && (
                        <div className="flex flex-col gap-2 bg-muted/20 border border-border/20 p-4 rounded-2xl text-left">
                          {t.marketStructure && t.marketStructure.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Market Structure</span>
                              <div className="flex flex-wrap gap-1.5">
                                {t.marketStructure.map((s, idx) => (
                                  <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {t.confluenceFactors && t.confluenceFactors.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider block">Confluences</span>
                              <div className="flex flex-wrap gap-1.5">
                                {t.confluenceFactors.map((c, idx) => (
                                  <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Reflections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="bg-black/25 border border-white/5 rounded-xl p-4 text-left space-y-2">
                          <div className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Notes:</div>
                          <div className="text-xs font-semibold text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {t.note || <span className="text-muted-foreground italic font-normal">No notes provided for this trade.</span>}
                          </div>
                        </div>

                        <div className="bg-black/25 border border-white/5 rounded-xl p-4 text-left space-y-2">
                          <div className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Post-Trade Reflection:</div>
                          <div className="text-xs font-semibold text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {t.postReflect || <span className="text-muted-foreground italic font-normal">No post-trade reflections provided.</span>}
                          </div>
                        </div>
                      </div>
                      
                      {t.screenshots && t.screenshots.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {t.screenshots.map((s, i) => (
                            <div key={i} className="rounded-xl border border-border/50 overflow-hidden bg-muted/50 shadow-inner group/img">
                              <img 
                                src={s} 
                                alt="screenshot" 
                                className="max-w-[180px] sm:max-w-[240px] hover:scale-110 transition-transform duration-700 cursor-zoom-in" 
                                onClick={(e) => { e.stopPropagation(); setActiveImageUrl(s); }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredAndSortedTrades.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount(prev => prev + 30)}
                  className="px-6 py-3 rounded-xl border border-border/50 bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all text-foreground/80"
                >
                  Load More Trades ({filteredAndSortedTrades.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editingTrade && (
        <EditTradeModal 
          trade={editingTrade} 
          plan={plan}
          setShowPricingModal={setShowPricingModal}
          onSave={onSaveEdit} 
          onClose={() => setEditingTrade(null)} 
        />
      )}

      {/* Lightbox for zooming screenshots */}
      <AnimatePresence>
        {activeImageUrl && (
          <ImageViewerModal imageUrl={activeImageUrl} onClose={() => setActiveImageUrl(null)} />
        )}
      </AnimatePresence>

      {sharingTrade && (
        <ShareTradeModal trade={sharingTrade} onClose={() => setSharingTrade(null)} />
      )}
    </div>
  );
}



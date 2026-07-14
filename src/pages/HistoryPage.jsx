import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { Download, Search, XLg, PencilSquare, Share, Sliders, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, CurrencyDollar, Activity } from 'react-bootstrap-icons';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { CustomSelect } from '../components/ui/CustomSelect';
import { EditTradeModal } from '../components/EditTradeModal';
import { ImageViewerModal } from '../components/ImageViewerModal';
import { ShareTradeModal } from '../components/ShareTradeModal';
import { formatCurrency, formatPrice } from '../lib/tradeUtils';
import { getTradeStrategyTags } from '../lib/tradeAnalytics.js';

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
  const { trades, isLoadingTrades, isLoadingMore, hasMoreTrades, loadMoreTrades, loadAllTrades, removeTrade, editTrade, plan, setShowPricingModal } = useOutletContext();
  const toast = useToast();
  
  // Primary layout filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDir, setFilterDir] = useState('');
  const [filterSession, setFilterSession] = useState('');

  // Advanced collapsible filters
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterTimeframe, setFilterTimeframe] = useState('');
  const [filterSort, setFilterSort] = useState('newest');
  
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [activeImageUrl, setActiveImageUrl] = useState(null);
  const [sharingTrade, setSharingTrade] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'ready'

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
    
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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

  // Smart Session filter handler
  const handleSessionPill = (sessionVal) => {
    setFilterSession(sessionVal);
    setVisibleCount(30);
  };

  // Smart Direction filter handler
  const handleDirPill = (dirVal) => {
    setFilterDir(dirVal);
    setVisibleCount(30);
  };

  // Filter and Sort logic
  const filteredAndSortedTrades = useMemo(() => {
    let filtered = trades.filter(t => {
      // Search note, setup, market, strategy
      if (filterSearch) {
        const query = filterSearch.toLowerCase();
        const matchesNote = t.note?.toLowerCase().includes(query);
        const matchesMarket = t.market?.toLowerCase().includes(query);
        const matchesStrategy = getTradeStrategyTags(t).some(s => s.toLowerCase().includes(query));
        if (!matchesNote && !matchesMarket && !matchesStrategy) return false;
      }
      
      // Direction filter
      if (filterDir && t.direction !== filterDir) return false;
      
      // Outcome filter
      if (filterOutcome && t.outcome !== filterOutcome) return false;
      
      // Session filter (mapping pill labels to database values case-insensitively)
      if (filterSession) {
        const s = (t.session || '').toLowerCase();
        const f = filterSession.toLowerCase();
        if (f === 'asia') {
          if (s !== 'tokyo' && s !== 'sydney' && s !== 'asia') return false;
        } else if (f === 'newyork' || f === 'ny') {
          if (s !== 'newyork' && s !== 'new york' && s !== 'ny') return false;
        } else {
          if (s !== f) return false;
        }
      }
      
      // Strategy filter
      if (filterStrategy) {
        if (!getTradeStrategyTags(t).includes(filterStrategy)) return false;
      }
      
      // Mood, Grade, Timeframe
      if (filterMood && t.preTradeMood !== filterMood) return false;
      if (filterGrade && t.setupGrade !== filterGrade) return false;
      if (filterTimeframe && t.timeframe !== filterTimeframe) return false;
      
      return true;
    });

    // Sorting
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
      // default 'newest'
      filtered.sort((a, b) => {
        const timeA = getTimestampMs(a);
        const timeB = getTimestampMs(b);
        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
        return (b.date || '').localeCompare(a.date || '');
      });
    }
    return filtered;
  }, [trades, filterSearch, filterDir, filterOutcome, filterSession, filterStrategy, filterMood, filterGrade, filterTimeframe, filterSort]);

  // Filtered metrics calculation
  const filteredMetrics = useMemo(() => {
    const totalFiltered = filteredAndSortedTrades.length;
    if (totalFiltered === 0) {
      return { pnl: 0, winRate: 0, count: 0, wins: 0, longs: 0, shorts: 0, avgPnl: 0, pips: 0 };
    }
    const totals = filteredAndSortedTrades.reduce((acc, trade) => {
      acc.pnl += Number(trade.pnl) || 0;
      acc.pips += Number(trade.pips) || 0;
      if (trade.outcome === 'WIN') acc.wins += 1;
      const direction = trade.direction?.toUpperCase();
      if (direction === 'BUY') acc.longs += 1;
      if (direction === 'SELL') acc.shorts += 1;
      return acc;
    }, { pnl: 0, pips: 0, wins: 0, longs: 0, shorts: 0 });

    return {
      ...totals,
      winRate: Math.round((totals.wins / totalFiltered) * 100),
      count: totalFiltered,
      avgPnl: totals.pnl / totalFiltered,
    };
  }, [filteredAndSortedTrades]);

  const uniqueStrategies = useMemo(() => {
    const strats = new Set();
    trades.forEach(t => {
      getTradeStrategyTags(t).forEach(s => strats.add(s));
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

  const handleLoadMore = async () => {
    if (visibleCount < filteredAndSortedTrades.length) {
      setVisibleCount((count) => count + 30);
      return;
    }
    await loadMoreTrades();
    setVisibleCount((count) => count + 30);
  };

  if (isLoadingTrades) return <HistorySkeleton />;

  const onExportCSV = (tradesToExport = trades) => {
    if (plan !== 'pro') {
      setShowPricingModal(true);
      return toast('Upgrade to Pro to export your trade data.', 'warn');
    }
    if (!tradesToExport.length) return toast('No trades to export.', 'warn');
    const headers = ['Date', 'Direction', 'Entry', 'Exit', 'P&L', 'Swap', 'Pips', 'Session', 'Setup', 'Outcome', 'Note'];
    const rows = tradesToExport.map(t => [
      t.date, t.direction, t.entry, t.exit, t.pnl, t.swap || 0, t.pips || 0, t.session,
      `"${getTradeStrategyTags(t).join(' | ').replace(/"/g, '""')}"`, t.outcome,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trading_journal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast('CSV exported.', 'success');
  };

  const handleExportClick = async (e) => {
    e.preventDefault();

    if (downloadState === 'idle') {
      setDownloadState('downloading');
      setTimeout(() => {
        setDownloadState('ready');
      }, 3900); // 3.9 seconds (0.4s delay + 3s rotating animation + transition buffer)
    } else if (downloadState === 'ready') {
      if (plan !== 'pro') {
        setShowPricingModal(true);
        toast('Upgrade to Pro to export your trade data.', 'warn');
        setDownloadState('idle');
        return;
      }
      try {
        const completeHistory = await loadAllTrades();
        if (!completeHistory.length) {
          toast('No trades to export.', 'warn');
          return;
        }
        onExportCSV(completeHistory);
      } catch (error) {
        console.error('CSV export failed:', error);
        toast('Could not load the complete trade history.', 'error');
      } finally {
        setDownloadState('idle');
      }
    }
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight font-sans">Trade History</h1>
          <p className="text-muted-foreground text-xs font-semibold mt-1">A comprehensive log of your past performance.</p>
        </div>
        <div className="download-btn-wrapper shrink-0">
          <div 
            className={`export-btn ${downloadState === 'idle' ? '' : downloadState}`}
            onClick={handleExportClick}
          >
            <span className="export-btn__text">{downloadState === 'ready' ? 'Open' : 'Export'}</span>
            <span className="export-btn__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" className="export-btn__svg">
                <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z" />
                <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z" />
                <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z" />
              </svg>
            </span>
          </div>
        </div>
      </header>
      
      {/* TOP TIER: FILTERED METRICS CARDS (COMPACT & RESPONSIVE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 shrink-0 max-w-[1550px] w-full">
        
        {/* Card 1: Filtered P&L */}
        <div className="apple-glass-panel p-4.5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-primary/20 transition-all duration-300 border border-border/10">
          <div className="space-y-1 relative z-10 text-left">
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground">Filtered P&L</span>
            <h2 className={`text-xl font-black tracking-tight mt-1 ${filteredMetrics.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {filteredMetrics.pnl >= 0 ? '+' : ''}{formatCurrency(filteredMetrics.pnl)}
            </h2>
            <div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground/60 mt-1 flex items-center gap-1 tracking-wider">
              <span>Avg:</span>
              <span className={filteredMetrics.avgPnl >= 0 ? 'text-green-500/80' : 'text-red-500/80'}>
                {filteredMetrics.avgPnl >= 0 ? '+' : ''}{formatCurrency(filteredMetrics.avgPnl)}
              </span>
              <span>/ trade</span>
            </div>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10 ${filteredMetrics.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
            <CurrencyDollar className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* Card 2: Win Rate */}
        <div className="apple-glass-panel p-4.5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-primary/20 transition-all duration-300 border border-border/10">
          <div className="space-y-1 relative z-10 text-left">
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground">Win Rate</span>
            <h2 className="text-xl font-black tracking-tight text-[#E5B80B] mt-1">
              {filteredMetrics.winRate}%
            </h2>
            <div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground/60 mt-1 tracking-wider">
              {filteredMetrics.wins} wins of {filteredMetrics.count} trades
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[#E5B80B] shrink-0 relative z-10">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-yellow-500/10 transition-colors" />
        </div>

        {/* Card 3: Trades Count */}
        <div className="apple-glass-panel p-4.5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-primary/20 transition-all duration-300 border border-border/10">
          <div className="space-y-1 relative z-10 text-left">
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground">Trades</span>
            <h2 className="text-xl font-black tracking-tight text-purple-400 mt-1">
              {filteredMetrics.count}
            </h2>
            <div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground/60 mt-1 tracking-wider">
              {filteredMetrics.longs} Long · {filteredMetrics.shorts} Short
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 relative z-10">
            <Activity className="w-5 h-5" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
        </div>

        {/* Card 4: Captured Pips */}
        <div className="apple-glass-panel p-4.5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-primary/20 transition-all duration-300 border border-border/10">
          <div className="space-y-1 relative z-10 text-left">
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground">Captured Pips</span>
            <h2 className={`text-xl font-black tracking-tight mt-1 ${filteredMetrics.pips >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {filteredMetrics.pips >= 0 ? '+' : ''}{filteredMetrics.pips.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </h2>
            <div className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground/60 mt-1 tracking-wider">
              Net captured pips
            </div>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10 ${filteredMetrics.pips >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div className={`absolute top-0 right-0 w-20 h-20 ${filteredMetrics.pips >= 0 ? 'bg-emerald-500/5' : 'bg-rose-500/5'} rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors`} />
        </div>

      </div>

      {/* FILTER BAR SECTION */}
      <div className="space-y-4 relative z-30">
        <div className="apple-glass-panel p-3 rounded-2xl flex flex-col lg:flex-row items-center gap-4 border border-border/10">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search setups..." 
              value={filterSearch} 
              onChange={e => handleFilterSearch(e.target.value)} 
              className="w-full bg-muted/40 border border-border/30 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-primary/50 text-foreground transition-all"
            />
          </div>

          {/* Direction Filter Pills */}
          <div className="flex bg-muted/30 p-0.5 rounded-xl border border-border/30 self-stretch lg:self-auto overflow-x-auto">
            <button 
              onClick={() => handleDirPill('')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${filterDir === '' ? 'bg-[#EDAE49] text-[#003D5B] shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            <button 
              onClick={() => handleDirPill('BUY')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer flex items-center gap-1 ${filterDir === 'BUY' ? 'bg-[#EDAE49] text-[#003D5B] shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ArrowUpRight className="w-2.5 h-2.5" /> Long
            </button>
            <button 
              onClick={() => handleDirPill('SELL')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer flex items-center gap-1 ${filterDir === 'SELL' ? 'bg-[#EDAE49] text-[#003D5B] shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ArrowDownRight className="w-2.5 h-2.5" /> Short
            </button>
          </div>

          {/* Session Filter Pills */}
          <div className="flex bg-muted/30 p-0.5 rounded-xl border border-border/30 self-stretch lg:self-auto overflow-x-auto">
            <button 
              onClick={() => handleSessionPill('')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${filterSession === '' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All Sessions
            </button>
            <button 
              onClick={() => handleSessionPill('London')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${filterSession === 'London' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              London
            </button>
            <button 
              onClick={() => handleSessionPill('NewYork')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${filterSession === 'NewYork' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              NY
            </button>
            <button 
              onClick={() => handleSessionPill('Asia')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${filterSession === 'Asia' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Asia
            </button>
            <button 
              onClick={() => handleSessionPill('Overlap')} 
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer ${filterSession === 'Overlap' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Overlap
            </button>
          </div>

          {/* More Filters Toggle */}
          <button 
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`w-full lg:w-auto lg:ml-auto px-4 py-2 border rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer active:scale-95 ${showMoreFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border/40 hover:bg-muted text-muted-foreground'}`}
          >
            <Sliders className="w-3 h-3" /> More Filters
          </button>

        </div>

        {/* Collapsible Drawer for Advanced Filters */}
        <AnimatePresence>
          {showMoreFilters && (
            <Motion.div
              initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
              animate={{ 
                height: 'auto', 
                opacity: 1,
                transitionEnd: { overflow: 'visible' }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                overflow: 'hidden'
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="apple-glass-panel p-5 rounded-2xl border border-border/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* Outcomes */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground">Outcome</span>
                  <CustomSelect 
                    value={filterOutcome} 
                    onChange={setFilterOutcome}
                    placeholder="All outcomes"
                    options={[
                      { value: '', label: 'All outcomes' },
                      { value: 'WIN', label: 'WIN' },
                      { value: 'LOSS', label: 'LOSS' },
                      { value: 'BE', label: 'Breakeven' }
                    ]}
                  />
                </div>

                {/* Strategies */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground">Strategy</span>
                  <CustomSelect 
                    value={filterStrategy} 
                    onChange={setFilterStrategy}
                    placeholder="All strategies"
                    options={strategyOptions}
                  />
                </div>

                {/* Moods */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground">Mood</span>
                  <CustomSelect 
                    value={filterMood} 
                    onChange={setFilterMood}
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
                </div>

                {/* Grades */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground">Grade</span>
                  <CustomSelect 
                    value={filterGrade} 
                    onChange={setFilterGrade}
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
                </div>

                {/* Timeframe */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground">Timeframe</span>
                  <CustomSelect 
                    value={filterTimeframe} 
                    onChange={setFilterTimeframe}
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
                </div>

                {/* Sort Order */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground">Sort Order</span>
                  <CustomSelect 
                    value={filterSort} 
                    onChange={setFilterSort}
                    options={[
                      { value: 'newest', label: 'Newest first' },
                      { value: 'oldest', label: 'Oldest first' },
                      { value: 'best', label: 'Best P&L' },
                      { value: 'worst', label: 'Worst P&L' }
                    ]}
                  />
                </div>

              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TRADE ROWS LIST */}
      <div className="space-y-4">
        {filteredAndSortedTrades.length === 0 ? (
          <div className="apple-glass-panel p-6 sm:p-12 text-center text-muted-foreground italic flex flex-col items-center gap-4 border border-border/10">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center shadow-inner">
              <Search className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-40">No trades match the current filters</span>
          </div>
        ) : (
          <div className="space-y-3.5">
            {displayedTrades.map((t) => {
              const isWin = t.pnl >= 0;
              const formattedPnL = formatCurrency(t.pnl, true);
              const formattedPips = t.pips >= 0 ? `+${t.pips}` : `${t.pips}`;
              const strat = getTradeStrategyTags(t)[0] || 'Unclassified';
              
              return (
                <div 
                  key={t.id} 
                  className="apple-glass-panel history-virtual-item p-4 flex flex-col hover:bg-muted/10 transition-all border border-border/10 hover:border-primary/20 duration-300 rounded-3xl"
                >
                  {/* MAIN CARD ROW */}
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedTradeId(prev => prev === t.id ? null : t.id)}
                  >
                    
                    {/* Left side: Win/Loss status square & Market Info */}
                    <div className="flex items-center gap-3.5 w-full sm:w-[350px] shrink-0">
                      
                      {/* Square Status Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isWin ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isWin ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>

                      {/* Market, Badges & Date */}
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#E5B80B]">{t.market || 'XAU/USD'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none ${isWin ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {t.direction}
                          </span>
                          {t.session && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {t.session}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] md:text-xs text-muted-foreground font-bold mt-1">
                          {t.date} {t.timestamp ? `· ${formatTradeTime(t.timestamp)}` : ''} · {strat}
                        </div>
                      </div>

                    </div>

                    {/* Middle stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-[minmax(92px,1fr)_minmax(92px,1fr)_minmax(74px,0.68fr)_minmax(74px,0.68fr)] gap-x-5 gap-y-3 flex-1 text-left sm:px-3 xl:px-5">
                      <div className="min-w-0">
                        <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/60 tracking-wider block">Entry</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{formatPrice(t.entry)}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/60 tracking-wider block">Exit</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{t.exit ? formatPrice(t.exit) : '—'}</span>
                      </div>
                      <div className="min-w-[74px] md:justify-self-center md:text-center">
                        <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/60 tracking-wider block">Pips</span>
                        <span className={`text-xs font-black tabular-nums ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                          {formattedPips}
                        </span>
                      </div>
                      <div className="min-w-[74px] md:justify-self-center md:text-center">
                        <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground/60 tracking-wider block">R:R</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{t.rr ? `1:${t.rr}` : '—'}</span>
                      </div>
                    </div>

                    {/* Right side: P&L, lots & Expand button */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 select-none sm:min-w-[148px]">
                      <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
                        <span className={`text-base font-black tracking-tight tabular-nums ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                          {formattedPnL}
                        </span>
                        <span className="text-[10px] md:text-xs text-muted-foreground mt-0.5 tabular-nums">{t.lots || 0.0} Lots</span>
                      </div>
                      <button 
                        className="w-7 h-7 rounded-lg border border-border/40 hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer transition-colors active:scale-95"
                        onClick={e => {
                          e.stopPropagation();
                          setExpandedTradeId(prev => prev === t.id ? null : t.id);
                        }}
                      >
                        {expandedTradeId === t.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED CONTENT DRAWER */}
                  {expandedTradeId === t.id && (
                    <div className="mt-4 pt-4 border-t border-border/10 text-left space-y-4 animate-in slide-in-from-top-2 duration-300">
                      
                      {/* Detailed Fields Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5 bg-muted/20 border border-border/20 p-4 rounded-2xl">
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Risk Percent</span>
                          <span className="text-xs font-bold text-foreground">{t.riskPercent ? `${t.riskPercent}%` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Stop Loss</span>
                          <span className="text-xs font-bold text-foreground">{t.sl ? formatPrice(t.sl) : '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Take Profit</span>
                          <span className="text-xs font-bold text-foreground">{t.tp ? formatPrice(t.tp) : '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Pre-Trade Mood</span>
                          <span className="text-xs font-bold text-foreground">{t.preTradeMood || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Conviction</span>
                          <span className={`text-xs font-black uppercase tracking-wider ${t.conviction === 'High' ? 'text-green-500' : t.conviction === 'Medium' ? 'text-amber-500' : t.conviction === 'Low' ? 'text-rose-500' : 'text-muted-foreground/45'}`}>{t.conviction || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Timeframe</span>
                          <span className="text-xs font-bold text-foreground">{t.timeframe || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Setup Grade</span>
                          <span className="text-xs font-bold text-foreground">{t.setupGrade || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Auto R:R</span>
                          <span className="text-xs font-bold text-foreground">{t.autoRR ? `1:${t.autoRR}` : '—'}</span>
                        </div>
                      </div>

                      {/* Confluences and Structure */}
                      {((t.marketStructure && t.marketStructure.length > 0) || (t.confluenceFactors && t.confluenceFactors.length > 0)) && (
                        <div className="flex flex-col gap-3 bg-muted/20 border border-border/20 p-4 rounded-2xl">
                          {t.marketStructure && t.marketStructure.length > 0 && (
                            <div>
                              <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block mb-1">Market Structure</span>
                              <div className="flex flex-wrap gap-1.5">
                                {t.marketStructure.map((s, idx) => (
                                  <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {t.confluenceFactors && t.confluenceFactors.length > 0 && (
                            <div>
                              <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block mb-1">Confluence Factors</span>
                              <div className="flex flex-wrap gap-1.5">
                                {t.confluenceFactors.map((c, idx) => (
                                  <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes and Reflection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/10 border border-white/5 p-4 rounded-2xl">
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block mb-1.5">Notes</span>
                          <div className="text-xs font-semibold text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {t.note || <span className="text-muted-foreground/40 italic font-normal">No notes logged.</span>}
                          </div>
                        </div>
                        <div className="bg-black/10 border border-white/5 p-4 rounded-2xl">
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block mb-1.5">Post-Trade Reflection</span>
                          <div className="text-xs font-semibold text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {t.postReflect || <span className="text-muted-foreground/40 italic font-normal">No reflections logged.</span>}
                          </div>
                        </div>
                      </div>

                      {/* Screenshots */}
                      {t.screenshots && t.screenshots.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-wider block">Screenshots</span>
                          <div className="flex flex-wrap gap-3">
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
                        </div>
                      )}

                      {/* Action buttons drawer footer */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/10">
                        <button 
                          className="px-3.5 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-blue-500 transition-all select-none cursor-pointer active:scale-95"
                          onClick={e => { e.stopPropagation(); setSharingTrade(t); }}
                        >
                          <Share className="w-3.5 h-3.5" /> Share
                        </button>
                        <button 
                          className="px-3.5 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-all select-none cursor-pointer active:scale-95"
                          onClick={e => { e.stopPropagation(); setEditingTrade(t); }}
                        >
                          <PencilSquare className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          className="px-3.5 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-destructive/10 flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider text-muted-foreground/60 hover:text-destructive transition-all select-none cursor-pointer active:scale-95"
                          onClick={e => { e.stopPropagation(); onDeleteTrade(t.id); }}
                        >
                          <XLg className="w-3 h-3" /> Delete
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {(filteredAndSortedTrades.length > visibleCount || hasMoreTrades) && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 rounded-xl border border-border/50 bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all text-foreground/80 cursor-pointer"
                >
                  {isLoadingMore ? 'Loading…' : filteredAndSortedTrades.length > visibleCount
                    ? 'Load More Trades (' + (filteredAndSortedTrades.length - visibleCount) + ' loaded)'
                    : 'Load Older Trades'}
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

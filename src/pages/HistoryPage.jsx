import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { Download, XLg, PencilSquare, Share, Sliders } from 'react-bootstrap-icons';
import { AnimatePresence } from 'framer-motion';
import { CustomSelect } from '../components/ui/CustomSelect';
import { EditTradeModal } from '../components/EditTradeModal';
import { ImageViewerModal } from '../components/ImageViewerModal';
import { formatSigned, formatSignedNumber, formatPrice, pnlToneClass, toDate, toMillis } from '../lib/tradeUtils';
import { getTradeSetupKey, getTradeStrategyTags } from '../lib/tradeAnalytics.js';
import { tradeDayKey } from '../lib/disciplineRules.js';
import { isPaidPlan } from '../lib/entitlements.js';
import { DirectionCell } from '../components/app/DirectionCell';
import { SectionCard } from '../components/app/SectionCard';
import { StatCard } from '../components/app/StatCard';
import { EmptyState } from '../components/app/EmptyState';
import { DataTable } from '../components/app/DataTable';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';
import { cn } from '../lib/utils';

// Pulls html2canvas (~48 kB gzip), and only ever renders behind an explicit
// Share click — so it must not sit in this route's chunk.
const ShareTradeModal = lazy(() =>
  import('../components/ShareTradeModal').then((m) => ({ default: m.ShareTradeModal })));

const HistorySkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  </div>
);

// Chip recipe — neutral rectangle, never a colored pill. `title` is the hover
// sentence a discipline chip carries; omitted everywhere else, so no attribute
// is emitted.
const chip = (text, key, title) => (
  <span
    key={key}
    title={title}
    className="inline-flex h-[18px] items-center rounded-sm border border-border px-1.5 font-mono text-[11px] leading-none text-muted-foreground"
  >
    {text}
  </span>
);

const dash = <span className="text-muted-foreground">—</span>;

// Column-width labels for the Rules chips; the full sentence lives in `title`
// and in the expanded row, which is where a flag is actually read.
const RULE_CHIP_LABEL = {
  maxTradesPerDay: 'Limit',
  maxRiskPercent: 'Risk',
  revengeWindow: 'Revenge',
};

const formatTradeTime = (timestamp) => {
  const dateObj = toDate(timestamp);
  if (!dateObj) return '';
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getTimestampMs = (t) => toMillis(t.timestamp) ?? 0;

// Pips are a measurement, not P&L — the digits stay foreground.
const formatPips = formatSignedNumber;

// The page's sort select and the sortable column headers drive the same
// filterSort state — one source of truth, two controls.
const SORT_TO_COLUMN = {
  newest: { columnId: 'date', direction: 'desc' },
  oldest: { columnId: 'date', direction: 'asc' },
  best: { columnId: 'pnl', direction: 'desc' },
  worst: { columnId: 'pnl', direction: 'asc' },
};

// Direction is form + word, never green/red — those belong to P&L alone.
const HISTORY_COLUMNS = [
  {
    id: 'market',
    header: 'Market',
    cell: (t) => <span className="font-medium text-foreground">{t.market || 'XAU/USD'}</span>,
  },
  {
    id: 'direction',
    header: 'Direction',
    cell: (t) => <DirectionCell direction={t.direction} />,
  },
  {
    id: 'date',
    header: 'Date',
    sortable: true,
    cell: (t) => (
      <span className="text-muted-foreground">
        {t.date}
        {t.timestamp ? ` · ${formatTradeTime(t.timestamp)}` : ''}
      </span>
    ),
  },
  { id: 'entry', header: 'Entry', numeric: true, cell: (t) => formatPrice(t.entry) },
  { id: 'exit', header: 'Exit', numeric: true, cell: (t) => (t.exit ? formatPrice(t.exit) : '—') },
  { id: 'pips', header: 'Pips', numeric: true, hideBelow: 'md', cell: (t) => formatPips(t.pips) },
  {
    id: 'rr',
    header: 'R:R',
    numeric: true,
    hideBelow: 'md',
    cell: (t) => (t.rr ? `1:${t.rr}` : '—'),
  },
  {
    id: 'pnl',
    header: 'P&L',
    numeric: true,
    sortable: true,
    cell: (t) => (
      <span className={pnlToneClass(t.pnl)}>
        {formatSigned(t.pnl)}
      </span>
    ),
  },
  { id: 'lots', header: 'Lots', numeric: true, hideBelow: 'lg', cell: (t) => t.lots ?? '—' },
];

function DetailField({ label, value, figure = false }) {
  const missing = value === null || value === undefined || value === '';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm',
          figure && !missing && 'figure',
          missing ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {missing ? '—' : value}
      </span>
    </div>
  );
}

export function HistoryPage() {
  const {
    trades, isLoadingTrades, isLoadingMore, hasMoreTrades, loadMoreTrades, loadAllTrades,
    removeTrade, editTrade, plan, setShowPricingModal,
    setups, setupsById, resolveSetup, createSetup, archiveSetup,
    enabledRuleIds, disciplineViolationsByTradeId, indeterminateDisciplineDayKey,
  } = useOutletContext();
  const toast = useToast();

  // Discipline is free-plan and advisory: the column, the filter, and the
  // expanded-row section all appear together the moment a rule is armed, and
  // all disappear together when none is.
  const hasEnabledRules = (enabledRuleIds?.length || 0) > 0;

  // Primary layout filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDir, setFilterDir] = useState('');
  const [filterSession, setFilterSession] = useState('');

  // Advanced collapsible filters
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterSetup, setFilterSetup] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'ready'

  // A day split across the 100-doc pagination boundary holds an arbitrary
  // subset of itself, so every count- and order-sensitive rule would be wrong
  // on it. Those rows report `—` and are never claimed clean either.
  const isIndeterminate = useCallback(
    (t) => Boolean(indeterminateDisciplineDayKey) && tradeDayKey(t) === indeterminateDisciplineDayKey,
    [indeterminateDisciplineDayKey]
  );

  const violationsFor = useCallback(
    (t) => (t?.id ? disciplineViolationsByTradeId?.get(t.id) || [] : []),
    [disciplineViolationsByTradeId]
  );

  // Catalog name for the bucket the trade reports under. Null covers both
  // 'untagged' and an id whose setup was hard-deleted — neither has a name to
  // show, and inventing one would be worse than a dash.
  const setupNameFor = useCallback(
    (t) => resolveSetup?.(getTradeSetupKey(t, setupsById))?.name || null,
    [resolveSetup, setupsById]
  );

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

  const clearFilters = () => {
    setFilterSearch('');
    setFilterDir('');
    setFilterSession('');
    setFilterOutcome('');
    setFilterSetup('');
    setFilterDiscipline('');
    setFilterMood('');
    setFilterGrade('');
    setFilterTimeframe('');
    setVisibleCount(30);
  };

  // Setup lands after Direction and Rules lands last — a fixed order, so the
  // table never reshuffles as rules are armed or disarmed.
  const historyColumns = useMemo(() => {
    const columns = [...HISTORY_COLUMNS];
    columns.splice(columns.findIndex((c) => c.id === 'direction') + 1, 0, {
      id: 'setup',
      header: 'Setup',
      hideBelow: 'md',
      cell: (t) => {
        const name = setupNameFor(t);
        return name ? chip(name) : dash;
      },
    });
    if (hasEnabledRules) {
      columns.push({
        id: 'rules',
        header: 'Rules',
        hideBelow: 'md',
        cell: (t) => {
          if (isIndeterminate(t)) return dash;
          const rows = violationsFor(t);
          if (!rows.length) return dash;
          return (
            <div className="flex flex-wrap gap-1">
              {rows.map((v, idx) =>
                chip(RULE_CHIP_LABEL[v.ruleId] || 'Rule', `${v.ruleId}-${idx}`, v.message)
              )}
            </div>
          );
        },
      });
    }
    return columns;
  }, [hasEnabledRules, isIndeterminate, setupNameFor, violationsFor]);

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

      // Setup filter — matched in memory against the same bucket key the
      // Setups analytics counts under (R4: no server-side setupId query).
      if (filterSetup && getTradeSetupKey(t, setupsById) !== filterSetup) return false;

      // Discipline filter. Indeterminate rows drop out of both sides: they are
      // not known to have broken a rule, and they are not known to be clean.
      if (filterDiscipline && hasEnabledRules) {
        if (isIndeterminate(t)) return false;
        const broke = violationsFor(t).length > 0;
        if (filterDiscipline === 'breaks' && !broke) return false;
        if (filterDiscipline === 'clean' && broke) return false;
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
  }, [trades, filterSearch, filterDir, filterOutcome, filterSession, filterSetup, filterDiscipline,
    filterMood, filterGrade, filterTimeframe, filterSort, setupsById, hasEnabledRules,
    isIndeterminate, violationsFor]);

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

  // The catalog, not the trades: a setup with no trades yet still belongs in
  // the picker. Archived and merged docs stay out — a merged setup's trades
  // already report under its target.
  const setupOptions = useMemo(() => ([
    { value: '', label: 'All setups' },
    ...(setups || [])
      .filter((s) => !s.archived && !s.mergedInto)
      .map((s) => ({ value: s.id, label: s.name })),
    { value: 'untagged', label: 'Untagged' },
  ]), [setups]);

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
    if (!isPaidPlan(plan)) {
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
      if (!isPaidPlan(plan)) {
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

  const onConfirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      await removeTrade(target.id);
      toast('Trade deleted.', 'warn');
    } catch (e) {
      console.error('Delete error:', e);
      toast('Failed to delete trade.', 'error');
    }
  };

  const onSortChange = ({ columnId, direction }) => {
    if (columnId === 'pnl') {
      setFilterSort(direction === 'desc' ? 'best' : 'worst');
    } else {
      setFilterSort(direction === 'desc' ? 'newest' : 'oldest');
    }
  };

  const renderTradeDetail = (t) => {
    const strat = getTradeStrategyTags(t)[0] || 'Unclassified';
    const rowViolations = hasEnabledRules && !isIndeterminate(t) ? violationsFor(t) : [];
    return (
      <div className="grid gap-4 border-t border-border bg-muted/30 p-4 text-left">
        {/* Detailed fields */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <DetailField label="Setup" value={setupNameFor(t)} />
          <DetailField label="Strategy" value={strat} />
          <DetailField label="Session" value={t.session} />
          <DetailField label="Risk percent" value={t.riskPercent ? `${t.riskPercent}%` : null} figure />
          <DetailField label="Stop loss" value={t.sl ? formatPrice(t.sl) : null} figure />
          <DetailField label="Take profit" value={t.tp ? formatPrice(t.tp) : null} figure />
          <DetailField label="Pre-trade mood" value={t.preTradeMood} />
          <DetailField label="Conviction" value={t.conviction} />
          <DetailField label="Timeframe" value={t.timeframe} />
          <DetailField label="Setup grade" value={t.setupGrade} />
          <DetailField label="Auto R:R" value={t.autoRR ? `1:${t.autoRR}` : null} figure />
        </div>

        {/* Discipline — the full sentence behind each Rules chip. */}
        {rowViolations.length > 0 && (
          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Discipline</span>
            <div className="flex flex-wrap gap-1.5">
              {rowViolations.map((v, idx) => chip(v.message, `${v.ruleId}-${idx}`))}
            </div>
          </div>
        )}

        {/* Confluences and structure */}
        {((t.marketStructure && t.marketStructure.length > 0) || (t.confluenceFactors && t.confluenceFactors.length > 0)) && (
          <div className="flex flex-col gap-3">
            {t.marketStructure && t.marketStructure.length > 0 && (
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Market structure</span>
                <div className="flex flex-wrap gap-1.5">
                  {t.marketStructure.map((s, idx) => chip(s, idx))}
                </div>
              </div>
            )}
            {t.confluenceFactors && t.confluenceFactors.length > 0 && (
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Confluence factors</span>
                <div className="flex flex-wrap gap-1.5">
                  {t.confluenceFactors.map((c, idx) => chip(c, idx))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes and reflection */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</span>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {t.note || <span className="text-muted-foreground">No notes logged.</span>}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Post-trade reflection</span>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {t.postReflect || <span className="text-muted-foreground">No reflections logged.</span>}
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {t.screenshots && t.screenshots.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Screenshots</span>
            <div className="flex flex-wrap gap-3">
              {t.screenshots.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View screenshot ${i + 1} full size`}
                  className="cursor-zoom-in overflow-hidden rounded-md border border-border bg-muted"
                  onClick={() => setActiveImageUrl(s)}
                >
                  <img src={s} alt="" className="block max-w-[180px] sm:max-w-[240px]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Row actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={() => setSharingTrade(t)}>
            <Share aria-hidden="true" data-icon="inline-start" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingTrade(t)}>
            <PencilSquare aria-hidden="true" data-icon="inline-start" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(t)}
          >
            <XLg aria-hidden="true" data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-mono text-lg font-medium text-foreground">Trade history</h1>
          <p className="text-sm text-muted-foreground">A comprehensive log of your past performance.</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={handleExportClick}>
          <Download aria-hidden="true" data-icon="inline-start" />
          {downloadState === 'ready' ? 'Open export' : downloadState === 'downloading' ? 'Preparing…' : 'Export CSV'}
        </Button>
      </header>

      {/* FILTERED METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Filtered P&L"
          value={formatSigned(filteredMetrics.pnl)}
          tone={filteredMetrics.pnl > 0 ? 'positive' : filteredMetrics.pnl < 0 ? 'negative' : 'neutral'}
          hint={`Avg ${formatSigned(filteredMetrics.avgPnl)} / trade`}
        />
        <StatCard
          label="Win rate"
          value={`${filteredMetrics.winRate}%`}
          hint={`${filteredMetrics.wins} wins of ${filteredMetrics.count} trades`}
        />
        <StatCard
          label="Trades"
          value={filteredMetrics.count}
          hint={`${filteredMetrics.longs} long · ${filteredMetrics.shorts} short`}
        />
        <StatCard
          label="Captured pips"
          value={formatPips(filteredMetrics.pips, 1)}
          hint="Net captured pips"
        />
      </div>

      {/* FILTERS */}
      <SectionCard
        title="Filters"
        meta={`${filteredAndSortedTrades.length} of ${trades.length} trades`}
        actions={
          <Button
            variant="outline"
            size="sm"
            aria-expanded={showMoreFilters}
            onClick={() => setShowMoreFilters(!showMoreFilters)}
          >
            <Sliders aria-hidden="true" data-icon="inline-start" />
            More filters
          </Button>
        }
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="w-full lg:w-64">
            <Input
              type="search"
              aria-label="Search notes, markets, and strategies"
              placeholder="Search setups…"
              value={filterSearch}
              onChange={(e) => handleFilterSearch(e.target.value)}
            />
          </div>

          {/* Direction — 'all' sentinel maps to '' at the boundary only */}
          <ToggleGroup
            spacing={0}
            aria-label="Filter by direction"
            value={[filterDir || 'all']}
            onValueChange={([next]) => next && handleDirPill(next === 'all' ? '' : next)}
          >
            <ToggleGroupItem value="all" size="sm">All</ToggleGroupItem>
            <ToggleGroupItem value="BUY" size="sm">
              <span aria-hidden="true">▲</span> Long
            </ToggleGroupItem>
            <ToggleGroupItem value="SELL" size="sm">
              <span aria-hidden="true">▼</span> Short
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Session — analytics buckets; values stay as stored */}
          <ToggleGroup
            spacing={0}
            aria-label="Filter by session"
            value={[filterSession || 'all']}
            onValueChange={([next]) => next && handleSessionPill(next === 'all' ? '' : next)}
          >
            <ToggleGroupItem value="all" size="sm">All sessions</ToggleGroupItem>
            <ToggleGroupItem value="London" size="sm">London</ToggleGroupItem>
            <ToggleGroupItem value="NewYork" size="sm">NY</ToggleGroupItem>
            <ToggleGroupItem value="Asia" size="sm">Asia</ToggleGroupItem>
            <ToggleGroupItem value="Overlap" size="sm">Overlap</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Advanced filters */}
        {showMoreFilters && (
          <div
            className={cn(
              'mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3',
              hasEnabledRules ? 'lg:grid-cols-4' : 'lg:grid-cols-6'
            )}
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Outcome</span>
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

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Setup</span>
              <CustomSelect
                value={filterSetup}
                onChange={setFilterSetup}
                placeholder="All setups"
                options={setupOptions}
              />
            </div>

            {hasEnabledRules && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Discipline</span>
                <CustomSelect
                  value={filterDiscipline}
                  onChange={setFilterDiscipline}
                  placeholder="All trades"
                  options={[
                    { value: '', label: 'All trades' },
                    { value: 'breaks', label: 'Rule breaks only' },
                    { value: 'clean', label: 'Clean only' }
                  ]}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Mood</span>
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

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Grade</span>
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

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Timeframe</span>
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

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Sort order</span>
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
        )}
      </SectionCard>

      {/* TRADE LOG */}
      <SectionCard
        title="Trade log"
        meta={`${displayedTrades.length} of ${filteredAndSortedTrades.length} shown`}
      >
        <DataTable
          caption="Trade history"
          columns={historyColumns}
          rows={displayedTrades}
          getRowId={(t) => t.id}
          sort={SORT_TO_COLUMN[filterSort] || null}
          onSortChange={onSortChange}
          renderExpanded={renderTradeDetail}
          expandedRowId={expandedTradeId}
          onExpandedRowIdChange={setExpandedTradeId}
          empty={
            <EmptyState
              announce
              title="No trades match the current filters"
              description="Loosen a filter or clear them all to see the full record."
              action={
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
              className="py-8"
            />
          }
        />

        {(filteredAndSortedTrades.length > visibleCount || hasMoreTrades) && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading…' : filteredAndSortedTrades.length > visibleCount
                ? 'Load more trades (' + (filteredAndSortedTrades.length - visibleCount) + ' loaded)'
                : 'Load older trades'}
            </Button>
          </div>
        )}
      </SectionCard>

      {editingTrade && (
        <EditTradeModal
          trade={editingTrade}
          plan={plan}
          setShowPricingModal={setShowPricingModal}
          onSave={onSaveEdit}
          onClose={() => setEditingTrade(null)}
          // The modal's Setup picker takes the FULL catalog (archived docs
          // included, so a collision offers Restore rather than a duplicate
          // slug). Without these the picker renders empty and a trade can only
          // be untagged, never re-tagged — a silent degrade, so a wiring test
          // asserts they are here.
          setups={setups}
          createSetup={createSetup}
          archiveSetup={archiveSetup}
        />
      )}

      {/* Lightbox for zooming screenshots */}
      <AnimatePresence>
        {activeImageUrl && (
          <ImageViewerModal imageUrl={activeImageUrl} onClose={() => setActiveImageUrl(null)} />
        )}
      </AnimatePresence>

      {sharingTrade && (
        <Suspense fallback={null}>
          <ShareTradeModal trade={sharingTrade} onClose={() => setSharingTrade(null)} />
        </Suspense>
      )}

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent overlayClassName="z-[70]" className="z-[80]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `The ${deleteTarget.market || 'XAU/USD'} trade from ${deleteTarget.date || 'this record'} will be removed. This cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onConfirmDelete}>
              Delete trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

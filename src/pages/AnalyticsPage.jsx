import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { formatCurrencyCompact, formatCurrency, formatSigned, formatSignedCompact, pnlToneClass } from '../lib/tradeUtils';
import { ANALYTICS_VERSION, getTradeOutcome, getTradeStrategyTags, tradePnlValue } from '../lib/tradeAnalytics.js';
import { DirectionCell } from '../components/app/DirectionCell';
import { Share } from 'react-bootstrap-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { StatCard } from '../components/app/StatCard';
import { SectionCard } from '../components/app/SectionCard';
import { EmptyState } from '../components/app/EmptyState';
import { DataTable } from '../components/app/DataTable';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Pulls html2canvas (~48 kB gzip), and only ever renders behind an explicit
// Share click — so it must not sit in this route's chunk.
const ShareTradeModal = lazy(() =>
  import('../components/ShareTradeModal').then((m) => ({ default: m.ShareTradeModal })));

// Chart colors come from the live CSS tokens so every accent template and both
// modes retint the charts without a per-theme color map (Phase 4 migrates the
// chart internals; this phase migrates the colors).
const cssHsl = (name, alpha) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return alpha != null ? `hsl(${v} / ${alpha})` : `hsl(${v})`;
};

// One source for the session series — the chart datasets, the legend, and the
// summary grid all resolve through these tokens.
const SESSION_TOKENS = {
  London: '--chart-1',
  NY: '--chart-2',
  Asia: '--chart-3',
  Overlap: '--chart-4',
};

// The theme args are unused except as reactivity keys: the token values change
// when the .dark class or the theme-* template class flips on <html>, which
// React cannot observe directly.
const resolveChartColors = (_isLightMode, _currentTemplate) => ({
  win: cssHsl('--win', 0.75),
  winBorder: cssHsl('--win'),
  loss: cssHsl('--loss', 0.75),
  lossBorder: cssHsl('--loss'),
  grid: cssHsl('--border', 0.5),
  ticks: cssHsl('--muted-foreground'),
  border: cssHsl('--border'),
  tooltipBg: cssHsl('--popover'),
  tooltipTitle: cssHsl('--muted-foreground'),
  tooltipBody: cssHsl('--foreground'),
  strategy: cssHsl('--chart-1', 0.8),
  strategyBorder: cssHsl('--chart-1'),
  sessions: Object.fromEntries(
    Object.entries(SESSION_TOKENS).map(([session, token]) => [session, cssHsl(token)])
  ),
});

const signedCompact = formatSignedCompact;

const chip = (text) => (
  <span className="inline-flex h-[18px] items-center rounded-sm border border-border px-1.5 font-mono text-[11px] text-muted-foreground">
    {text}
  </span>
);

const pnlCell = (value) => (
  <span className={pnlToneClass(value)}>
    {formatSigned(value)}
  </span>
);

const SETUP_COLUMNS = [
  {
    id: 'setup',
    header: 'Setup',
    cell: (setup) => <span className="font-medium text-foreground">{setup.name}</span>,
  },
  { id: 'record', header: 'Record', numeric: true, cell: (setup) => `${setup.wins}W / ${setup.losses}L` },
  { id: 'winRate', header: 'Win rate', numeric: true, cell: (setup) => `${setup.winRate}%` },
  { id: 'pnl', header: 'Net P&L', numeric: true, cell: (setup) => pnlCell(setup.pnl) },
];

// Direction is form + word, never green/red — those belong to P&L alone.
const signalColumns = (onShare) => [
  { id: 'date', header: 'Date', cell: (t) => <span className="text-muted-foreground">{t.date}</span> },
  {
    id: 'direction',
    header: 'Type',
    cell: (t) => <DirectionCell direction={t.direction} />,
  },
  {
    id: 'context',
    header: 'Context',
    hideBelow: 'md',
    cell: (t) => {
      const strategy = getTradeStrategyTags(t)[0];
      if (!t.session && !strategy) return '—';
      return (
        <span className="inline-flex items-center gap-1">
          {t.session ? chip(t.session) : null}
          {strategy ? chip(strategy) : null}
        </span>
      );
    },
  },
  { id: 'pnl', header: 'P&L', numeric: true, cell: (t) => pnlCell(tradePnlValue(t)) },
  {
    id: 'share',
    header: <span className="sr-only">Share</span>,
    align: 'end',
    cell: (t) => (
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Share trade from ${t.date}`}
        onClick={() => onShare(t)}
      >
        <Share aria-hidden="true" />
      </Button>
    ),
  },
];

const AnalyticsSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

// Redaction, not blur: locked sections never put the real data in the DOM.
const LockedSection = ({ description, onUpgrade }) => (
  <EmptyState
    title="Unlock with Pro"
    description={description}
    action={
      <Button size="sm" onClick={onUpgrade}>
        Upgrade to Pro
      </Button>
    }
  />
);

export function AnalyticsPage() {
  const { trades, analytics, isLoadingTrades, isLoadingMore, hasMoreTrades, loadAllTrades, walletBalance, plan, isTrial, setShowPricingModal } = useOutletContext();
  const isFree = (plan === 'basic' || plan === 'free') && !isTrial;
  const navigate = useNavigate();
  const { isLightMode, currentTemplate } = useAppTheme();

  const [showExact, setShowExact] = useState({});
  const [sharingTrade, setSharingTrade] = useState(null);
  const [historyLoadError, setHistoryLoadError] = useState(null);

  const setExact = useCallback((index, val) => {
    setShowExact(prev => ({ ...prev, [index]: val }));
  }, []);

  const hydrateAllTrades = useCallback(async () => {
    setHistoryLoadError(null);
    try {
      await loadAllTrades();
    } catch (error) {
      console.error('Failed to load complete analytics history:', error);
      setHistoryLoadError(error);
    }
  }, [loadAllTrades]);

  useEffect(() => {
    if (isLoadingTrades || !hasMoreTrades) return;
    void hydrateAllTrades();
  }, [hasMoreTrades, hydrateAllTrades, isLoadingTrades]);

  const stats = useMemo(() => {
    const tradesList = trades || [];
    const wins = tradesList.filter(t => getTradeOutcome(t) === 'WIN');
    const losses = tradesList.filter(t => getTradeOutcome(t) === 'LOSS');
    const hasAggregate = analytics?.version === ANALYTICS_VERSION && Number.isFinite(Number(analytics.tradeCount));
    const winsCount = hasAggregate ? Number(analytics.wins) || 0 : wins.length;
    const lossesCount = hasAggregate ? Number(analytics.losses) || 0 : losses.length;
    const totalCount = hasAggregate ? Number(analytics.tradeCount) || 0 : tradesList.length;
    const grossWin = hasAggregate ? Number(analytics.grossProfit) || 0 : wins.reduce((s, t) => s + tradePnlValue(t), 0);
    const grossLoss = hasAggregate ? Number(analytics.grossLoss) || 0 : Math.abs(losses.reduce((s, t) => s + tradePnlValue(t), 0));
    const avgWin = winsCount ? grossWin / winsCount : 0;
    const avgLoss = lossesCount ? -(grossLoss / lossesCount) : 0;
    const wr = totalCount ? winsCount / totalCount : 0;
    const expectancy = (wr * avgWin) + ((1 - wr) * avgLoss);
    const pf = grossLoss > 0 ? grossWin / grossLoss : null;

    let peak = walletBalance || 0, maxDD = 0, running = walletBalance || 0;
    const sortedTrades = [...tradesList].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const drawdownCurve = [0];
    const drawdownLabels = ['Start'];

    sortedTrades.forEach(t => {
      running += tradePnlValue(t);
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
      sessionDataMap[s].pnl += tradePnlValue(t);
      sessionDataMap[s].total++;
      if (getTradeOutcome(t) === 'WIN') sessionDataMap[s].wins++;

      const tags = getTradeStrategyTags(t);

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
        strategyDataMap[key].pnl += tradePnlValue(t);
        strategyDataMap[key].total++;
        if (getTradeOutcome(t) === 'WIN') strategyDataMap[key].wins++;
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
    }).filter((setup) => setup.total > 0).sort((a, b) => b.pnl - a.pnl);

    // 2. Monthly P/L
    const monthlyPnlMap = {};
    tradesList.forEach(t => {
      if (!t.date) return;
      const dateObj = new Date(t.date);
      const monthName = dateObj.toLocaleString('en-US', { month: 'short' }); // "May", "Jun", etc.
      monthlyPnlMap[monthName] = (monthlyPnlMap[monthName] || 0) + tradePnlValue(t);
    });

    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsWithTrades = new Set(Object.keys(monthlyPnlMap));
    const monthlyPnlLabels = monthsOrder.filter(m => monthsWithTrades.has(m));
    const monthlyPnlValues = monthlyPnlLabels.map(m => monthlyPnlMap[m] || 0);

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
        if (getTradeOutcome(t) === 'WIN') {
          sessionSummaryMap[session].wins++;
        }
      }

      // Update weekly P&L
      if (t.date) {
        const dateObj = new Date(t.date);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[dateObj.getDay()];
        if (sessionWeeklyPnl[session] && sessionWeeklyPnl[session][dayName] !== undefined) {
          sessionWeeklyPnl[session][dayName] += tradePnlValue(t);
        }
      }
    });

    const sessionSummary = ['Asia', 'London', 'Overlap', 'NY'].map(key => {
      const s = sessionSummaryMap[key];
      const winRate = s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0;
      return {
        key,
        winRate,
        total: s.total
      };
    });

    // 5. Performance by Strategy
    const strategyLabels = Object.keys(strategyDataMap).sort((a, b) => strategyDataMap[b].pnl - strategyDataMap[a].pnl);
    const strategyValues = strategyLabels.map(l => strategyDataMap[l].pnl);

    const totalPnl = hasAggregate ? Number(analytics.totalPnl) || 0 : tradesList.reduce((s, t) => s + tradePnlValue(t), 0);
    const currentWalletBalance = (walletBalance || 0) + totalPnl;
    const winRatePercent = totalCount ? (winsCount / totalCount * 100).toFixed(0) : 0;

    return {
      winsCount,
      lossesCount,
      totalCount,
      avgWin,
      avgLoss,
      expectancy,
      pf,
      sortedTrades,
      setupPerformanceList,
      monthlyPnlLabels,
      monthlyPnlValues,
      sessionWeeklyPnl,
      sessionSummary,
      strategyLabels,
      strategyValues,
      currentWalletBalance,
      winRatePercent
    };
  }, [analytics, trades, walletBalance]);

  const {
    winsCount,
    lossesCount,
    totalCount,
    avgWin,
    avgLoss,
    expectancy,
    pf,
    sortedTrades,
    setupPerformanceList,
    monthlyPnlLabels,
    monthlyPnlValues,
    sessionWeeklyPnl,
    sessionSummary,
    strategyLabels,
    strategyValues,
    currentWalletBalance,
    winRatePercent
  } = stats;

  const chartColors = useMemo(
    () => resolveChartColors(isLightMode, currentTemplate),
    [isLightMode, currentTemplate]
  );

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    animation: { duration: 220 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipTitle,
        bodyColor: chartColors.tooltipBody,
        borderColor: chartColors.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 4,
        displayColors: false
      }
    },
    scales: {
      y: { grid: { color: chartColors.grid, drawBorder: false }, ticks: { color: chartColors.ticks, font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: chartColors.ticks, font: { size: 11 } } }
    }
  }), [chartColors]);

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      monthly: {
        labels: monthlyPnlLabels,
        datasets: [{
          label: 'Monthly P/L',
          data: monthlyPnlValues,
          backgroundColor: monthlyPnlValues.map(v => v >= 0 ? chartColors.win : chartColors.loss),
          borderColor: monthlyPnlValues.map(v => v >= 0 ? chartColors.winBorder : chartColors.lossBorder),
          borderWidth: 1.5,
          borderRadius: 2,
        }]
      },
      sessionWeekly: {
        labels: days,
        datasets: Object.keys(SESSION_TOKENS).map(session => ({
          label: session,
          data: days.map(day => parseFloat(sessionWeeklyPnl[session][day].toFixed(2))),
          backgroundColor: chartColors.sessions[session],
          borderRadius: 2,
          borderWidth: 0,
          barPercentage: 0.8,
          categoryPercentage: 0.8,
        }))
      },
      strategy: {
        labels: strategyLabels,
        datasets: [{
          label: 'Strategy performance',
          data: strategyValues,
          backgroundColor: chartColors.strategy,
          borderColor: chartColors.strategyBorder,
          borderWidth: 1.5,
          borderRadius: 2,
        }]
      }
    };
  }, [chartColors, monthlyPnlLabels, monthlyPnlValues, sessionWeeklyPnl, strategyLabels, strategyValues]);

  const recentSignals = useMemo(() => sortedTrades.slice(-5).reverse(), [sortedTrades]);

  const statCards = useMemo(() => [
    {
      index: 0,
      label: 'Wallet balance',
      value: showExact[0] ? formatCurrency(currentWalletBalance) : formatCurrencyCompact(currentWalletBalance),
      hint: 'Current liquidity',
      tone: 'neutral',
      interactive: true,
    },
    {
      index: 1,
      label: 'Win rate',
      value: `${winRatePercent}%`,
      hint: `${winsCount} successful`,
      tone: 'neutral',
      interactive: false,
    },
    {
      index: 2,
      label: 'Expectancy',
      value: totalCount ? (showExact[2] ? formatSigned(expectancy) : signedCompact(expectancy)) : '—',
      hint: 'Average per trade',
      tone: expectancy > 0 ? 'positive' : expectancy < 0 ? 'negative' : 'neutral',
      interactive: totalCount > 0,
    },
    {
      index: 3,
      label: 'Average win',
      value: winsCount ? (showExact[3] ? formatSigned(avgWin) : signedCompact(avgWin)) : '—',
      hint: `${winsCount} winners`,
      tone: winsCount && avgWin > 0 ? 'positive' : 'neutral',
      interactive: winsCount > 0,
    },
    {
      index: 4,
      label: 'Average loss',
      value: lossesCount ? (showExact[4] ? formatSigned(avgLoss) : signedCompact(avgLoss)) : '—',
      hint: `${lossesCount} losers`,
      tone: lossesCount && avgLoss < 0 ? 'negative' : 'neutral',
      interactive: lossesCount > 0,
    },
    {
      index: 5,
      label: 'Profit factor',
      value: pf !== null ? pf.toFixed(2) : '—',
      hint: 'Gross profit / gross loss',
      tone: 'neutral',
      interactive: false,
    },
  ], [avgLoss, avgWin, currentWalletBalance, expectancy, lossesCount, pf, showExact, totalCount, winRatePercent, winsCount]);

  const recentSignalColumns = signalColumns(setSharingTrade);

  if (historyLoadError && hasMoreTrades) return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-mono text-lg font-medium text-foreground">Analytics</h1>
      </header>
      <SectionCard
        surface
        title="Complete history could not be loaded"
        description="Analytics are hidden so a partial trade history is never presented as authoritative."
      >
        <Button size="sm" onClick={hydrateAllTrades}>
          Retry
        </Button>
      </SectionCard>
    </div>
  );

  if (isLoadingTrades || isLoadingMore || hasMoreTrades) return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-mono text-lg font-medium text-foreground">Analytics</h1>
      </header>
      <AnalyticsSkeleton />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-mono text-lg font-medium text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Where the edge holds and where it leaks.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => {
          const isLocked = isFree && stat.index > 1;
          return (
            <StatCard
              key={stat.index}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              tone={isLocked ? 'neutral' : stat.tone}
              interactive={stat.interactive}
              onRevealChange={stat.interactive ? (revealed) => setExact(stat.index, revealed) : undefined}
              locked={isLocked}
              onLockedActivate={() => setShowPricingModal(true)}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Setup performance */}
        <SectionCard
          surface
          padded={isFree}
          title="Setup performance"
          description="Win rate and net P&L by playbook setup."
          meta={isFree ? undefined : `${setupPerformanceList.length} ${setupPerformanceList.length === 1 ? 'setup' : 'setups'}`}
        >
          {isFree ? (
            <LockedSection
              description="Win rate metrics and net P&L distribution by playbook setup."
              onUpgrade={() => setShowPricingModal(true)}
            />
          ) : (
            <DataTable
              caption="Performance by playbook setup"
              columns={SETUP_COLUMNS}
              rows={setupPerformanceList}
              getRowId={(setup) => setup.name}
              empty={<EmptyState title="No setup data yet" className="py-8" />}
            />
          )}
        </SectionCard>

        {/* Monthly P&L */}
        <SectionCard surface title="Monthly P&L" description="Net result by calendar month.">
          <div className="h-64">
            <Bar data={chartData.monthly} options={chartOptions} />
          </div>
        </SectionCard>

        {/* Session edge */}
        <SectionCard
          surface
          className="lg:col-span-2"
          title="Session edge"
          description="Weekly P&L and win rates by session."
        >
          {isFree ? (
            <LockedSection
              description="Comparative session edge analysis, win rates, and weekly performance."
              onUpgrade={() => setShowPricingModal(true)}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(SESSION_TOKENS).map(([session, token]) => (
                  <span
                    key={session}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block size-2 rounded-sm"
                      style={{ backgroundColor: cssHsl(token) }}
                    />
                    {session}
                  </span>
                ))}
              </div>

              <div className="h-64">
                <Bar data={chartData.sessionWeekly} options={chartOptions} />
              </div>

              <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {sessionSummary.map((session) => (
                  <div key={session.key} className="flex flex-col gap-0.5 rounded-lg border border-border p-2.5">
                    <dt className="text-xs text-muted-foreground">{session.key} win rate</dt>
                    <dd className="figure m-0 text-lg font-medium text-foreground">{session.winRate}%</dd>
                    <dd className="m-0 text-xs text-muted-foreground">
                      {session.total} {session.total === 1 ? 'trade' : 'trades'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </SectionCard>

        {/* Strategy performance */}
        <SectionCard
          surface
          className="lg:col-span-2"
          title="Strategy performance"
          description="Net P&L across playbook and custom strategies."
        >
          {isFree ? (
            <LockedSection
              description="Detailed reports and performance metrics across custom playbook setups."
              onUpgrade={() => setShowPricingModal(true)}
            />
          ) : (
            <div className="h-64">
              <Bar data={chartData.strategy} options={chartOptions} />
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recent signals */}
      <SectionCard
        surface
        padded={false}
        title="Recent signals"
        meta={`${recentSignals.length} of ${sortedTrades.length}`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/history')}>
            View all history
          </Button>
        }
      >
        <DataTable
          caption="Five most recent signals"
          columns={recentSignalColumns}
          rows={recentSignals}
          getRowId={(t, i) => t.id ?? `${t.date}-${i}`}
          empty={
            <EmptyState
              title="No recent signals yet"
              description="Log trades and the latest activity lands here."
              className="py-8"
            />
          }
        />
      </SectionCard>

      {sharingTrade && (
        <Suspense fallback={null}>
          <ShareTradeModal trade={sharingTrade} onClose={() => setSharingTrade(null)} />
        </Suspense>
      )}
    </div>
  );
}

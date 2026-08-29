import { BarChart3, Clock3, RefreshCw, Target, TrendingUp } from 'lucide-react';
import type { UserAnalytics, UserAnalyticsBreakdown } from '../../domain/models';
import { CursorPager, EmptyState, ErrorState, LoadingState, Metric, Notice, Panel, StatusBadge, formatDate, formatMoney } from '../../pages/_shared';
import { describeAdminError } from './adminUserUi';

export interface UserAnalyticsSectionProps {
  data: UserAnalytics | null | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  canPreviousPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRetry: () => void;
}

function percent(value: number | null): string {
  return value === null ? 'Not available' : `${(value * 100).toFixed(1)}%`;
}

function pointWinRate(wins: number, losses: number): number | null {
  const decided = wins + losses;
  return decided > 0 ? wins / decided : null;
}

function BreakdownTable({ title, rows }: { title: string; rows: UserAnalyticsBreakdown[] }) {
  return <Panel title={title}>{rows.length === 0 ? <EmptyState title={`No ${title.toLowerCase()}`} message="This breakdown will appear after categorized trades are recorded." /> : <div className="overflow-x-auto"><table className="user-analytics-table"><thead><tr><th>Group</th><th>Trades</th><th>Win rate</th><th>P&amp;L</th></tr></thead><tbody>{rows.map((row) => <tr key={row.key}><td>{row.name}</td><td>{row.tradeCount.toLocaleString()}</td><td>{percent(row.winRate)}</td><td>{formatMoney(row.totalPnl)}</td></tr>)}</tbody></table></div>}</Panel>;
}

export function UserAnalyticsSection({
  data,
  error,
  isLoading,
  isFetching,
  page,
  canPreviousPage,
  onPreviousPage,
  onNextPage,
  onRetry,
}: UserAnalyticsSectionProps) {
  const failure = error ? describeAdminError(error, 'analytics request') : null;

  if (isLoading) return <Panel title="User analytics"><LoadingState label="Loading user analytics" /></Panel>;
  if (!data && failure) return <Panel title="User analytics"><ErrorState title={failure.title} message={failure.message} onRetry={onRetry} /></Panel>;
  if (!data) return <Panel title="User analytics"><EmptyState icon={<BarChart3 />} title="No analytics available" message="Sanitized trading and journal analytics will appear after eligible records are processed." /></Panel>;

  const freshnessTone = data.freshness.status === 'FRESH' ? 'success' : data.freshness.status === 'PARTIAL' ? 'warning' : 'danger';
  const freshnessLabel = error ? 'Stale' : isFetching ? 'Refreshing' : data.freshness.status;

  return <section className="user-analytics-section" aria-labelledby="user-analytics-title">
    <div className="user-analytics-heading"><div><p className="eyebrow">Sanitized account telemetry</p><h2 id="user-analytics-title">User analytics</h2><p>Generated {formatDate(data.generatedAt, true)} · source as of {formatDate(data.freshness.asOf, true)}{data.freshness.source ? ` · ${data.freshness.source.replaceAll('_', ' ')}` : ''}</p></div><div className="flex items-center gap-2"><StatusBadge tone={error ? 'danger' : freshnessTone}>{freshnessLabel}</StatusBadge><button className="icon-button" type="button" disabled={isFetching} onClick={onRetry} aria-label="Refresh user analytics"><RefreshCw size={16} /></button></div></div>
    {failure && <Notice tone="danger">{failure.message} Existing analytics may be stale; account mutations are disabled until the API recovers.</Notice>}
    {data.freshness.status !== 'FRESH' && !failure && <Notice>These analytics are {data.freshness.status.toLowerCase()}{data.freshness.scanned !== undefined ? ` after scanning ${data.freshness.scanned.toLocaleString()} trades` : ''}{data.freshness.scanLimit !== undefined ? ` with a ${data.freshness.scanLimit.toLocaleString()}-trade bound` : ''}.</Notice>}

    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Metric label="Trades" value={data.summary.tradeCount.toLocaleString()} detail={`${data.summary.wins} wins · ${data.summary.losses} losses`} icon={<TrendingUp size={18} />} />
      <Metric label="Journal entries" value={data.summary.journalCount.toLocaleString()} icon={<Clock3 size={18} />} />
      <Metric label="Win rate" value={percent(data.summary.winRate)} detail={`${data.summary.breakEven} break-even`} icon={<Target size={18} />} />
      <Metric label="Net P&L" value={formatMoney(data.summary.totalPnl)} detail={data.summary.profitFactor === null ? undefined : `Profit factor ${data.summary.profitFactor.toFixed(2)}`} icon={<BarChart3 size={18} />} />
    </div>

    <Panel title="Performance statistics">
      <dl className="user-analytics-stats">
        <div><dt>Gross profit</dt><dd>{formatMoney(data.summary.grossProfit)}</dd></div>
        <div><dt>Gross loss</dt><dd>{formatMoney(data.summary.grossLoss)}</dd></div>
        <div><dt>Total pips</dt><dd>{data.summary.totalPips.toLocaleString(undefined, { maximumFractionDigits: 1 })}</dd></div>
        <div><dt>Expectancy</dt><dd>{data.summary.expectancy === null ? 'Not available' : formatMoney(data.summary.expectancy)}</dd></div>
        <div><dt>Long trades</dt><dd>{data.summary.longs.toLocaleString()}</dd></div>
        <div><dt>Short trades</dt><dd>{data.summary.shorts.toLocaleString()}</dd></div>
      </dl>
    </Panel>

    <Panel title="Performance over time">
      {data.timeSeries.length === 0 ? <EmptyState title="No time series yet" message="Dated performance buckets will appear when enough trades have been processed." /> : <div className="overflow-x-auto"><table className="user-analytics-table"><thead><tr><th>Period</th><th>Trades</th><th>Win rate</th><th>Net P&amp;L</th></tr></thead><tbody>{data.timeSeries.map((point) => <tr key={point.date}><td>{formatDate(point.date)}</td><td>{point.tradeCount.toLocaleString()}</td><td>{percent(pointWinRate(point.wins, point.losses))}</td><td>{formatMoney(point.totalPnl)}</td></tr>)}</tbody></table></div>}
    </Panel>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><BreakdownTable title="Setup breakdown" rows={data.setups} /><BreakdownTable title="Session breakdown" rows={data.sessions} /></div>

    <Panel title="Recent trades">
      {data.recentTrades.length === 0 ? <EmptyState title="No recent trades" message="The latest sanitized trade summaries will appear here." /> : <div className="overflow-x-auto"><table className="user-analytics-table"><thead><tr><th>Closed</th><th>Symbol</th><th>Side</th><th>Result</th><th>P&amp;L</th></tr></thead><tbody>{data.recentTrades.map((trade) => <tr key={trade.id}><td>{formatDate(trade.closedAt ?? trade.openedAt, true)}</td><td>{trade.symbol ?? 'Unknown'}</td><td>{trade.direction}</td><td>{trade.outcome}</td><td>{trade.pnl === undefined ? '—' : formatMoney(trade.pnl)}</td></tr>)}</tbody></table></div>}
      <CursorPager page={page} canPrevious={canPreviousPage && !isFetching} canNext={Boolean(data.nextPageToken) && !isFetching} onPrevious={onPreviousPage} onNext={onNextPage} />
    </Panel>
  </section>;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, CircleDollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';
import {
  AnalyticsDateRange,
  formatAnalyticsRange,
  type AnalyticsDateRangeValue,
} from '../components/analytics/AnalyticsDateRange';
import {
  AnalyticsSeriesTable,
  PaymentOutcomesTable,
  extractAnalyticsSeries,
  extractPaymentOutcomes,
} from '../components/analytics/AnalyticsTables';
import { useAnalytics } from '../hooks';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Metric,
  Notice,
  PageShell,
  Panel,
  StatusBadge,
  formatDate,
  formatMoney,
} from './_shared';

type AnalyticsErrorCategory =
  | 'session'
  | 'authorization'
  | 'not_found'
  | 'validation'
  | 'rate_limit'
  | 'backend'
  | 'network'
  | 'unknown';

interface AnalyticsErrorPresentation {
  title: string;
  message: string;
}

const ERROR_PRESENTATIONS: Readonly<Record<AnalyticsErrorCategory, AnalyticsErrorPresentation>> = {
  session: {
    title: 'Administrator session expired',
    message: 'Sign in again, then retry this analytics request.',
  },
  authorization: {
    title: 'Analytics access denied',
    message: 'The account is signed in, but the admin API did not authorize analytics access.',
  },
  not_found: {
    title: 'Analytics endpoint was not found',
    message: 'The dashboard and admin API may be running different versions.',
  },
  validation: {
    title: 'Date range rejected',
    message: 'The API rejected this reporting window. Check both dates and try again.',
  },
  rate_limit: {
    title: 'Analytics temporarily rate limited',
    message: 'Too many admin requests were made. Wait briefly before retrying.',
  },
  backend: {
    title: 'Analytics service unavailable',
    message: 'The admin API was reached, but the analytics calculation failed.',
  },
  network: {
    title: 'Admin API cannot be reached',
    message: 'Check the local API proxy or network connection, then retry.',
  },
  unknown: {
    title: 'Analytics request failed',
    message: 'The dashboard could not obtain a verified analytics response.',
  },
};

function DistributionRow({ label, value, total, tone = 'gold' }: {
  label: string;
  value: number;
  total: number;
  tone?: 'gold' | 'green' | 'red';
}) {
  const percentage = total > 0 ? Math.min(100, value / total * 100) : 0;
  return <div>
    <div className="mb-2 flex justify-between text-sm">
      <span className="text-dark-text-muted">{label}</span>
      <strong className="text-white">{value.toLocaleString()} · {percentage.toFixed(1)}%</strong>
    </div>
    <div
      className="h-2 overflow-hidden rounded-full bg-white/5"
      role="img"
      aria-label={`${label}: ${value.toLocaleString()}, ${percentage.toFixed(1)} percent`}
    >
      <span className={`analytics-bar analytics-bar--${tone}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>;
}

function errorStatus(error: Error): number | undefined {
  if (!('status' in error)) return undefined;
  return typeof error.status === 'number' && Number.isFinite(error.status) ? error.status : undefined;
}

function errorCategory(error: Error): AnalyticsErrorCategory {
  if ('category' in error && typeof error.category === 'string' && Object.hasOwn(ERROR_PRESENTATIONS, error.category)) {
    return error.category as AnalyticsErrorCategory;
  }
  const status = errorStatus(error);
  if (status === 401) return 'session';
  if (status === 403) return 'authorization';
  if (status === 404) return 'not_found';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429) return 'rate_limit';
  if (status !== undefined && status >= 500) return 'backend';
  if (error.name === 'TypeError' || /network|fetch|connection/i.test(error.message)) return 'network';
  return 'unknown';
}

function rangeEquals(left: AnalyticsDateRangeValue, right: AnalyticsDateRangeValue): boolean {
  return left.from === right.from && left.to === right.to;
}

function explicitStaleState(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'isStale' in value && value.isStale === true;
}

function snapshotAge(value: string): string {
  const generated = new Date(value).getTime();
  if (!Number.isFinite(generated)) return 'Snapshot age unavailable';
  const ageMinutes = Math.max(0, Math.floor((Date.now() - generated) / 60_000));
  if (ageMinutes < 1) return 'Generated less than a minute ago';
  if (ageMinutes < 60) return `Generated ${ageMinutes} minute${ageMinutes === 1 ? '' : 's'} ago`;
  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 48) return `Generated ${ageHours} hour${ageHours === 1 ? '' : 's'} ago`;
  const ageDays = Math.floor(ageHours / 24);
  return `Generated ${ageDays} day${ageDays === 1 ? '' : 's'} ago`;
}

export function AnalyticsPage() {
  const [requestedRange, setRequestedRange] = useState<AnalyticsDateRangeValue>({ from: '', to: '' });
  const [resolvedRange, setResolvedRange] = useState<AnalyticsDateRangeValue>(requestedRange);
  const query = useAnalytics({
    from: requestedRange.from || undefined,
    to: requestedRange.to || undefined,
  });
  const { data, error, isLoading, isFetching, refresh } = query;
  const previousData = useRef(data);

  useEffect(() => {
    if (data && data !== previousData.current) {
      previousData.current = data;
      setResolvedRange(requestedRange);
    }
  }, [data, requestedRange]);

  const series = useMemo(() => extractAnalyticsSeries(data), [data]);
  const paymentOutcomes = useMemo(() => extractPaymentOutcomes(data), [data]);
  const hasData = Boolean(data && (
    data.users.total > 0
    || data.payments.total > 0
    || data.reports.open > 0
    || data.reports.resolved > 0
    || series
    || paymentOutcomes.some((outcome) => outcome.count > 0)
  ));
  const paymentSuccess = data && data.payments.total > 0
    ? data.payments.settled / data.payments.total * 100
    : null;
  const rangeTransition = Boolean(data && !rangeEquals(requestedRange, resolvedRange));
  const responseFreshness = data?.freshness.status ?? 'UNKNOWN';
  const isStale = Boolean(data && (error || explicitStaleState(query) || responseFreshness === 'STALE'));
  const isPartial = Boolean(data && responseFreshness === 'PARTIAL');
  const freshnessLabel = isStale
    ? 'Stale snapshot'
    : isPartial
      ? 'Partial snapshot'
      : isFetching
        ? 'Refreshing'
        : responseFreshness === 'UNKNOWN'
          ? 'Freshness unknown'
          : 'Current snapshot';
  const errorPresentation = error ? ERROR_PRESENTATIONS[errorCategory(error)] : null;

  const applyRange = (nextRange: AnalyticsDateRangeValue) => {
    if (rangeEquals(nextRange, requestedRange)) {
      void refresh();
      return;
    }
    setRequestedRange(nextRange);
  };

  return <PageShell
    title="Analytics"
    eyebrow="Measured performance"
    description="Verified account, billing, and support aggregates calculated by the admin API."
    actions={data ? <div className="analytics-snapshot-meta">
      <StatusBadge tone={isStale || isPartial || responseFreshness === 'UNKNOWN' ? 'warning' : isFetching ? 'info' : 'success'}>
        {freshnessLabel}
      </StatusBadge>
      <StatusBadge tone="neutral">{snapshotAge(data.generatedAt)}</StatusBadge>
    </div> : undefined}
  >
    <Panel title="Reporting window" meta={<StatusBadge tone="neutral">Dates are inclusive</StatusBadge>}>
      <AnalyticsDateRange value={requestedRange} busy={isFetching} onApply={applyRange} />
    </Panel>

    {errorPresentation && !data && <Panel>
      <ErrorState title={errorPresentation.title} message={errorPresentation.message} onRetry={refresh} />
    </Panel>}

    {errorPresentation && data && <ErrorState
      title={`${errorPresentation.title}; showing a stale snapshot`}
      message={`${errorPresentation.message} Values below are from the last successful window: ${formatAnalyticsRange(resolvedRange)}.`}
      onRetry={refresh}
    />}

    {!error && data && responseFreshness !== 'FRESH' && <Notice tone="info">
      {responseFreshness === 'PARTIAL'
        ? 'The API returned a bounded partial snapshot. Totals derived from sampled collections may be incomplete.'
        : responseFreshness === 'STALE'
          ? 'The API marked this snapshot stale. Refresh before using it for an administrative decision.'
          : 'The API did not provide a verified freshness state for this snapshot.'}
    </Notice>}

    {isLoading || (rangeTransition && !error) ? (
      <LoadingState label={rangeTransition ? 'Applying analytics date range' : 'Calculating analytics'} />
    ) : !data ? null : !hasData ? (
      <Panel><EmptyState
        icon={<TrendingUp />}
        title="No analytics data for this window"
        message={`No users, payments, or reports were recorded for ${formatAnalyticsRange(resolvedRange).toLowerCase()}.`}
      /></Panel>
    ) : <>
      <section className="metric-grid" aria-label="Analytics summary">
        <Metric label="Tracked users" value={data.users.total.toLocaleString()} icon={<Users size={18} />} detail={`${data.users.pro.toLocaleString()} Pro`} />
        <Metric label="Gross revenue" value={data.payments.revenue === null ? 'Unavailable' : formatMoney(data.payments.revenue)} icon={<CircleDollarSign size={18} />} detail="Settled payments" />
        <Metric
          label="Payment success"
          value={paymentSuccess === null ? 'No data' : `${paymentSuccess.toFixed(1)}%`}
          icon={<CreditCard size={18} />}
          detail={paymentSuccess === null ? 'No payments in this window' : `${data.payments.settled.toLocaleString()} of ${data.payments.total.toLocaleString()}`}
        />
        <Metric label="Open reports" value={data.reports.open.toLocaleString()} icon={<Activity size={18} />} detail={`${data.reports.resolved.toLocaleString()} resolved`} />
      </section>

      <Panel title="Snapshot provenance" meta={<StatusBadge tone={isStale || isPartial || responseFreshness === 'UNKNOWN' ? 'warning' : 'success'}>{isStale ? 'Last verified response' : isPartial ? 'Bounded response' : responseFreshness === 'UNKNOWN' ? 'Unverified freshness' : 'Verified response'}</StatusBadge>}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><p className="eyebrow">Reporting window</p><strong className="text-sm text-white">{formatAnalyticsRange(resolvedRange)}</strong></div>
          <div><p className="eyebrow">Generated by API</p><strong className="text-sm text-white">{formatDate(data.generatedAt, true)}</strong></div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Membership mix" className="xl:col-span-2">
          <div className="space-y-5 py-3">
            <DistributionRow label="Pro" value={data.users.pro} total={data.users.total} />
            <DistributionRow label="Grace period" value={data.users.grace} total={data.users.total} tone="green" />
            <DistributionRow label="Free" value={data.users.free} total={data.users.total} />
          </div>
        </Panel>
        <Panel title="Billing outcomes">
          <div className="space-y-5 py-3">
            <DistributionRow label="Settled" value={data.payments.settled} total={data.payments.total} tone="green" />
            <DistributionRow label="Failed" value={data.payments.failed} total={data.payments.total} tone="red" />
            <DistributionRow label="Other" value={Math.max(0, data.payments.total - data.payments.settled - data.payments.failed)} total={data.payments.total} />
          </div>
        </Panel>
      </div>

      {paymentOutcomes.length > 0 && <Panel title="Normalized payment outcomes" meta={<span className="admin-record-count">{paymentOutcomes.length} categories</span>}>
        <PaymentOutcomesTable outcomes={paymentOutcomes} />
      </Panel>}

      {series && <Panel title="Analytics over time" meta={<span className="admin-record-count">{series.rows.length} periods</span>}>
        <AnalyticsSeriesTable series={series} />
      </Panel>}
    </>}
  </PageShell>;
}

export default AnalyticsPage;

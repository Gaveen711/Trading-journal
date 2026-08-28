import { Activity, CircleDollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';
import { useAnalytics } from '../hooks';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Metric,
  PageShell,
  Panel,
  StatusBadge,
  formatDate,
  formatMoney,
} from './_shared';

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
    <div className="h-2 overflow-hidden rounded-full bg-white/5">
      <span className={`analytics-bar analytics-bar--${tone}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>;
}

export function AnalyticsPage() {
  const { data, error, isLoading, refresh } = useAnalytics();
  const hasData = Boolean(data && (
    data.users.total > 0 || data.payments.total > 0 || data.reports.open > 0 || data.reports.resolved > 0
  ));
  const paymentSuccess = data && data.payments.total > 0
    ? data.payments.settled / data.payments.total * 100
    : 0;

  return <PageShell
    title="Analytics"
    eyebrow="Measured performance"
    description="Verified account, billing, and support aggregates calculated by the admin API."
    actions={data ? <StatusBadge tone="success">Generated {formatDate(data.generatedAt, true)}</StatusBadge> : undefined}
  >
    {error && <ErrorState title="Analytics could not refresh" message="The values shown may be stale until the API connection recovers." onRetry={refresh} />}
    {isLoading ? <LoadingState label="Calculating analytics" /> : !data || !hasData ? (
      <Panel><EmptyState icon={<TrendingUp />} title="No analytics data yet" message="Aggregates will populate after users, payments, or reports are recorded." /></Panel>
    ) : <>
      <section className="metric-grid" aria-label="Analytics summary">
        <Metric label="Tracked users" value={data.users.total.toLocaleString()} icon={<Users size={18} />} detail={`${data.users.pro.toLocaleString()} Pro`} />
        <Metric label="Gross revenue" value={data.payments.revenue === null ? 'Unavailable' : formatMoney(data.payments.revenue)} icon={<CircleDollarSign size={18} />} detail="Settled payments" />
        <Metric label="Payment success" value={`${paymentSuccess.toFixed(1)}%`} icon={<CreditCard size={18} />} detail={`${data.payments.settled} of ${data.payments.total}`} />
        <Metric label="Open reports" value={data.reports.open.toLocaleString()} icon={<Activity size={18} />} detail={`${data.reports.resolved} resolved`} />
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
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
    </>}
  </PageShell>;
}

export default AnalyticsPage;

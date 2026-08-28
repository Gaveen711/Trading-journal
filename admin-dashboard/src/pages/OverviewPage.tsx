import { Activity, ArrowUpRight, CreditCard, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOverview } from '../hooks';
import { ErrorState, LoadingState, Metric, PageShell, Panel, StatusBadge, formatDate, type LooseRecord } from './_shared';

export function OverviewPage() {
  const state = useOverview() as LooseRecord;
  const stats = (state.data ?? {}) as LooseRecord;

  return <PageShell title="Overview" eyebrow="Live business health" description="Monitor customer, membership, billing, and support volume from the admin API." actions={<Link className="button button--primary" to="/users">Manage users<ArrowUpRight size={16} /></Link>}>
    {state.error && <ErrorState title="Overview could not refresh" message="Check the admin API connection and try again." onRetry={state.refresh} />}
    {state.isLoading ? <LoadingState label="Loading overview" /> : <>
      <section className="metric-grid" aria-label="Business summary">
        <Metric label="Total users" value={Number(stats.totalUsers ?? 0).toLocaleString()} icon={<Users size={18} />} />
        <Metric label="Active subscriptions" value={Number(stats.activeSubscriptions ?? 0).toLocaleString()} icon={<WalletCards size={18} />} />
        <Metric label="Payments" value={Number(stats.totalPayments ?? 0).toLocaleString()} icon={<CreditCard size={18} />} />
        <Metric label="Open reports" value={Number(stats.openReports ?? 0).toLocaleString()} icon={<Activity size={18} />} />
      </section>
      <Panel title="Snapshot status" meta={<StatusBadge tone="success">API current</StatusBadge>}><p className="text-sm text-dark-text-muted">Generated {formatDate(stats.generatedAt, true)}.</p></Panel>
    </>}
  </PageShell>;
}

export default OverviewPage;

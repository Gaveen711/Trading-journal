import { Activity, ArrowRight, ArrowUpRight, BarChart3, CreditCard, FileChartColumn, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminHealth, useOverview } from '../hooks';
import { ErrorState, LoadingState, Metric, PageShell, Panel, StatusBadge, formatDate, type LooseRecord } from './_shared';

export function OverviewPage() {
  const state = useOverview() as LooseRecord;
  const stats = (state.data ?? {}) as LooseRecord;
  const health = useAdminHealth();
  const healthTone = health.availability === 'AVAILABLE' ? 'success' : health.availability === 'CHECKING' ? 'warning' : 'danger';
  const healthLabel = health.availability === 'AVAILABLE' ? 'API connected' : health.availability === 'CHECKING' ? 'Checking API' : health.availability === 'DEGRADED' ? 'API degraded' : 'API unavailable';

  return <PageShell title="Control center" eyebrow="Admin operations" description="A verified view of customers, access, billing, and support activity." actions={<Link className="button button--primary" to="/users">Manage users<ArrowUpRight size={16} /></Link>}>
    {state.error && <ErrorState title="Overview could not refresh" message="Check the admin API connection and try again." onRetry={state.refresh} />}
    {state.isLoading ? <LoadingState label="Loading overview" /> : <>
      <section className="metric-grid" aria-label="Business summary">
        <Metric label="Total users" value={Number(stats.totalUsers ?? 0).toLocaleString()} icon={<Users size={18} />} />
        <Metric label="Active subscriptions" value={Number(stats.activeSubscriptions ?? 0).toLocaleString()} icon={<WalletCards size={18} />} />
        <Metric label="Payments" value={Number(stats.totalPayments ?? 0).toLocaleString()} icon={<CreditCard size={18} />} />
        <Metric label="Open reports" value={Number(stats.openReports ?? 0).toLocaleString()} icon={<Activity size={18} />} />
      </section>
      <div className="dashboard-grid">
        <Panel title="System posture" meta={<StatusBadge tone={healthTone}>{healthLabel}</StatusBadge>}>
          <div className="admin-overview-status">
            <span className="admin-overview-status__icon" aria-hidden="true"><ShieldCheck /></span>
            <div><strong>{health.availability === 'AVAILABLE' ? 'Administrative actions are available' : 'Administrative actions are protected'}</strong><p>{health.availability === 'AVAILABLE' ? 'The API health check is current. User changes still require a reason and recent authentication.' : 'The dashboard will keep high-impact account actions disabled until the API health check recovers.'}</p></div>
          </div>
          <div className="admin-overview-meta"><span>Overview snapshot</span><strong>{formatDate(stats.generatedAt, true)}</strong></div>
        </Panel>
        <Panel title="Continue work">
          <nav className="admin-overview-actions" aria-label="Common admin tasks">
            <Link to="/users"><Users aria-hidden="true" /><span><strong>Find a customer</strong><small>Open by name, email, or canonical UID</small></span><ArrowRight aria-hidden="true" /></Link>
            <Link to="/analytics"><BarChart3 aria-hidden="true" /><span><strong>Review analytics</strong><small>Check current, partial, or stale reporting windows</small></span><ArrowRight aria-hidden="true" /></Link>
            <Link to="/reports"><FileChartColumn aria-hidden="true" /><span><strong>Resolve reports</strong><small>Review outstanding customer support work</small></span><ArrowRight aria-hidden="true" /></Link>
          </nav>
        </Panel>
      </div>
    </>}
  </PageShell>;
}

export default OverviewPage;

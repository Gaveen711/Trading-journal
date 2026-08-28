import { useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, CreditCard, Mail, MapPin, ShieldAlert, Trash2, UserRound, WalletCards } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePayments, useUser, useUsers } from '../hooks';
import { EmptyState, ErrorState, LoadingState, Metric, Notice, PageShell, Panel, ReasonDialog, StatusBadge, formatDate, formatMoney, type LooseRecord } from './_shared';

export function UserDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const state = useUser(id) as LooseRecord;
  const actions = useUsers({ pageSize: 1 }) as LooseRecord;
  const paymentState = usePayments({ userId: id, pageSize: 10 }) as LooseRecord;
  const user = (state.user ?? state.data ?? null) as LooseRecord | null;
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState(false);
  const pending = Boolean(actions.isPending ?? actions.pending);

  if (state.isLoading) return <PageShell title="User detail"><LoadingState label="Loading user profile" /></PageShell>;
  if (state.error || !user) return <PageShell title="User detail"><ErrorState title="User unavailable" message="The account may have been deleted, or the admin API denied access." onRetry={state.refresh} /><Link className="button mt-4" to="/users"><ArrowLeft size={16} />Back to users</Link></PageShell>;

  const name = String(user.displayName ?? user.name ?? [user.firstName, user.lastName].filter(Boolean).join(' ') ?? '').trim() || 'Unnamed user';
  const payments = ((paymentState.payments ?? paymentState.data ?? []) as LooseRecord[]).filter((payment) => payment.userId === user.id || payment.userId === user.uid);
  const paid = payments.filter((payment) => payment.status === 'SUCCESS').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const update = async (updates: LooseRecord, success: string) => {
    setNotice('');
    try { await actions.updateUser({ userId: String(user.id ?? id), updates, reason: success }); await state.refresh?.(); setNotice(success); }
    catch { setNotice('The account update failed. No changes were confirmed.'); }
  };
  const remove = async (reason: string) => {
    try { await actions.deleteUser({ userId: String(user.id ?? id), reason }); navigate('/users', { replace: true }); }
    catch { setNotice('The account could not be deleted.'); setDeleting(false); }
  };
  return <PageShell title={name} eyebrow="Customer record" description={String(user.uid ?? user.id ?? id)} actions={<>
    <Link className="button" to="/users"><ArrowLeft size={16} />Users</Link>
    <button className="button" disabled={pending} onClick={() => void update({ status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' }, `Account ${user.status === 'SUSPENDED' ? 'activated' : 'suspended'}.`)}><ShieldAlert size={16} />{user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</button>
    <button className="button button--danger" disabled={pending} onClick={() => setDeleting(true)}><Trash2 size={16} />Delete</button>
  </>}>
    {notice && <Notice tone={notice.includes('failed') || notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Metric label="Plan" value={String(user.plan ?? 'FREE')} icon={<BadgeCheck size={18} />} />
      <Metric label="Status" value={String(user.status ?? 'ACTIVE')} icon={<ShieldAlert size={18} />} />
      <Metric label="Trades" value={Number(user.totalTradesLogged ?? user.tradeCount ?? 0).toLocaleString()} icon={<WalletCards size={18} />} />
      <Metric label="Revenue" value={formatMoney(paid)} icon={<CreditCard size={18} />} />
    </section>

    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Panel className="xl:col-span-2" title="Account details" meta={<StatusBadge tone="success">Live</StatusBadge>}>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[["Email", user.email, <Mail size={17} />], ["Country", user.country, <MapPin size={17} />], ["Joined", formatDate(user.createdAt ?? user.joinedDate, true), <CalendarDays size={17} />], ["Last login", formatDate(user.lastLogin, true), <UserRound size={17} />]].map(([label, value, icon]) => <div className="flex gap-3 rounded-xl border border-dark-border bg-white/5 p-4" key={String(label)}><span className="text-primary-500">{icon}</span><div><dt className="eyebrow">{label}</dt><dd className="mt-1 break-all text-sm text-white">{String(value || 'Not recorded')}</dd></div></div>)}
        </dl>
      </Panel>
      <Panel title="Access controls">
        <div className="space-y-4">
          <label className="field"><span>Plan</span><select value={String(user.plan ?? 'FREE')} disabled={pending} onChange={(event) => void update({ plan: event.target.value }, `Plan changed to ${event.target.value}.`)}><option value="FREE">Free</option><option value="PRO">Pro</option></select></label>
          <label className="field"><span>Account status</span><select value={String(user.status ?? 'ACTIVE')} disabled={pending} onChange={(event) => void update({ status: event.target.value }, `Status changed to ${event.target.value}.`)}><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></label>
        </div>
      </Panel>
      <Panel className="xl:col-span-2" title="Payment history">
        {paymentState.isLoading ? <LoadingState label="Loading payments" /> : payments.length === 0 ? <EmptyState icon={<CreditCard />} title="No payment records" message="Verified billing events for this customer will appear here." /> : <div className="space-y-2">{payments.slice(0, 10).map((payment) => <div className="activity-row" key={String(payment.id)}><span className="activity-row__icon"><CreditCard size={15} /></span><div className="flex-1"><strong>{String(payment.invoiceId ?? payment.stripeInvoiceId ?? payment.id)}</strong><small>{formatDate(payment.date ?? payment.createdAt, true)}</small></div><b>{formatMoney(payment.amount, String(payment.currency ?? 'USD'))}</b><StatusBadge tone={payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'danger' : 'warning'}>{String(payment.status ?? 'UNKNOWN')}</StatusBadge></div>)}</div>}
      </Panel>
      <Panel title="Login history">
        {Array.isArray(user.loginHistory) && user.loginHistory.length ? <div className="space-y-2">{(user.loginHistory as LooseRecord[]).slice(0, 8).map((entry, index) => <div className="rounded-xl border border-dark-border bg-white/5 p-3" key={`${String(entry.date)}-${index}`}><strong className="block text-sm text-white">{String(entry.device ?? 'Unknown device')}</strong><small className="block text-dark-text-muted">{formatDate(entry.date, true)}</small><small className="font-mono text-dark-text-muted">{String(entry.ip ?? 'IP not recorded')}</small></div>)}</div> : <EmptyState icon={<UserRound />} title="No login history" message="Recorded device sessions will appear here." />}
      </Panel>
    </div>
    <ReasonDialog open={deleting} title={`Delete ${name}?`} description="This permanently removes the account record and can disconnect related journal and billing data." confirmLabel="Delete account" pending={pending} onClose={() => setDeleting(false)} onConfirm={remove} />
  </PageShell>;
}

export default UserDetailPage;

import { useDeferredValue, useState } from 'react';
import { BadgeCheck, Eye, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUsers } from '../hooks';
import { CursorPager, EmptyState, ErrorState, FilterSelect, LoadingState, Metric, Notice, PageShell, ReasonDialog, SearchField, StatusBadge, TableFrame, formatDate, type LooseRecord } from './_shared';

type UserRecord = LooseRecord & { id: string; email?: string; plan?: string; status?: string };
const displayName = (user: UserRecord) => String(user.displayName ?? user.name ?? [user.firstName, user.lastName].filter(Boolean).join(' ') ?? '').trim() || 'Unnamed user';

export function UsersPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [plan, setPlan] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const state = useUsers({ search: deferredSearch || undefined, plan: plan === 'ALL' ? undefined : plan as 'FREE' | 'PRO', status: status === 'ALL' ? undefined : status as 'ACTIVE' | 'SUSPENDED', pageSize: 12 }) as LooseRecord;
  const users = (state.users ?? state.data ?? []) as UserRecord[];
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const pending = Boolean(state.isPending ?? state.pending);

  const filtered = users.filter((user) => {
    const text = [displayName(user), user.email, user.id, user.uid, user.country].filter(Boolean).join(' ').toLowerCase();
    return (!deferredSearch || text.includes(deferredSearch)) && (plan === 'ALL' || user.plan === plan) && (status === 'ALL' || user.status === status);
  });

  const update = async (user: UserRecord, updates: LooseRecord, success: string) => {
    setNotice('');
    try { await state.updateUser({ userId: user.id, updates, reason: success }); setNotice(success); }
    catch { setNotice('The user update failed. Verify your permissions and try again.'); }
  };
  const remove = async (reason: string) => {
    if (!deleteTarget) return;
    try { await (state.deleteUser ?? state.remove)?.({ userId: deleteTarget.id, reason }); setNotice(`${displayName(deleteTarget)} was deleted.`); setDeleteTarget(null); }
    catch { setNotice('The user could not be deleted. No records were changed.'); }
  };

  return <PageShell title="Users" eyebrow="Customer directory" description="Search accounts, manage access, and record sensitive actions with an audit reason." actions={<StatusBadge tone={state.error ? 'danger' : 'success'}>{state.error ? 'Connection issue' : 'Live directory'}</StatusBadge>}>
    {state.error && <ErrorState title="Users could not refresh" message="The existing list may be stale. Retry before making changes." onRetry={state.refresh} />}
    {notice && <Notice tone={notice.includes('failed') || notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Metric label="Total users" value={state.isLoading ? '—' : users.length.toLocaleString()} icon={<Users size={18} />} />
      <Metric label="Pro members" value={state.isLoading ? '—' : users.filter((user) => user.plan === 'PRO').length.toLocaleString()} icon={<BadgeCheck size={18} />} />
      <Metric label="Suspended" value={state.isLoading ? '—' : users.filter((user) => user.status === 'SUSPENDED').length.toLocaleString()} icon={<ShieldAlert size={18} />} />
    </section>

    <section className="panel my-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField value={search} onChange={setSearch} label="Search users" placeholder="Search name, email, UID, or country" />
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Plan" value={plan} onChange={setPlan}><option value="ALL">All plans</option><option value="FREE">Free</option><option value="PRO">Pro</option></FilterSelect>
          <FilterSelect label="Status" value={status} onChange={setStatus}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></FilterSelect>
        </div>
      </div>
    </section>

    <TableFrame title="User directory" count={filtered.length}>
      {state.isLoading ? <LoadingState label="Loading users" /> : filtered.length === 0 ? <EmptyState icon={<Users />} title="No matching users" message={users.length ? 'Clear or adjust the current filters.' : 'New customer accounts will appear here.'} action={users.length ? <button className="button" onClick={() => { setSearch(''); setPlan('ALL'); setStatus('ALL'); }}>Clear filters</button> : undefined} /> : <>
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b border-dark-border text-xs text-dark-text-muted"><th className="p-4">User</th><th className="p-4">Plan</th><th className="p-4">Usage</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-dark-border">{filtered.map((user) => <tr key={user.id} className="hover:bg-white/5">
            <td className="p-4"><button className="flex min-h-11 items-center gap-3 text-left" onClick={() => navigate(`/users/${user.id}`)}><span className="admin-card__avatar">{displayName(user).charAt(0).toUpperCase()}</span><span><strong className="block text-white">{displayName(user)}</strong><small className="block text-dark-text-muted">{user.email ?? 'No email'}</small><small className="font-mono text-[10px] text-primary-400">{String(user.uid ?? user.id)}</small></span></button></td>
            <td className="p-4"><StatusBadge tone={user.plan === 'PRO' ? 'warning' : 'neutral'}>{user.plan ?? 'FREE'}</StatusBadge></td>
            <td className="p-4 text-dark-text-muted">{Number(user.totalTradesLogged ?? user.tradeCount ?? 0)} trades · {Number(user.totalJournalsLogged ?? user.journalCount ?? 0)} journals</td>
            <td className="p-4 text-dark-text-muted">{formatDate(user.createdAt ?? user.joinedDate)}</td>
            <td className="p-4"><StatusBadge tone={user.status === 'SUSPENDED' ? 'danger' : 'success'}>{user.status ?? 'ACTIVE'}</StatusBadge></td>
            <td className="p-4"><div className="flex justify-end gap-1">
              <button className="icon-button" onClick={() => navigate(`/users/${user.id}`)} aria-label={`View ${displayName(user)}`}><Eye size={16} /></button>
              <button className="icon-button" disabled={pending} onClick={() => void update(user, { status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' }, `${displayName(user)} is now ${user.status === 'SUSPENDED' ? 'active' : 'suspended'}.`)} aria-label={`${user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'} ${displayName(user)}`}><ShieldAlert size={16} /></button>
              <button className="icon-button text-red-400" disabled={pending} onClick={() => setDeleteTarget(user)} aria-label={`Delete ${displayName(user)}`}><Trash2 size={16} /></button>
            </div></td>
          </tr>)}</tbody></table></div><CursorPager page={Number(state.page ?? 1)} canPrevious={Boolean(state.canPreviousPage)} canNext={Boolean(state.canNextPage)} onPrevious={state.previousPage} onNext={state.nextPage} />
      </>}
    </TableFrame>
    <ReasonDialog open={Boolean(deleteTarget)} title={`Delete ${deleteTarget ? displayName(deleteTarget) : 'user'}?`} description="This removes the admin-visible account record and may affect linked data. This action cannot be undone from this screen." confirmLabel="Delete user" pending={pending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
  </PageShell>;
}

export default UsersPage;

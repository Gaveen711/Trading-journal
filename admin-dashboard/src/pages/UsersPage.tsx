import { useDeferredValue, useEffect, useState } from 'react';
import { BadgeCheck, Eye, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { canonicalUserId, describeAdminError, displayUserName } from '../components/users/adminUserUi';
import type { User, UserPlan, UserStatus, UserUpdate } from '../domain/models';
import { useAdminHealth, useUsers } from '../hooks';
import { CursorPager, EmptyState, ErrorState, FilterSelect, LoadingState, Metric, Notice, PageShell, ReasonDialog, SearchField, StatusBadge, TableFrame, formatDate } from './_shared';

type DirectoryAction = {
  kind: 'update';
  user: User;
  updates: UserUpdate;
  title: string;
  description: string;
  success: string;
} | {
  kind: 'delete';
  user: User;
  title: string;
  description: string;
  success: string;
};

interface PageNotice {
  tone: 'danger' | 'success';
  message: string;
}

export function UsersPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const deferredSearch = useDeferredValue(search.trim());
  const [plan, setPlan] = useState<UserPlan | 'ALL'>('ALL');
  const [status, setStatus] = useState<UserStatus | 'ALL'>('ALL');
  const state = useUsers({
    search: deferredSearch || undefined,
    plan: plan === 'ALL' ? undefined : plan,
    status: status === 'ALL' ? undefined : status,
    pageSize: 12,
  });
  const health = useAdminHealth();
  const users = state.users;
  const [notice, setNotice] = useState<PageNotice | null>(null);
  const [pendingAction, setPendingAction] = useState<DirectoryAction | null>(null);
  const degraded = Boolean(state.error || state.mutationError || health.isDegraded || health.availability === 'UNAVAILABLE');
  const apiBlocksMutation = !health.canMutate || Boolean(state.error || state.mutationError);
  const mutationsDisabled = state.isPending || state.isFetching || apiBlocksMutation;
  const directoryError = state.error ? describeAdminError(state.error, 'directory request') : null;

  useEffect(() => {
    if (apiBlocksMutation) setPendingAction(null);
  }, [apiBlocksMutation]);

  const openUser = (user: User) => navigate(`/users/${encodeURIComponent(canonicalUserId(user))}`);

  const reviewStatusChange = (user: User) => {
    state.resetMutation();
    setNotice(null);
    const nextStatus: UserStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setPendingAction({
      kind: 'update',
      user,
      updates: { status: nextStatus },
      title: `${nextStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} ${displayUserName(user)}?`,
      description: `This high-impact action changes account access to ${nextStatus}. Enter the operator reason that will be written to the audit log. Backend authorization and reauthentication policy still apply.`,
      success: `${displayUserName(user)} is now ${nextStatus.toLowerCase()}.`,
    });
  };

  const reviewDelete = (user: User) => {
    state.resetMutation();
    setNotice(null);
    setPendingAction({
      kind: 'delete',
      user,
      title: `Request deletion for ${displayUserName(user)}?`,
      description: 'This recoverable request immediately suspends access and revokes API keys. Customer records remain retained until a separate reviewed deletion workflow completes. Enter the incident, policy, or customer-request reason for the audit log.',
      success: `${displayUserName(user)} was suspended and queued for reviewed deletion.`,
    });
  };

  const confirmAction = async (reason: string) => {
    if (!pendingAction || apiBlocksMutation) return;
    try {
      const userId = canonicalUserId(pendingAction.user);
      if (pendingAction.kind === 'delete') await state.deleteUser({ userId, reason });
      else await state.updateUser({ userId, updates: pendingAction.updates, reason });
      setNotice({ tone: 'success', message: pendingAction.success });
      setPendingAction(null);
    } catch (error) {
      const failure = describeAdminError(error, pendingAction.kind === 'delete' ? 'account deletion' : 'account update');
      setNotice({ tone: 'danger', message: `${failure.title}: ${failure.message}` });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPlan('ALL');
    setStatus('ALL');
    state.resetPagination();
  };

  return <PageShell
    title="Users"
    eyebrow="Customer directory"
    description="Server-side account search and access management using canonical Firebase UIDs."
    actions={<StatusBadge tone={degraded ? 'danger' : state.isFetching || health.availability === 'CHECKING' ? 'warning' : 'success'}>{degraded ? 'API degraded' : health.availability === 'CHECKING' ? 'Checking API' : state.isFetching ? 'Refreshing' : 'Live directory'}</StatusBadge>}
  >
    {directoryError && <ErrorState title={directoryError.title} message={`${directoryError.message} High-impact actions are disabled while the directory is degraded.`} onRetry={() => void state.refresh()} />}
    {health.error && !directoryError && <Notice tone="danger">{describeAdminError(health.error, 'health check').message} Account mutations remain disabled.</Notice>}
    {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}

    <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Visible directory summary">
      <Metric label="Visible accounts" value={state.isLoading ? '—' : users.length.toLocaleString()} detail="Current server page" icon={<Users size={18} />} />
      <Metric label="Visible Pro or Grace" value={state.isLoading ? '—' : users.filter((user) => user.plan === 'PRO' || user.plan === 'GRACE').length.toLocaleString()} detail="Current server page" icon={<BadgeCheck size={18} />} />
      <Metric label="Visible suspended" value={state.isLoading ? '—' : users.filter((user) => user.status === 'SUSPENDED').length.toLocaleString()} detail="Current server page" icon={<ShieldAlert size={18} />} />
    </section>

    <section className="panel my-4" aria-label="Directory filters">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField value={search} onChange={setSearch} label="Search users" placeholder="Search name, email, or canonical UID" />
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Plan" value={plan} onChange={(value) => setPlan(value as UserPlan | 'ALL')}><option value="ALL">All plans</option><option value="FREE">Free</option><option value="PRO">Pro</option><option value="GRACE">Grace</option></FilterSelect>
          <FilterSelect label="Status" value={status} onChange={(value) => setStatus(value as UserStatus | 'ALL')}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></FilterSelect>
        </div>
      </div>
    </section>

    <TableFrame title="User directory" count={users.length}>
      {state.isLoading
        ? <LoadingState label="Loading users" />
        : directoryError && users.length === 0
          ? <EmptyState icon={<Users />} title="Directory unavailable" message="No user page is cached. Retry the admin API before relying on this view." />
          : users.length === 0
            ? <><EmptyState icon={<Users />} title="No matching users on this scan page" message={deferredSearch || plan !== 'ALL' || status !== 'ALL' ? (state.canNextPage ? 'No match was found in this bounded server scan. Continue to the next scan page or clear the filters.' : 'No server-side results matched the current filters.') : 'New customer accounts will appear here.'} action={deferredSearch || plan !== 'ALL' || status !== 'ALL' ? <button className="button" type="button" onClick={clearFilters}>Clear filters</button> : undefined} /><CursorPager page={state.page} canPrevious={state.canPreviousPage && !state.isFetching} canNext={state.canNextPage && !state.isFetching} onPrevious={state.previousPage} onNext={state.nextPage} /></>
            : <>
              <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b border-dark-border text-xs text-dark-text-muted"><th className="p-4">User</th><th className="p-4">Plan</th><th className="p-4">Usage</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-dark-border">{users.map((user) => {
                  const name = displayUserName(user);
                  const uid = canonicalUserId(user);
                  return <tr key={uid} className="hover:bg-white/5">
                    <td className="p-4"><button className="flex min-h-11 items-center gap-3 text-left" type="button" onClick={() => openUser(user)}><span className="admin-card__avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><span><strong className="block text-white">{name}</strong><small className="block text-dark-text-muted">{user.email ?? 'No email'}</small><small className="font-mono text-[10px] text-primary-400">{uid}</small></span></button></td>
                    <td className="p-4"><StatusBadge tone={user.plan === 'FREE' ? 'neutral' : 'warning'}>{user.plan}</StatusBadge></td>
                    <td className="p-4 text-dark-text-muted">{(user.totalTradesLogged ?? user.tradeCount ?? 0).toLocaleString()} trades · {(user.totalJournalsLogged ?? user.journalCount ?? 0).toLocaleString()} journals</td>
                    <td className="p-4 text-dark-text-muted">{formatDate(user.createdAt ?? user.joinedDate)}</td>
                    <td className="p-4"><div className="flex flex-wrap gap-1"><StatusBadge tone={user.status === 'SUSPENDED' ? 'danger' : 'success'}>{user.status}</StatusBadge>{user.deletionState === 'PENDING' && <StatusBadge tone="warning">Deletion pending</StatusBadge>}</div></td>
                    <td className="p-4"><div className="flex justify-end gap-1">
                      <button className="icon-button" type="button" onClick={() => openUser(user)} aria-label={`View ${name}`}><Eye size={16} /></button>
                      <button className="icon-button" type="button" disabled={mutationsDisabled} title={mutationsDisabled ? 'Unavailable until the admin API health check is available' : undefined} onClick={() => reviewStatusChange(user)} aria-label={`${user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'} ${name}`}><ShieldAlert size={16} /></button>
                      <button className="icon-button text-red-400" type="button" disabled={mutationsDisabled} title={mutationsDisabled ? 'Unavailable until the admin API health check is available' : 'Suspend access and request reviewed deletion'} onClick={() => reviewDelete(user)} aria-label={`Request deletion for ${name}`}><Trash2 size={16} /></button>
                    </div></td>
                  </tr>;
                })}</tbody></table></div>
              <CursorPager page={state.page} canPrevious={state.canPreviousPage && !state.isFetching} canNext={state.canNextPage && !state.isFetching} onPrevious={state.previousPage} onNext={state.nextPage} />
            </>}
    </TableFrame>

    <ReasonDialog open={Boolean(pendingAction)} title={pendingAction?.title ?? 'Confirm account action'} description={pendingAction?.description ?? ''} confirmLabel={pendingAction?.kind === 'delete' ? 'Request deletion' : 'Confirm access change'} pending={state.isPending} onClose={() => setPendingAction(null)} onConfirm={confirmAction} />
  </PageShell>;
}

export default UsersPage;

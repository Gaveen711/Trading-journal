import { useDeferredValue, useEffect, useState } from 'react';
import { BadgeCheck, Eye, Search, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, DataTable, SelectField, TextField, type DataColumn } from '../components';
import { canonicalUserId, describeAdminError, displayUserName } from '../components/users/adminUserUi';
import type { User, UserPlan, UserStatus, UserUpdate } from '../domain/models';
import { useAdminHealth, useUsers } from '../hooks';
import { CursorPager, EmptyState, ErrorState, LoadingState, Metric, Notice, PageShell, Panel, ReasonDialog, StatusBadge, TableFrame, formatDate } from './_shared';

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

  const columns: DataColumn<User>[] = [
    {
      key: 'user',
      header: 'User',
      width: '34%',
      cell: (user) => {
        const name = displayUserName(user);
        const uid = canonicalUserId(user);
        return <button className="admin-user-cell" type="button" onClick={() => openUser(user)}>
          <span className="admin-card__avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          <span className="admin-user-cell__copy"><strong>{name}</strong><small>{user.email ?? 'No email address'}</small><code>{uid}</code></span>
        </button>;
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      cell: (user) => <StatusBadge tone={user.plan === 'FREE' ? 'neutral' : 'warning'}>{user.plan}</StatusBadge>,
    },
    {
      key: 'usage',
      header: 'Usage',
      hideBelow: 'md',
      cell: (user) => <span className="admin-table__muted">{(user.totalTradesLogged ?? user.tradeCount ?? 0).toLocaleString()} trades · {(user.totalJournalsLogged ?? user.journalCount ?? 0).toLocaleString()} journals</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      hideBelow: 'lg',
      cell: (user) => <span className="admin-table__muted">{formatDate(user.createdAt ?? user.joinedDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => <span className="admin-status-stack"><StatusBadge tone={user.status === 'SUSPENDED' ? 'danger' : 'success'}>{user.status}</StatusBadge>{user.deletionState === 'PENDING' && <StatusBadge tone="warning">Deletion pending</StatusBadge>}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      cell: (user) => {
        const name = displayUserName(user);
        return <span className="admin-row-actions">
          <Button size="icon" variant="ghost" onClick={() => openUser(user)} aria-label={`View ${name}`}><Eye aria-hidden="true" /></Button>
          <Button size="icon" variant="ghost" disabled={mutationsDisabled} title={mutationsDisabled ? 'Unavailable until the admin API health check is available' : undefined} onClick={() => reviewStatusChange(user)} aria-label={`${user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'} ${name}`}><ShieldAlert aria-hidden="true" /></Button>
          <Button size="icon" variant="danger" disabled={mutationsDisabled} title={mutationsDisabled ? 'Unavailable until the admin API health check is available' : 'Suspend access and request reviewed deletion'} onClick={() => reviewDelete(user)} aria-label={`Request deletion for ${name}`}><Trash2 aria-hidden="true" /></Button>
        </span>;
      },
    },
  ];

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

    <Panel
      title="Find an account"
      meta={<Button variant="ghost" size="sm" disabled={!search && plan === 'ALL' && status === 'ALL'} onClick={clearFilters}>Clear filters</Button>}
    >
      <div className="admin-directory-filter-grid">
        <TextField label="Search by name, email, or UID" leadingIcon={<Search />} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Paste a canonical Firebase UID or search a customer" />
        <SelectField label="Plan" value={plan} onChange={(event) => setPlan(event.target.value as UserPlan | 'ALL')} options={[{ value: 'ALL', label: 'All plans' }, { value: 'FREE', label: 'Free' }, { value: 'PRO', label: 'Pro' }, { value: 'GRACE', label: 'Grace' }]} />
        <SelectField label="Account status" value={status} onChange={(event) => setStatus(event.target.value as UserStatus | 'ALL')} options={[{ value: 'ALL', label: 'All statuses' }, { value: 'ACTIVE', label: 'Active' }, { value: 'SUSPENDED', label: 'Suspended' }]} />
      </div>
    </Panel>

    <TableFrame title="User directory" count={users.length}>
      {state.isLoading
        ? <LoadingState label="Loading users" />
        : directoryError && users.length === 0
          ? <EmptyState icon={<Users />} title="Directory unavailable" message="No user page is cached. Retry the admin API before relying on this view." />
          : users.length === 0
            ? <><EmptyState icon={<Users />} title="No matching users on this scan page" message={deferredSearch || plan !== 'ALL' || status !== 'ALL' ? (state.canNextPage ? 'No match was found in this bounded server scan. Continue to the next scan page or clear the filters.' : 'No server-side results matched the current filters.') : 'New customer accounts will appear here.'} action={deferredSearch || plan !== 'ALL' || status !== 'ALL' ? <Button onClick={clearFilters}>Clear filters</Button> : undefined} /><CursorPager page={state.page} canPrevious={state.canPreviousPage && !state.isFetching} canNext={state.canNextPage && !state.isFetching} onPrevious={state.previousPage} onNext={state.nextPage} /></>
            : <>
              <DataTable columns={columns} rows={users} getRowKey={(user) => canonicalUserId(user)} caption="User directory" />
              <CursorPager page={state.page} canPrevious={state.canPreviousPage && !state.isFetching} canNext={state.canNextPage && !state.isFetching} onPrevious={state.previousPage} onNext={state.nextPage} />
            </>}
    </TableFrame>

    <ReasonDialog open={Boolean(pendingAction)} title={pendingAction?.title ?? 'Confirm account action'} description={pendingAction?.description ?? ''} confirmLabel={pendingAction?.kind === 'delete' ? 'Request deletion' : 'Confirm access change'} pending={state.isPending} onClose={() => setPendingAction(null)} onConfirm={confirmAction} />
  </PageShell>;
}

export default UsersPage;

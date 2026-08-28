import { useDeferredValue, useState } from 'react';
import { Bug, CheckCircle2, Clock, LifeBuoy, Lightbulb, SearchX, Trash2 } from 'lucide-react';
import { useReports } from '../hooks';
import { CursorPager, EmptyState, ErrorState, FilterSelect, LoadingState, Notice, PageShell, ReasonDialog, SearchField, StatusBadge, formatDate, type LooseRecord } from './_shared';

type ReportRecord = LooseRecord & { id: string; type?: string; status?: string };
const typeTabs = [{ value: 'ALL', label: 'All', icon: LifeBuoy }, { value: 'BUG', label: 'Bugs', icon: Bug }, { value: 'FEATURE_REQUEST', label: 'Features', icon: Lightbulb }, { value: 'SUPPORT', label: 'Support', icon: LifeBuoy }];

export function ReportsPage() {
  const [type, setType] = useState('ALL');
  const [status, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const state = useReports({ type: type === 'ALL' ? undefined : type as 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT', status: status === 'ALL' ? undefined : status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED', pageSize: 10 }) as LooseRecord;
  const reports = (state.reports ?? state.data ?? []) as ReportRecord[];
  const [deleteTarget, setDeleteTarget] = useState<ReportRecord | null>(null);
  const [notice, setNotice] = useState('');
  const pending = Boolean(state.isPending ?? state.pending);
  const filtered = [...reports].filter((report) => {
    const text = [report.subject, report.message, report.userName, report.userEmail, report.id].filter(Boolean).join(' ').toLowerCase();
    return (type === 'ALL' || report.type === type) && (status === 'ALL' || report.status === status) && (!deferredSearch || text.includes(deferredSearch));
  }).sort((a, b) => new Date(String(b.createdAt ?? 0)).getTime() - new Date(String(a.createdAt ?? 0)).getTime());

  const setStatus = async (report: ReportRecord, nextStatus: string) => {
    setNotice('');
    try { await state.updateStatus({ reportId: report.id, status: nextStatus, reason: `Report status changed from ${String(report.status ?? 'OPEN')} to ${nextStatus}.` }); setNotice(`Report marked ${nextStatus.toLowerCase().replaceAll('_', ' ')}.`); }
    catch { setNotice('The report status could not be updated.'); }
  };
  const remove = async (reason: string) => {
    if (!deleteTarget) return;
    try { await (state.deleteReport ?? state.remove)?.({ reportId: deleteTarget.id, reason }); setNotice('Report deleted from the support queue.'); setDeleteTarget(null); }
    catch { setNotice('The report could not be deleted.'); }
  };

  return <PageShell title="Reports" eyebrow="Customer feedback" description="Triage bugs, requests, and support cases with a visible status trail." actions={<StatusBadge tone={state.error ? 'danger' : 'success'}>{state.error ? 'Connection issue' : `${reports.filter((report) => report.status === 'OPEN').length} open`}</StatusBadge>}>
    {state.error && <ErrorState title="Reports could not refresh" message="Retry before changing the support queue." onRetry={state.refresh} />}
    {notice && <Notice tone={notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Report type">{typeTabs.map(({ value, label, icon: Icon }) => <button key={value} role="tab" aria-selected={type === value} className={`button ${type === value ? 'button--primary' : ''}`} onClick={() => setType(value)}><Icon size={16} />{label}<StatusBadge>{reports.filter((report) => value === 'ALL' || report.type === value).length}</StatusBadge></button>)}</div>
    <section className="panel mb-4"><div className="flex flex-col gap-3 lg:flex-row"><SearchField value={search} onChange={setSearch} label="Search reports" placeholder="Search subject, message, customer, or report ID" /><FilterSelect label="Report status" value={status} onChange={setStatusFilter}><option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></FilterSelect></div></section>
    {state.isLoading ? <LoadingState label="Loading reports" /> : filtered.length === 0 ? <section className="panel"><EmptyState icon={reports.length ? <SearchX /> : <LifeBuoy />} title={reports.length ? 'No matching reports' : 'Support queue is empty'} message={reports.length ? 'Clear or adjust the current filters.' : 'New customer submissions will appear here automatically.'} action={reports.length ? <button className="button" onClick={() => { setSearch(''); setType('ALL'); setStatusFilter('ALL'); }}>Clear filters</button> : undefined} /></section> : <section className="space-y-3">
      {filtered.map((report) => <article className="panel" key={report.id}>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><StatusBadge tone={report.status === 'RESOLVED' ? 'success' : report.status === 'OPEN' ? 'danger' : 'warning'}>{String(report.status ?? 'OPEN').replaceAll('_', ' ')}</StatusBadge><StatusBadge tone="info">{String(report.type ?? 'SUPPORT').replaceAll('_', ' ')}</StatusBadge><span className="text-xs text-dark-text-muted">{formatDate(report.createdAt, true)}</span></div><h2 className="font-bold text-white">{String(report.subject ?? 'Untitled report')}</h2><p className="mt-1 text-xs text-dark-text-muted">{String(report.userName ?? 'Unnamed user')} · {String(report.userEmail ?? report.userId ?? 'No user reference')}</p></div>
          <div className="flex items-center gap-1" aria-label="Report actions"><button className="icon-button" disabled={pending} aria-label="Mark in progress" aria-pressed={report.status === 'IN_PROGRESS'} onClick={() => void setStatus(report, 'IN_PROGRESS')}><Clock size={16} /></button><button className="icon-button" disabled={pending} aria-label="Mark resolved" aria-pressed={report.status === 'RESOLVED'} onClick={() => void setStatus(report, 'RESOLVED')}><CheckCircle2 size={16} /></button><button className="icon-button text-red-400" disabled={pending} aria-label="Delete report" onClick={() => setDeleteTarget(report)}><Trash2 size={16} /></button></div></div>
        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-dark-border bg-white/5 p-4 text-sm leading-relaxed text-dark-text-muted">{String(report.message ?? 'No message was included.')}</p>
      </article>)}
      <div className="rounded-2xl border border-dark-border bg-dark-card"><CursorPager page={Number(state.page ?? 1)} canPrevious={Boolean(state.canPreviousPage)} canNext={Boolean(state.canNextPage)} onPrevious={state.previousPage} onNext={state.nextPage} /></div>
    </section>}
    <ReasonDialog open={Boolean(deleteTarget)} title="Delete this report?" description="The support history will no longer be available from this workspace. Resolve reports instead when the audit trail should remain." confirmLabel="Delete report" pending={pending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
  </PageShell>;
}

export default ReportsPage;

import { useDeferredValue, useState } from 'react';
import { Calendar, Megaphone, Plus, SearchX, Trash2 } from 'lucide-react';
import { useAnnouncements } from '../hooks';
import { CursorPager, EmptyState, ErrorState, FilterSelect, LoadingState, Notice, PageShell, ReasonDialog, SearchField, StatusBadge, formatDate, type LooseRecord } from './_shared';

type AnnouncementRecord = LooseRecord & { id: string; active?: boolean; target?: string };

export function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('ALL');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [audience, setAudience] = useState('ALL');
  const state = useAnnouncements({ target: audience === 'ALL' ? undefined : audience as 'PRO_ONLY' | 'FREE_ONLY', pageSize: 8 }) as LooseRecord;
  const announcements = (state.announcements ?? state.data ?? []) as AnnouncementRecord[];
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementRecord | null>(null);
  const [notice, setNotice] = useState('');
  const pending = Boolean(state.isPending ?? state.pending);
  const filtered = [...announcements].filter((item) => {
    const text = [item.title, item.body, item.targetUserDetail].filter(Boolean).join(' ').toLowerCase();
    return (!deferredSearch || text.includes(deferredSearch)) && (audience === 'ALL' || item.target === audience);
  }).sort((a, b) => new Date(String(b.date ?? b.createdAt ?? 0)).getTime() - new Date(String(a.date ?? a.createdAt ?? 0)).getTime());

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    const payload = { title: title.trim(), body: body.trim(), target, status: 'PUBLISHED', level: 'INFO', dismissible: true };
    try { await state.createAnnouncement({ value: payload, reason: `Announcement published to ${target}.` }); setTitle(''); setBody(''); setTarget('ALL'); setNotice('Announcement published.'); }
    catch { setNotice('The announcement could not be published.'); }
  };
  const toggle = async (item: AnnouncementRecord) => {
    try { await state.updateAnnouncement({ announcementId: item.id, updates: { active: item.active === false }, reason: `Announcement ${item.active === false ? 'resumed' : 'paused'} by administrator.` }); setNotice(`Announcement ${item.active === false ? 'resumed' : 'paused'}.`); }
    catch { setNotice('The announcement status could not be changed.'); }
  };
  const remove = async (reason: string) => {
    if (!deleteTarget) return;
    try { await state.deleteAnnouncement({ announcementId: deleteTarget.id, reason }); setNotice('Announcement deleted.'); setDeleteTarget(null); }
    catch { setNotice('The announcement could not be deleted.'); }
  };

  return <PageShell title="Announcements" eyebrow="Customer communication" description="Publish targeted updates and manage the active broadcast history." actions={<StatusBadge tone={state.error ? 'danger' : 'success'}>{state.error ? 'Connection issue' : 'Live broadcasts'}</StatusBadge>}>
    {state.error && <ErrorState title="Announcements could not refresh" message="Retry before publishing a new customer message." onRetry={state.refresh} />}
    {notice && <Notice tone={notice.includes('Enter') || notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="panel h-fit"><div className="panel__header"><div><span className="eyebrow">New broadcast</span><h2>Publish announcement</h2></div><Megaphone size={18} className="text-primary-500" /></div>
        <form className="space-y-4" onSubmit={publish}>
          <label className="field"><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} placeholder="What changed?" /></label>
          <label className="field"><span>Audience</span><select value={target} onChange={(event) => setTarget(event.target.value)}><option value="ALL">All users</option><option value="PRO_ONLY">Pro users</option><option value="FREE_ONLY">Free users</option></select></label>
          <label className="field"><span>Message</span><textarea rows={6} value={body} onChange={(event) => setBody(event.target.value)} required maxLength={1000} placeholder="Write a concise, actionable update." /><small className="text-dark-text-muted">{body.length}/1000</small></label>
          <button className="button button--primary w-full" disabled={pending}><Plus size={16} />{pending ? 'Publishing…' : 'Publish announcement'}</button>
        </form>
      </section>
      <div className="lg:col-span-2">
        <section className="panel mb-4"><div className="flex flex-col gap-3 md:flex-row"><SearchField value={search} onChange={setSearch} label="Search announcements" placeholder="Search title or message" /><FilterSelect label="Announcement audience" value={audience} onChange={setAudience}><option value="ALL">All audiences</option><option value="PRO_ONLY">Pro users</option><option value="FREE_ONLY">Free users</option></FilterSelect></div></section>
        {state.isLoading ? <LoadingState label="Loading announcement history" /> : filtered.length === 0 ? <section className="panel"><EmptyState icon={announcements.length ? <SearchX /> : <Megaphone />} title={announcements.length ? 'No matching announcements' : 'No announcements yet'} message={announcements.length ? 'Clear or adjust the current filters.' : 'Publish the first customer update with the form.'} /></section> : <section className="space-y-3">
          {filtered.map((item) => <article key={item.id} className="panel"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><StatusBadge tone={item.active === false ? 'neutral' : 'success'}>{item.active === false ? 'Paused' : 'Broadcasting'}</StatusBadge><StatusBadge tone="info">{String(item.target ?? 'ALL').replaceAll('_', ' ')}</StatusBadge></div><h2 className="font-bold text-white">{String(item.title ?? 'Untitled announcement')}</h2><p className="mt-1 flex items-center gap-2 text-xs text-dark-text-muted"><Calendar size={13} />{formatDate(item.date ?? item.createdAt, true)}</p></div><div className="flex gap-1"><button className="button" disabled={pending} onClick={() => void toggle(item)}>{item.active === false ? 'Resume' : 'Pause'}</button><button className="icon-button text-red-400" disabled={pending} onClick={() => setDeleteTarget(item)} aria-label={`Delete ${String(item.title ?? 'announcement')}`}><Trash2 size={16} /></button></div></div><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-dark-text-muted">{String(item.body ?? item.message ?? '')}</p></article>)}
          <div className="rounded-2xl border border-dark-border bg-dark-card"><CursorPager page={Number(state.page ?? 1)} canPrevious={Boolean(state.canPreviousPage)} canNext={Boolean(state.canNextPage)} onPrevious={state.previousPage} onNext={state.nextPage} /></div>
        </section>}
      </div>
    </div>
    <ReasonDialog open={Boolean(deleteTarget)} title="Delete this announcement?" description="It will disappear from the broadcast history. Pause it instead if the content should remain available for audit." confirmLabel="Delete announcement" pending={pending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
  </PageShell>;
}

export default AnnouncementsPage;

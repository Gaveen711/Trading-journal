import { useDeferredValue, useState } from 'react';
import { Pencil, Plus, SearchX, Tag, Trash2 } from 'lucide-react';
import { useCoupons } from '../hooks';
import { CursorPager, EmptyState, ErrorState, FilterSelect, LoadingState, Notice, PageShell, ReasonDialog, SearchField, StatusBadge, TableFrame, formatDate, formatMoney, type LooseRecord } from './_shared';

type CouponRecord = LooseRecord & { id?: string; code: string; active?: boolean; type?: string };
const blankCoupon = { code: '', discount: '', type: 'PERCENT', currency: 'USD', expiry: '', active: true };

export function CouponsPage() {
  const [form, setForm] = useState<LooseRecord>(blankCoupon);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [status, setStatus] = useState('ALL');
  const state = useCoupons({ active: status === 'ALL' ? undefined : status === 'ACTIVE', search: deferredSearch || undefined, pageSize: 10 }) as LooseRecord;
  const coupons = (state.coupons ?? state.data ?? []) as CouponRecord[];
  const [deleteTarget, setDeleteTarget] = useState<CouponRecord | null>(null);
  const [notice, setNotice] = useState('');
  const pending = Boolean(state.isPending ?? state.pending);
  const filtered = coupons.filter((coupon) => (!deferredSearch || [coupon.code, coupon.id].filter(Boolean).join(' ').toLowerCase().includes(deferredSearch)) && (status === 'ALL' || (status === 'ACTIVE') === (coupon.active !== false)));

  const resetForm = () => { setForm(blankCoupon); setEditing(false); };
  const edit = (coupon: CouponRecord) => { setForm({ ...coupon, discount: String(coupon.discount ?? ''), expiry: String(coupon.expiry ?? coupon.expiresAt ?? '').slice(0, 10) }); setEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const discount = Number(form.discount);
    if (!Number.isFinite(discount) || discount <= 0 || (form.type === 'PERCENT' && discount > 100)) { setNotice('Enter a valid discount. Percentage coupons cannot exceed 100%.'); return; }
    setNotice('');
    const payload = { ...form, code: String(form.code).trim().toUpperCase(), discount };
    try {
      if (editing) await state.updateCoupon({ couponId: String(form.id), updates: { discount, type: String(form.type), currency: String(form.currency).toUpperCase(), expiry: String(form.expiry), active: Boolean(form.active) }, reason: `Coupon ${payload.code} edited by administrator.` });
      else await state.createCoupon({ value: payload, reason: `Coupon ${payload.code} created by administrator.` });
      setNotice(editing ? 'Coupon updated.' : 'Coupon created.'); resetForm();
    }
    catch { setNotice('The coupon could not be saved.'); }
  };
  const toggle = async (coupon: CouponRecord) => {
    try { await state.updateCoupon({ couponId: String(coupon.id), updates: { active: coupon.active === false }, reason: `Coupon ${coupon.code} ${coupon.active === false ? 'activated' : 'paused'} by administrator.` }); setNotice(`Coupon ${coupon.active === false ? 'activated' : 'paused'}.`); }
    catch { setNotice('The coupon status could not be changed.'); }
  };
  const remove = async (reason: string) => {
    if (!deleteTarget) return;
    try { await state.deleteCoupon({ couponId: String(deleteTarget.id), reason }); setNotice(`${deleteTarget.code} was deleted.`); setDeleteTarget(null); }
    catch { setNotice('The coupon could not be deleted.'); }
  };

  return <PageShell title="Coupons" eyebrow="Promotion controls" description="Create, pause, and retire discount codes with clear expiry and audit context." actions={<StatusBadge tone={state.error ? 'danger' : 'success'}>{state.error ? 'Connection issue' : 'Live registry'}</StatusBadge>}>
    {state.error && <ErrorState title="Coupons could not refresh" message="Retry before creating or changing a code." onRetry={state.refresh} />}
    {notice && <Notice tone={notice.includes('valid') || notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="panel h-fit"><div className="panel__header"><div><span className="eyebrow">{editing ? 'Edit promotion' : 'New promotion'}</span><h2>{editing ? String(form.code) : 'Create coupon'}</h2></div>{editing && <button className="button" onClick={resetForm}>Cancel edit</button>}</div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="field"><span>Coupon code</span><input value={String(form.code)} disabled={editing} onChange={(event) => setForm({ ...form, code: event.target.value.replace(/[^a-z0-9_-]/gi, '') })} maxLength={32} required placeholder="GOLD20" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="field"><span>Discount</span><input type="number" min="0.01" step="0.01" value={String(form.discount)} onChange={(event) => setForm({ ...form, discount: event.target.value })} required /></label><label className="field"><span>Type</span><select value={String(form.type)} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="PERCENT">Percent</option><option value="FIXED">Fixed amount</option></select></label></div>
          {form.type === 'FIXED' && <label className="field"><span>Currency</span><input value={String(form.currency)} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) })} minLength={3} maxLength={3} required placeholder="USD" /></label>}
          <label className="field"><span>Expiry date</span><input type="date" value={String(form.expiry)} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setForm({ ...form, expiry: event.target.value })} required /></label>
          <button className="button button--primary w-full" disabled={pending}><Plus size={16} />{pending ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}</button>
        </form>
      </section>
      <div className="lg:col-span-2">
        <section className="panel mb-4"><div className="flex flex-col gap-3 md:flex-row"><SearchField value={search} onChange={setSearch} label="Search coupons" placeholder="Search coupon code" /><FilterSelect label="Coupon status" value={status} onChange={setStatus}><option value="ALL">All coupons</option><option value="ACTIVE">Active</option><option value="INACTIVE">Paused</option></FilterSelect></div></section>
        <TableFrame title="Coupon registry" count={filtered.length}>{state.isLoading ? <LoadingState label="Loading coupons" /> : filtered.length === 0 ? <EmptyState icon={coupons.length ? <SearchX /> : <Tag />} title={coupons.length ? 'No matching coupons' : 'No coupons yet'} message={coupons.length ? 'Clear or adjust the current filters.' : 'Create the first promotion with the form.'} /> : <><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-dark-border text-xs text-dark-text-muted"><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Expiry</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-dark-border">{filtered.map((coupon) => <tr key={coupon.code} className="hover:bg-white/5"><td className="p-4 font-mono font-bold text-white">{coupon.code}</td><td className="p-4 text-dark-text-muted">{coupon.type === 'PERCENT' ? `${Number(coupon.discount)}%` : formatMoney(coupon.discount, String(coupon.currency ?? 'USD'))}</td><td className="p-4 text-dark-text-muted">{formatDate(coupon.expiry ?? coupon.expiresAt)}</td><td className="p-4"><button disabled={pending} onClick={() => void toggle(coupon)}><StatusBadge tone={coupon.active === false ? 'neutral' : 'success'}>{coupon.active === false ? 'Paused' : 'Active'}</StatusBadge></button></td><td className="p-4"><div className="flex justify-end gap-1"><button className="icon-button" onClick={() => edit(coupon)} aria-label={`Edit ${coupon.code}`}><Pencil size={16} /></button><button className="icon-button text-red-400" onClick={() => setDeleteTarget(coupon)} aria-label={`Delete ${coupon.code}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><CursorPager page={Number(state.page ?? 1)} canPrevious={Boolean(state.canPreviousPage)} canNext={Boolean(state.canNextPage)} onPrevious={state.previousPage} onNext={state.nextPage} /></>}</TableFrame>
      </div>
    </div>
    <ReasonDialog open={Boolean(deleteTarget)} title={`Delete ${deleteTarget?.code ?? 'coupon'}?`} description="Customers will no longer be able to redeem this code. Pause it instead if you may need it again." confirmLabel="Delete coupon" pending={pending} onClose={() => setDeleteTarget(null)} onConfirm={remove} />
  </PageShell>;
}

export default CouponsPage;

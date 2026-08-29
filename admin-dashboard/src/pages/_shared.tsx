import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  Button,
  EmptyState as SharedEmptyState,
  ErrorState as SharedErrorState,
  LoadingState as SharedLoadingState,
  MetricCard,
  PageHeader as SharedPageHeader,
  Pagination,
  Panel as SharedPanel,
  StatusBadge as SharedStatusBadge,
  TextareaField,
} from '../components';
import { mutationReasonError } from '../domain/models';
import './pages.css';

export function PageShell({ title, eyebrow, description, actions, children }: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return <div className="admin-page-stack">
    <PageHeader title={title} eyebrow={eyebrow} description={description} actions={actions} />
    {children}
  </div>;
}

export function PageHeader({ title, eyebrow, description, actions }: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return <SharedPageHeader title={title} eyebrow={eyebrow} description={description} actions={actions} />;
}

export function Panel({ children, className = '', title, meta }: {
  children: ReactNode;
  className?: string;
  title?: string;
  meta?: ReactNode;
}) {
  return <SharedPanel className={className} title={title} actions={meta}>{children}</SharedPanel>;
}

export function Metric({ label, value, detail, icon }: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
}) {
  return <MetricCard label={label} value={value} supportingText={detail} icon={icon} />;
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  return <SharedStatusBadge tone={tone === 'info' ? 'gold' : tone}>{children}</SharedStatusBadge>;
}

export function LoadingState({ label = 'Loading records' }: { label?: string }) {
  return <SharedLoadingState label={label} />;
}

export function ErrorState({ title = 'Could not load this page', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return <SharedErrorState title={title} description={message} onRetry={onRetry} />;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message: string; action?: ReactNode }) {
  void icon;
  return <SharedEmptyState title={title} description={message} action={action} />;
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'danger' | 'success' }) {
  return <div className={`form-alert form-alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'} aria-live="polite">{children}</div>;
}

export function SearchField({ value, onChange, placeholder, label = 'Search' }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return <label className="relative block min-w-64 flex-1">
    <span className="sr-only">{label}</span><Search size={17} className="absolute left-3 top-3.5 text-dark-text-muted" aria-hidden="true" />
    <input className="w-full min-h-11 rounded-xl border border-dark-border bg-dark-bg pl-10 pr-10 text-sm text-white" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    {value && <button type="button" className="absolute right-1 top-1 icon-button" onClick={() => onChange('')} aria-label={`Clear ${label.toLowerCase()}`}><X size={15} /></button>}
  </label>;
}

export function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label><span className="sr-only">{label}</span><select className="min-h-11 rounded-xl border border-dark-border bg-dark-bg px-3 text-sm text-white" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

export function TableFrame({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return <SharedPanel title={title} actions={<span className="admin-record-count">{count.toLocaleString()} records</span>} padding="none">{children}</SharedPanel>;
}

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return <Pagination page={page} pageCount={pages} totalItems={total} pageSize={Math.ceil(total / pages)} onPageChange={onPage} />;
}

export function CursorPager({ page, canPrevious, canNext, onPrevious, onNext }: { page: number; canPrevious: boolean; canNext: boolean; onPrevious: () => void; onNext: () => void }) {
  if (!canPrevious && !canNext) return null;
  return <nav className="admin-pagination" aria-label="Pagination"><p className="admin-pagination__summary">Page <strong>{page}</strong></p><div className="admin-pagination__controls"><Button variant="ghost" size="sm" disabled={!canPrevious} onClick={onPrevious} leadingIcon={<ChevronLeft />}>Previous</Button><Button variant="ghost" size="sm" disabled={!canNext} onClick={onNext} trailingIcon={<ChevronRight />}>Next</Button></div></nav>;
}

export function usePagination<T>(items: T[], size = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  useEffect(() => setPage((current) => Math.min(current, pages)), [pages]);
  const visible = useMemo(() => items.slice((page - 1) * size, page * size), [items, page, size]);
  return { page, pages, setPage, visible };
}

export function ReasonDialog({ open, title, description, confirmLabel, pending, onClose, onConfirm }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => { if (!open) { setReason(''); setError(''); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && !pending) { event.preventDefault(); onClose(); return; }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!controls.length) return;
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = mutationReasonError(reason);
    if (validationError) { setError(validationError); return; }
    setError('');
    await onConfirm(reason.trim());
  };

  return <div className="admin-reason-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="reason-dialog-title" className="admin-reason-dialog" onKeyDown={handleKeyDown}>
      <div className="mb-5 flex items-start gap-3"><span className="service-icon text-red-400"><AlertTriangle size={20} /></span><div><h2 id="reason-dialog-title" className="font-bold text-white">{title}</h2><p className="mt-1 text-sm text-dark-text-muted">{description}</p></div></div>
      <form onSubmit={submit}>
        <TextareaField label="Reason for this action" autoFocus rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Include the customer request, policy, or incident reference." />
        {error && <p className="mt-2 text-xs text-red-400" role="alert">{error}</p>}
        <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="ghost" disabled={pending} onClick={onClose}>Cancel</Button><Button type="submit" variant="danger" loading={pending}>{confirmLabel}</Button></div>
      </form>
    </section>
  </div>;
}

export function safeDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date : null;
}

export function formatDate(value: unknown, withTime = false) {
  const date = safeDate(value);
  if (!date) return 'Not recorded';
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
}

export function formatMoney(amount: unknown, currency = 'USD') {
  const numeric = Number(amount || 0);
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(numeric); }
  catch { return `${currency.toUpperCase()} ${numeric.toFixed(2)}`; }
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export type AsyncAction = (...args: never[]) => Promise<unknown>;
export type LooseRecord = Record<string, any>;

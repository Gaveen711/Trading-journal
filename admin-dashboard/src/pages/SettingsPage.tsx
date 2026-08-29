import { useEffect, useState } from 'react';
import { Eye, RotateCcw, Save, ShieldAlert, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import type { SystemSettings, SystemSettingsUpdate } from '../domain';
import { useSettings } from '../hooks';
import { ErrorState, LoadingState, Notice, PageShell, Panel, ReasonDialog } from './_shared';

const defaults: SystemSettings = { supportEmail: 'support@xaujournal.com', allowRegistration: true, maintenanceMode: false, trialDays: 0, announcementBannerEnabled: true, reportsEnabled: true };

export function SettingsPage() {
  const { settings, error, isLoading, isPending, refresh, updateSettings } = useSettings();
  const [form, setForm] = useState<SystemSettings>(defaults);
  const [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState<boolean | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  useEffect(() => { if (settings) setForm({ ...defaults, ...settings }); }, [settings]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const updates: SystemSettingsUpdate = { supportEmail: form.supportEmail.trim(), allowRegistration: form.allowRegistration, maintenanceMode: form.maintenanceMode, trialDays: form.trialDays, announcementBannerEnabled: form.announcementBannerEnabled, reportsEnabled: form.reportsEnabled };
    try { await updateSettings({ updates, reason: 'Platform settings updated by administrator.' }); setNotice('Settings saved.'); toast.success('Settings saved.'); }
    catch { setNotice('Settings could not be saved.'); toast.error('Settings could not be saved.'); }
  };
  const updateMaintenance = async () => {
    if (maintenanceTarget === null || maintenanceReason.trim().length < 10) return;
    try {
      const next = maintenanceTarget;
      await updateSettings({ updates: { maintenanceMode: next }, reason: maintenanceReason.trim() });
      setForm((current) => ({ ...current, maintenanceMode: next }));
      setMaintenanceTarget(null); setMaintenanceReason('');
      toast.success(next ? 'Maintenance mode enabled. Visitors now see the maintenance notice.' : 'Maintenance mode disabled. Public access has been restored.');
    } catch { toast.error('Maintenance mode could not be updated. Public availability has not changed.'); }
  };
  const reset = async (reason: string) => {
    try { await updateSettings({ updates: defaults, reason }); setNotice('Settings reset to platform defaults.'); setResetting(false); toast.success('Settings reset to platform defaults.'); }
    catch { setNotice('Settings could not be reset.'); toast.error('Settings could not be reset.'); }
  };

  return <PageShell title="Settings" eyebrow="Platform controls" description="Manage customer-facing defaults and operational safeguards.">
    {error && <ErrorState title="Settings could not refresh" message="Do not save until the current configuration is available." onRetry={refresh} />}
    {notice && <Notice tone={notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    {isLoading ? <LoadingState label="Loading platform settings" /> : <form className="max-w-4xl space-y-4" onSubmit={submit}>
      <MaintenanceModeCard active={form.maintenanceMode} disabled={isPending} onToggle={setMaintenanceTarget} />
      <Panel title="Customer operations" meta={<SlidersHorizontal size={18} className="text-primary-500" />}><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="field"><span>Customer support email</span><input type="email" value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} required /><small className="text-dark-text-muted">Shown wherever customers are directed to contact support.</small></label>
        <label className="field"><span>Trial length in days</span><input type="number" min={0} max={30} value={form.trialDays} onChange={(event) => setForm({ ...form, trialDays: Number(event.target.value) })} required /><small className="text-dark-text-muted">Accepted range: 0–30 days.</small></label>
      </div></Panel>
      <Panel title="Feature controls"><div className="space-y-3">
        <SettingToggle checked={form.allowRegistration} onChange={(checked) => setForm({ ...form, allowRegistration: checked })} title="Allow registrations" description="Permit new customers to create accounts." />
        <SettingToggle checked={form.announcementBannerEnabled} onChange={(checked) => setForm({ ...form, announcementBannerEnabled: checked })} title="Announcement banner" description="Allow published announcements to appear on the customer site." />
        <SettingToggle checked={form.reportsEnabled} onChange={(checked) => setForm({ ...form, reportsEnabled: checked })} title="Customer reports" description="Allow customers to submit reports for administrator review." />
      </div></Panel>
      <div className="flex items-start gap-3 rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-sm"><ShieldCheck className="shrink-0 text-primary-500" /><p className="text-dark-text-muted">Every settings mutation is authorized by the admin API and written to the audit log with its reason.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row"><button className="button button--primary flex-1" disabled={isPending}><Save size={17} />{isPending ? 'Saving…' : 'Save settings'}</button><button type="button" className="button button--danger" disabled={isPending} onClick={() => setResetting(true)}><RotateCcw size={17} />Reset defaults</button></div>
    </form>}
    <ReasonDialog open={resetting} title="Reset platform settings?" description="Customer-facing configuration will return to the server-defined defaults. Record why this reset is required." confirmLabel="Reset settings" pending={isPending} onClose={() => setResetting(false)} onConfirm={reset} />
    <MaintenanceConfirmation open={maintenanceTarget !== null} active={maintenanceTarget === true} pending={isPending} reason={maintenanceReason} onReasonChange={setMaintenanceReason} onCancel={() => { setMaintenanceTarget(null); setMaintenanceReason(''); }} onConfirm={updateMaintenance} />
  </PageShell>;
}

function MaintenanceModeCard({ active, disabled, onToggle }: { active: boolean; disabled: boolean; onToggle: (next: boolean) => void }) {
  return <Card className="border-amber-500/30 bg-amber-500/5"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert aria-hidden="true" />Maintenance mode</CardTitle><CardDescription>Display a clear maintenance notice on the public site while the admin dashboard remains available.</CardDescription><CardAction><Badge variant={active ? 'destructive' : 'secondary'}>{active ? 'Public site paused' : 'Public site available'}</Badge></CardAction></CardHeader><CardContent className="grid gap-4"><div className="rounded-lg border border-border/70 bg-background/50 p-3 text-sm text-muted-foreground"><strong className="block text-foreground">Visitor notice</strong>XAU Journal is briefly unavailable while we perform scheduled maintenance. Please try again shortly.</div><div className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-border bg-card px-3 py-2"><span><strong className="block text-sm">Public site access</strong><span className="text-sm text-muted-foreground">A confirmation and audit reason are required for every change.</span></span><Switch checked={active} disabled={disabled} onCheckedChange={onToggle} aria-label="Toggle maintenance mode" /></div></CardContent><CardFooter className="justify-between gap-3"><span className="text-xs text-muted-foreground">Admin access remains available during maintenance.</span><Button type="button" variant="outline" size="sm" onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}><Eye data-icon="inline-start" />Preview public site</Button></CardFooter></Card>;
}

function MaintenanceConfirmation({ open, active, pending, reason, onReasonChange, onCancel, onConfirm }: { open: boolean; active: boolean; pending: boolean; reason: string; onReasonChange: (reason: string) => void; onCancel: () => void; onConfirm: () => void }) {
  return <AlertDialog open={open} onOpenChange={(next) => { if (!next && !pending) onCancel(); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{active ? 'Enable maintenance mode?' : 'Restore public access?'}</AlertDialogTitle><AlertDialogDescription>{active ? 'Visitors will immediately see the maintenance notice. Admin dashboard access remains available.' : 'Visitors will be able to use the public site again.'}</AlertDialogDescription></AlertDialogHeader><label className="grid gap-2 text-sm font-medium">Reason for this availability change<Textarea value={reason} onChange={(event) => onReasonChange(event.target.value)} placeholder="Reference the maintenance window or incident." aria-invalid={reason.length > 0 && reason.trim().length < 10} /><span className="text-xs font-normal text-muted-foreground">At least 10 characters. This is written to the audit log.</span></label><AlertDialogFooter><AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel><AlertDialogAction variant={active ? 'destructive' : 'default'} disabled={pending || reason.trim().length < 10} onClick={(event) => { event.preventDefault(); onConfirm(); }}>{pending ? 'Updating…' : active ? 'Enable maintenance mode' : 'Restore public access'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

function SettingToggle({ checked, onChange, title, description }: { checked: boolean; onChange: (checked: boolean) => void; title: string; description: string }) {
  return <div className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-dark-border bg-white/5 p-4"><span><strong className="block text-sm text-white">{title}</strong><small className="text-xs text-dark-text-muted">{description}</small></span><Switch checked={checked} onCheckedChange={onChange} aria-label={title} /></div>;
}

export default SettingsPage;

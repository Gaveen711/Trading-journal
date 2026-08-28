import { useEffect, useState } from 'react';
import { RotateCcw, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { SystemSettings, SystemSettingsUpdate } from '../domain';
import { useSettings } from '../hooks';
import { ErrorState, LoadingState, Notice, PageShell, Panel, ReasonDialog } from './_shared';

const defaults: SystemSettings = {
  supportEmail: 'support@xaujournal.com',
  allowRegistration: true,
  maintenanceMode: false,
  trialDays: 0,
  announcementBannerEnabled: true,
  reportsEnabled: true,
};

export function SettingsPage() {
  const { settings, error, isLoading, isPending, refresh, updateSettings } = useSettings();
  const [form, setForm] = useState<SystemSettings>(defaults);
  const [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...defaults, ...settings });
  }, [settings]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    const updates: SystemSettingsUpdate = {
      supportEmail: form.supportEmail.trim(),
      allowRegistration: form.allowRegistration,
      maintenanceMode: form.maintenanceMode,
      trialDays: form.trialDays,
      announcementBannerEnabled: form.announcementBannerEnabled,
      reportsEnabled: form.reportsEnabled,
    };
    try {
      await updateSettings({ updates, reason: 'Platform settings updated by administrator.' });
      setNotice('Settings saved.');
    } catch {
      setNotice('Settings could not be saved.');
    }
  };

  const reset = async (reason: string) => {
    try {
      await updateSettings({ updates: defaults, reason });
      setNotice('Settings reset to platform defaults.');
      setResetting(false);
    } catch {
      setNotice('Settings could not be reset.');
    }
  };

  return <PageShell title="Settings" eyebrow="Platform controls" description="Manage customer-facing defaults and operational safeguards.">
    {error && <ErrorState title="Settings could not refresh" message="Do not save until the current configuration is available." onRetry={refresh} />}
    {notice && <Notice tone={notice.includes('could not') ? 'danger' : 'success'}>{notice}</Notice>}
    {isLoading ? <LoadingState label="Loading platform settings" /> : <form className="max-w-4xl space-y-4" onSubmit={submit}>
      <Panel title="Customer operations" meta={<SlidersHorizontal size={18} className="text-primary-500" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="field">
            <span>Customer support email</span>
            <input type="email" value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} required />
            <small className="text-dark-text-muted">Shown wherever customers are directed to contact support.</small>
          </label>
          <label className="field">
            <span>Trial length in days</span>
            <input type="number" min={0} max={30} value={form.trialDays} onChange={(event) => setForm({ ...form, trialDays: Number(event.target.value) })} required />
            <small className="text-dark-text-muted">Accepted range: 0–30 days.</small>
          </label>
        </div>
      </Panel>
      <Panel title="Feature controls">
        <div className="space-y-3">
          <SettingToggle checked={form.allowRegistration} onChange={(checked) => setForm({ ...form, allowRegistration: checked })} title="Allow registrations" description="Permit new customers to create accounts." />
          <SettingToggle checked={form.maintenanceMode} onChange={(checked) => setForm({ ...form, maintenanceMode: checked })} title="Maintenance mode" description="Show customers a maintenance state while operational work is in progress." />
          <SettingToggle checked={form.announcementBannerEnabled} onChange={(checked) => setForm({ ...form, announcementBannerEnabled: checked })} title="Announcement banner" description="Allow published announcements to appear on the customer site." />
          <SettingToggle checked={form.reportsEnabled} onChange={(checked) => setForm({ ...form, reportsEnabled: checked })} title="Customer reports" description="Allow customers to submit reports for administrator review." />
        </div>
      </Panel>
      <div className="flex items-start gap-3 rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-sm"><ShieldCheck className="shrink-0 text-primary-500" /><p className="text-dark-text-muted">Every settings mutation is authorized by the admin API and written to the audit log with its reason.</p></div>
      <div className="flex flex-col gap-3 sm:flex-row"><button className="button button--primary flex-1" disabled={isPending}><Save size={17} />{isPending ? 'Saving…' : 'Save settings'}</button><button type="button" className="button button--danger" disabled={isPending} onClick={() => setResetting(true)}><RotateCcw size={17} />Reset defaults</button></div>
    </form>}
    <ReasonDialog open={resetting} title="Reset platform settings?" description="Customer-facing configuration will return to the server-defined defaults. Record why this reset is required." confirmLabel="Reset settings" pending={isPending} onClose={() => setResetting(false)} onConfirm={reset} />
  </PageShell>;
}

function SettingToggle({ checked, onChange, title, description }: { checked: boolean; onChange: (checked: boolean) => void; title: string; description: string }) {
  return <label className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-dark-border bg-white/5 p-4"><span><strong className="block text-sm text-white">{title}</strong><small className="text-xs text-dark-text-muted">{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5" /></label>;
}

export default SettingsPage;

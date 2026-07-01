import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  Bell,
  CreditCard,
  KeyRound,
  Lock,
  Palette,
  PlugZap,
  ShieldCheck,
  User,
} from 'lucide-react';
import { auth } from '../firebase';
import { useToast } from '../components/ToastContext';
import { useAppTheme } from '../hooks/useAppTheme';

export function SettingsPage() {
  const {
    plan,
    expiry,
    openPortal,
    setShowPricingModal,
    setShowThemeSelector,
  } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { isLightMode, toggleTheme, currentTemplate } = useAppTheme();
  const user = auth.currentUser;

  const providerIds = useMemo(
    () => user?.providerData?.map((provider) => provider.providerId) || [],
    [user]
  );
  const canChangePassword = providerIds.includes('password');

  const [displayName, setDisplayName] = useState(
    user?.displayName || user?.email?.split('@')[0] || ''
  );
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [weeklySummary, setWeeklySummary] = useState(
    () => localStorage.getItem('xau-weekly-summary') !== 'false'
  );
  const [tradeReminders, setTradeReminders] = useState(
    () => localStorage.getItem('xau-trade-reminders') === 'true'
  );

  const planLabel = plan === 'pro' ? 'Pro' : plan === 'grace' ? 'Grace' : 'Basic';
  const expiryLabel = expiry ? new Date(expiry).toLocaleDateString() : 'Not set';

  const handleSaveName = async (event) => {
    event.preventDefault();
    const name = displayName.trim();

    if (name.length < 2) {
      toast('Username must be at least 2 characters.', 'error');
      return;
    }

    setSavingName(true);
    try {
      await updateProfile(user, { displayName: name });
      toast('Username updated.', 'success');
    } catch (error) {
      toast(getAuthErrorMessage(error), 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();

    if (!canChangePassword) {
      toast('Password changes are only available for email/password accounts.', 'error');
      return;
    }

    if (!currentPassword) {
      toast('Enter your current password first.', 'error');
      return;
    }

    if (newPassword.length < 8) {
      toast('New password must be at least 8 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('New passwords do not match.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast('Password updated securely.', 'success');
    } catch (error) {
      toast(getAuthErrorMessage(error), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('xau-weekly-summary', String(weeklySummary));
    localStorage.setItem('xau-trade-reminders', String(tradeReminders));
    toast('Preferences saved.', 'success');
  };

  return (
    <div className="space-y-6 pb-24">
      <section className="card-premium p-5 sm:p-7 rounded-3xl bg-card/65 border border-border/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
              Account Settings
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
              Manage your profile, password, billing, appearance, and trading workspace preferences.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
              {planLabel} Plan
            </span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Renews: {expiryLabel}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSaveName} className="card-premium rounded-3xl border border-border/20 bg-card/65 p-5 sm:p-6">
          <SectionHeader
            icon={User}
            label="Profile"
            title="Username"
            description="This name appears in your dashboard, account menu, and shared trade context."
          />

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Username
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="input-premium min-h-12 w-full rounded-2xl"
                autoComplete="name"
              />
            </label>

            <ReadOnlyField label="Email" value={user?.email || 'No email linked'} />

            <button
              type="submit"
              disabled={savingName}
              className="min-h-11 rounded-2xl bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingName ? 'Saving...' : 'Save Username'}
            </button>
          </div>
        </form>

        <form onSubmit={handleSavePassword} className="card-premium rounded-3xl border border-border/20 bg-card/65 p-5 sm:p-6">
          <SectionHeader
            icon={KeyRound}
            label="Security"
            title="Password"
            description={canChangePassword ? 'Use a strong password with at least 8 characters.' : 'Your account uses a social login provider, so password changes are handled by that provider.'}
          />

          <fieldset disabled={!canChangePassword || savingPassword} className="mt-5 space-y-3 disabled:opacity-50">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="min-h-11 rounded-2xl bg-[#D1495B] px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#B83D4E] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </fieldset>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="card-premium rounded-3xl border border-border/20 bg-card/65 p-5 sm:p-6">
          <SectionHeader
            icon={Palette}
            label="Appearance"
            title="Workspace Theme"
            description="Adjust the dashboard color accent and light or dark mode."
          />
          <div className="mt-5 space-y-3">
            <InfoRow label="Current palette" value={formatTemplateName(currentTemplate)} />
            <InfoRow label="Mode" value={isLightMode ? 'Light' : 'Dark'} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowThemeSelector?.(true)}
                className="min-h-11 rounded-2xl border border-primary/30 bg-primary/10 px-4 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/15"
              >
                Change Color
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="min-h-11 rounded-2xl border border-border/40 bg-muted/40 px-4 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
              >
                Toggle Mode
              </button>
            </div>
          </div>
        </section>

        <section className="card-premium rounded-3xl border border-border/20 bg-card/65 p-5 sm:p-6">
          <SectionHeader
            icon={CreditCard}
            label="Billing"
            title="Subscription"
            description="Manage your plan, billing portal, and upgrade access."
          />
          <div className="mt-5 space-y-3">
            <InfoRow label="Plan" value={planLabel} />
            <InfoRow label="Renewal" value={expiryLabel} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openPortal}
                className="min-h-11 rounded-2xl bg-primary px-4 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Billing Portal
              </button>
              {plan !== 'pro' && (
                <button
                  type="button"
                  onClick={() => setShowPricingModal?.(true)}
                  className="min-h-11 rounded-2xl bg-[#EDAE49] px-4 text-[10px] font-black uppercase tracking-widest text-[#003D5B] transition-colors hover:bg-[#D99A32]"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="card-premium rounded-3xl border border-border/20 bg-card/65 p-5 sm:p-6">
          <SectionHeader
            icon={PlugZap}
            label="Integrations"
            title="Broker Sync"
            description="Review your MT4/MT5 connection, sync permissions, and account status."
          />
          <div className="mt-5 space-y-3">
            <InfoRow label="Connection" value="Managed in Sync" />
            <button
              type="button"
              onClick={() => navigate('/app/sync')}
              className="min-h-11 rounded-2xl border border-primary/30 bg-primary/10 px-4 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/15"
            >
              Open Sync Settings
            </button>
          </div>
        </section>
      </div>

      <section className="card-premium rounded-3xl border border-border/20 bg-card/65 p-5 sm:p-6">
        <SectionHeader
          icon={Bell}
          label="Preferences"
          title="Notifications & Reports"
          description="These preferences are saved locally for your dashboard experience."
        />
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ToggleRow
            title="Weekly trading summary"
            description="Keep a reminder preference for weekly review emails."
            checked={weeklySummary}
            onChange={setWeeklySummary}
          />
          <ToggleRow
            title="Trade journaling reminders"
            description="Keep a reminder preference for logging after sessions."
            checked={tradeReminders}
            onChange={setTradeReminders}
          />
        </div>
        <button
          type="button"
          onClick={handleSavePreferences}
          className="mt-4 min-h-11 rounded-2xl bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save Preferences
        </button>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
              What else belongs here
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted-foreground">
              Good settings candidates are API/broker connection controls, export data, delete or reset account data,
              invoice history, timezone and currency preferences, and notification delivery channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, title, description }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-primary">
          {label}
        </p>
        <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="input-premium min-h-12 w-full rounded-2xl pl-10"
          autoComplete={autoComplete}
        />
      </div>
    </label>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="min-h-12 rounded-2xl border border-border/30 bg-muted/30 px-4 py-3 text-sm font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/20 bg-muted/25 px-3 py-2.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-xs font-black uppercase tracking-wider text-foreground">
        {value}
      </span>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/20 bg-muted/25 p-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function formatTemplateName(template) {
  return String(template || '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Current password is incorrect.';
    case 'auth/weak-password':
      return 'New password is too weak.';
    case 'auth/requires-recent-login':
      return 'Please sign in again before changing your password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}

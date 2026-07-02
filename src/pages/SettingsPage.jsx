import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
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
    resetTrades,
    resetWallet,
    updateMonthlyGoal,
    journals,
    deleteEntry,
  } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { isLightMode, toggleTheme, currentTemplate } = useAppTheme();
  const user = auth.currentUser;
  const userInitial = (user?.displayName || user?.email || 'T').trim().charAt(0).toUpperCase();

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

  const [confirmReset, setConfirmReset] = useState(false);
  const [resettingTerminal, setResettingTerminal] = useState(false);

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

  const handleResetTerminal = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      toast('Click reset again to confirm terminal reset.', 'error');
      return;
    }

    setResettingTerminal(true);
    try {
      await resetTrades?.();
      await resetWallet?.();
      await updateMonthlyGoal?.(1000);
      await Promise.all(Object.keys(journals || {}).map((date) => deleteEntry?.(date)));
      localStorage.removeItem('xau-weekly-summary');
      localStorage.removeItem('xau-trade-reminders');
      setConfirmReset(false);
      toast('Terminal reset complete.', 'success');
    } catch (error) {
      toast(error?.message || 'Terminal reset failed. Please try again.', 'error');
    } finally {
      setResettingTerminal(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-24">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/20 bg-card/70 p-5 shadow-sm backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-2xl font-black text-primary">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                Account Settings
              </p>
              <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
                Profile & Workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
                Manage identity, access, billing, notifications, and broker workspace controls.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <StatusPill label="Plan" value={planLabel} />
            <StatusPill label="Renewal" value={expiryLabel} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
          <form onSubmit={handleSaveName} className="rounded-[2rem] border border-border/20 bg-card/65 p-5 shadow-sm backdrop-blur-xl sm:p-6 xl:col-span-7">
            <SectionHeader
              icon={User}
              label="Profile"
              title="Account Identity"
              description="This name appears in your dashboard, account menu, and shared trade context."
            />

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="block min-w-0">
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
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium leading-5 text-muted-foreground">
                Keep the display name short so it fits collapsed navigation and shared trade cards.
              </p>
              <button
                type="submit"
                disabled={savingName}
                className="min-h-11 w-full rounded-2xl bg-primary px-5 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {savingName ? 'Saving...' : 'Save Username'}
              </button>
            </div>
          </form>

          <form onSubmit={handleSavePassword} className="rounded-[2rem] border border-border/20 bg-card/65 p-5 shadow-sm backdrop-blur-xl sm:p-6 xl:col-span-7 xl:row-start-2">
            <SectionHeader
              icon={KeyRound}
              label="Security"
              title="Password"
              description={canChangePassword ? 'Use a strong password with at least 8 characters.' : 'Your account uses a social login provider, so password changes are handled by that provider.'}
            />

            <fieldset disabled={!canChangePassword || savingPassword} className="mt-6 grid grid-cols-1 gap-4 disabled:opacity-50 lg:grid-cols-3">
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
            </fieldset>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium leading-5 text-muted-foreground">
                You may be asked to sign in again before sensitive security changes are accepted.
              </p>
              <button
                type="submit"
                disabled={!canChangePassword || savingPassword}
                className="min-h-11 w-full rounded-2xl bg-[#D1495B] px-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#B83D4E] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
          <section className="rounded-[2rem] border border-border/20 bg-card/65 p-5 shadow-sm backdrop-blur-xl sm:p-6 xl:col-span-5 xl:col-start-8 xl:row-start-1">
            <SectionHeader
              icon={CreditCard}
              label="Billing"
              title="Subscription"
              description="Manage your plan, billing portal, and upgrade access."
            />
            <div className="mt-6 space-y-3">
              <InfoRow label="Plan" value={planLabel} />
              <InfoRow label="Renewal" value={expiryLabel} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
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

          <section className="rounded-[2rem] border border-border/20 bg-card/65 p-5 shadow-sm backdrop-blur-xl sm:p-6 xl:col-span-5 xl:col-start-8 xl:row-start-2">
            <SectionHeader
              icon={Palette}
              label="Appearance"
              title="Workspace Theme"
              description="Adjust the dashboard color accent and light or dark mode."
            />
            <div className="mt-6 space-y-3">
              <InfoRow label="Palette" value={formatTemplateName(currentTemplate)} />
              <InfoRow label="Mode" value={isLightMode ? 'Light' : 'Dark'} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
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
                  {isLightMode ? 'Use Dark Mode' : 'Use Light Mode'}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/20 bg-card/65 p-5 shadow-sm backdrop-blur-xl sm:p-6 xl:col-span-5 xl:col-start-8 xl:row-start-3">
            <SectionHeader
              icon={PlugZap}
              label="Integrations"
              title="Broker Sync"
              description="Review your MT4/MT5 connection, sync permissions, and account status."
            />
            <div className="mt-6 space-y-3">
              <InfoRow label="Connection" value="Managed in Sync" />
              <button
                type="button"
                onClick={() => navigate('/app/sync')}
                className="min-h-11 w-full rounded-2xl border border-primary/30 bg-primary/10 px-4 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/15"
              >
                Open Sync Settings
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-5 sm:p-6 xl:col-span-7 xl:row-start-3">
            <div className="flex flex-col gap-5">
              <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                  Protected Workspace
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  Sensitive billing, password, and sync changes stay grouped away from everyday dashboard actions.
                </p>
              </div>
              </div>
              <button
                type="button"
                onClick={handleResetTerminal}
                disabled={resettingTerminal}
                className={`min-h-11 w-full rounded-2xl border px-4 text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  confirmReset
                    ? 'border-[#D1495B]/50 bg-[#D1495B]/10 text-[#D1495B] hover:bg-[#D1495B]/15'
                    : 'border-border/30 bg-background/40 text-muted-foreground hover:border-[#D1495B]/35 hover:text-[#D1495B]'
                }`}
              >
                {resettingTerminal ? 'Resetting...' : confirmReset ? 'Confirm Reset' : 'Reset Terminal'}
              </button>
            </div>
          </section>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, title, description }) {
  return (
    <div className="flex gap-3 min-w-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
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

function StatusPill({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/25 bg-muted/25 px-3 py-2 text-left sm:min-w-[9rem]">
      <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 block truncate text-xs font-black uppercase tracking-wider text-foreground">
        {value}
      </span>
    </div>
  );
}

function PasswordInput({ label, value, onChange, autoComplete }) {
  return (
    <label className="block min-w-0">
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
    <div className="min-w-0">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="min-h-12 rounded-2xl border border-border/30 bg-muted/30 px-4 py-3 text-sm font-bold text-foreground break-words">
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
      <span className="min-w-0 text-right text-xs font-black uppercase tracking-wider text-foreground break-words">
        {value}
      </span>
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

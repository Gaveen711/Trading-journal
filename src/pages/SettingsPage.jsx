import { useId, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { auth } from '../firebase';
import { useToast } from '../components/ToastContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { SectionCard } from '../components/app/SectionCard';
import { StatusSquare } from '../components/app/StatusSquare';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';

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
    deleteAllEntries,
  } = useOutletContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { isLightMode, toggleTheme, currentTemplate } = useAppTheme();
  const user = auth.currentUser;

  const usernameId = useId();
  const darkModeId = useId();

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

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resettingTerminal, setResettingTerminal] = useState(false);

  const planLabel = plan === 'pro' ? 'Pro' : plan === 'grace' ? 'Grace' : 'Basic';
  const expiryLabel = expiry ? new Date(expiry).toLocaleDateString() : null;

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
    setResetDialogOpen(false);
    setResettingTerminal(true);
    try {
      // Independent writes, so they run together rather than in series. The
      // journal clear is one batched pass instead of two writes per entry.
      await Promise.all([
        resetTrades?.(),
        resetWallet?.(),
        updateMonthlyGoal?.(1000),
        deleteAllEntries?.(),
      ]);
      localStorage.removeItem('xau-weekly-summary');
      localStorage.removeItem('xau-trade-reminders');
      toast('Terminal reset complete.', 'success');
    } catch (error) {
      toast(error?.message || 'Terminal reset failed. Please try again.', 'error');
    } finally {
      setResettingTerminal(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-lg font-medium text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Identity, access, billing, and workspace controls.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusSquare
            state={plan === 'pro' ? 'on' : plan === 'grace' ? 'attn' : 'off'}
            label={`Plan: ${planLabel}`}
          >
            {planLabel} plan
          </StatusSquare>
          <span className="font-mono text-[11px] text-muted-foreground">
            {expiryLabel ? `Renews ${expiryLabel}` : 'Renewal —'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5 xl:items-start">
        <div className="flex flex-col gap-6 xl:col-span-3">
          <SectionCard
            surface
            title="Account identity"
            description="This name appears in your dashboard, account menu, and shared trade context."
          >
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <label htmlFor={usernameId} className="text-xs font-medium text-muted-foreground">
                    Username
                  </label>
                  <Input
                    id={usernameId}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Email</span>
                  <p className="flex h-8 min-w-0 items-center rounded-lg border border-border bg-muted px-2.5 text-sm text-foreground">
                    <span className="truncate">{user?.email || 'No email linked'}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Keep the display name short so it fits collapsed navigation and shared trade cards.
                </p>
                <Button type="submit" disabled={savingName} className="w-full sm:w-auto">
                  {savingName ? 'Saving…' : 'Save username'}
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            surface
            title="Password"
            description={
              canChangePassword
                ? 'Use a strong password with at least 8 characters.'
                : 'Your account uses a social login provider, so password changes are handled by that provider.'
            }
          >
            <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
              <fieldset
                disabled={!canChangePassword || savingPassword}
                className="grid grid-cols-1 gap-4 disabled:opacity-50 lg:grid-cols-3"
              >
                <PasswordInput
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  autoComplete="current-password"
                />
                <PasswordInput
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />
              </fieldset>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  You may be asked to sign in again before sensitive security changes are accepted.
                </p>
                <Button
                  type="submit"
                  disabled={!canChangePassword || savingPassword}
                  className="w-full sm:w-auto"
                >
                  {savingPassword ? 'Updating…' : 'Update password'}
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            surface
            title="Protected workspace"
            description="Sensitive billing, password, and sync changes stay grouped away from everyday dashboard actions."
          >
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Resetting the terminal clears trades, wallet history, journal entries, and reminders.
                It cannot be undone.
              </p>
              <Button
                variant="destructive"
                disabled={resettingTerminal}
                onClick={() => setResetDialogOpen(true)}
                className="w-full shrink-0 sm:w-auto"
              >
                {resettingTerminal ? 'Resetting…' : 'Reset terminal'}
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-2">
          <SectionCard
            surface
            title="Subscription"
            description="Manage your plan, billing portal, and upgrade access."
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Plan</span>
                <span className="text-sm text-foreground">{planLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Renewal</span>
                {expiryLabel ? (
                  <span className="figure text-sm text-foreground">{expiryLabel}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Button variant="outline" onClick={openPortal}>
                  Billing portal
                </Button>
                {plan !== 'pro' && (
                  <Button onClick={() => setShowPricingModal?.(true)}>Upgrade</Button>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            surface
            title="Appearance"
            description="Adjust the dashboard color accent and light or dark mode."
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Palette</span>
                <span className="text-sm text-foreground">
                  {formatTemplateName(currentTemplate)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor={darkModeId} className="text-xs font-medium text-muted-foreground">
                  Dark mode
                </label>
                <Switch id={darkModeId} checked={!isLightMode} onCheckedChange={() => toggleTheme()} />
              </div>
              <div className="mt-1 grid grid-cols-1 gap-2">
                <Button variant="outline" onClick={() => setShowThemeSelector?.(true)}>
                  Change accent color
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            surface
            title="Broker sync"
            description="Review your MT4/MT5 connection, sync permissions, and account status."
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">Connection</span>
                <span className="text-sm text-foreground">Managed in Sync</span>
              </div>
              <Button variant="outline" onClick={() => navigate('/app/sync')}>
                Open sync settings
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={(open) => setResetDialogOpen(open)}>
        <AlertDialogContent overlayClassName="z-[70]" className="z-[80]">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the terminal?</AlertDialogTitle>
            <AlertDialogDescription>
              All trades, wallet history, journal entries, and trade reminders will be removed. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleResetTerminal}>
              Reset terminal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PasswordInput({ label, value, onChange, autoComplete }) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="pr-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground"
          onClick={() => setVisible((prev) => !prev)}
          aria-pressed={visible}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
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

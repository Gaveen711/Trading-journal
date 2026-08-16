import { useEffect, useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';

const DISMISS_KEY = 'xau-verify-banner-dismissed';

/**
 * Nudges an unverified email/password user to verify their address.
 *
 * This is the "prompt users" half of email-verification enforcement: server-side,
 * only accounts created after verification was introduced are actually gated
 * from broker sync (existing accounts are grandfathered). This banner gives any
 * unverified user a one-click path to resend the link and clear the gate, so the
 * enforcement never feels like a dead end.
 *
 * Renders nothing when there is no user, when the address is already verified,
 * or when the only sign-in method is Google — Google returns verified emails, so
 * those users are never gated and never need prompting.
 */
export function VerifyEmailBanner({ user }) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  });
  const [checking, setChecking] = useState(false);
  const [refreshedVerified, setRefreshedVerified] = useState(false);

  // Re-check verification when the tab regains focus: the user typically clicks
  // the emailed link in another tab, so a focus event is the natural moment to
  // notice they are now verified and drop the banner without a manual refresh.
  useEffect(() => {
    if (!user || user.emailVerified) return undefined;
    const recheck = async () => {
      try {
        await user.reload();
        if (user.emailVerified) setRefreshedVerified(true);
      } catch {
        // Offline or transient — leave the banner as-is.
      }
    };
    window.addEventListener('focus', recheck);
    return () => window.removeEventListener('focus', recheck);
  }, [user]);

  if (!user || user.emailVerified || refreshedVerified) return null;

  const usesPassword = Array.isArray(user.providerData)
    && user.providerData.some((provider) => provider?.providerId === 'password');
  if (!usesPassword) return null;
  if (dismissed) return null;

  const resend = async () => {
    setStatus('sending');
    try {
      await sendEmailVerification(user, { url: `${window.location.origin}/app` });
      setStatus('sent');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      setStatus('error');
    }
  };

  const recheckNow = async () => {
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) setRefreshedVerified(true);
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center px-3 py-2 text-sm bg-amber-500/12 text-amber-900 dark:text-amber-200 border-b border-amber-500/30 backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 max-w-4xl">
        <span className="font-medium">
          {status === 'sent'
            ? 'Verification email sent — check your inbox (and spam).'
            : 'Verify your email to enable broker sync and secure account recovery.'}
        </span>

        {status !== 'sent' && (
          <button
            type="button"
            onClick={resend}
            disabled={status === 'sending'}
            className="font-semibold underline underline-offset-2 disabled:opacity-60 hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
          >
            {status === 'sending' ? 'Sending…' : 'Resend email'}
          </button>
        )}

        <button
          type="button"
          onClick={recheckNow}
          disabled={checking}
          className="font-semibold underline underline-offset-2 disabled:opacity-60 hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
        >
          {checking ? 'Checking…' : "I've verified"}
        </button>

        {status === 'error' && (
          <span className="text-red-600 dark:text-red-300">Could not send — try again shortly.</span>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss for this session"
          className="ml-1 opacity-60 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer text-base leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

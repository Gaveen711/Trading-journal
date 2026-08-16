import { useEffect, useState } from 'react';
import { useAppServices } from '../app/di/AppServicesContext.jsx';
import { useToast } from '../components/ToastContext.jsx';

const FREE_SUBSCRIPTION = {
  plan: 'free', expiry: null, isTrial: false, isTrialExpired: false,
  totalTrades: 0, totalJournals: 0, analytics: null, agreedToTerms: false,
  isFromCache: false,
};

/** Maps subscription persistence into UI-ready entitlement state and actions. */
export function useSubscription(user) {
  const [subscription, setSubscription] = useState({ ...FREE_SUBSCRIPTION, isLoading: true });
  const toast = useToast();
  const { auth, subscriptionRepository: repository } = useAppServices();

  useEffect(() => {
    if (!user) {
      setSubscription({ ...FREE_SUBSCRIPTION, isLoading: false });
      return undefined;
    }
    return repository.subscribeToUserDoc(user.uid, (docSnap) => {
      if (!docSnap.exists()) {
        user.getIdToken().then((token) => fetch('/api/init-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch((error) => console.error('[useSubscription] server-side init failed:', error)));
        setSubscription({ ...FREE_SUBSCRIPTION, isLoading: true });
        return;
      }

      const data = docSnap.data();
      // With the persistent cache the first snapshot can come off disk before
      // the server confirms. Harmless for counters and the plan badge, which
      // self-correct a moment later — but the consent gate must not act on a
      // stale value, so it waits for a server-backed read.
      const isFromCache = docSnap.metadata?.fromCache ?? false;
      const expiryDate = data.planExpiry ? new Date(data.planExpiry) : null;
      const now = new Date();
      const graceMs = data.isTrial ? 0 : 4 * 24 * 60 * 60 * 1000;
      const isPro = data.plan === 'pro';
      const isPastCutoff = isPro && expiryDate && now > new Date(expiryDate.getTime() + graceMs);
      const common = {
        expiry: data.planExpiry || null,
        totalTrades: data.totalTradesLogged || 0,
        totalJournals: data.totalJournalsLogged || 0,
        analytics: data.analytics || null,
        agreedToTerms: data.agreedToTerms || false,
        isLoading: false,
        isFromCache,
      };
      if (isPastCutoff) {
        setSubscription({ ...common, plan: 'free', isTrial: false, isTrialExpired: data.isTrial || false });
      } else if (isPro && expiryDate) {
        setSubscription({ ...common, plan: 'pro', isTrial: data.isTrial || false, isTrialExpired: false, isGracePeriod: now > expiryDate });
      } else {
        setSubscription({
          ...common,
          plan: data.plan || 'free',
          isTrial: data.isTrial || false,
          isTrialExpired: Boolean(data.isTrial && expiryDate && now > expiryDate),
        });
      }
    }, (error) => console.error('[useSubscription] snap subscription error:', error));
  }, [repository, user]);

  const startCheckout = async (planType = 'pro_monthly') => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast('You must be logged in to subscribe.', 'error');
      return;
    }
    const baseUrl = planType === 'pro_yearly'
      ? (import.meta.env.VITE_LEMON_SQUEEZY_CHECKOUT_URL_YEARLY || '')
      : (import.meta.env.VITE_LEMON_SQUEEZY_CHECKOUT_URL_MONTHLY || '');
    if (!baseUrl) {
      toast('Checkout is currently unavailable. Please try again later.', 'info');
      return;
    }
    try {
      const checkoutUrl = new URL(baseUrl);
      checkoutUrl.searchParams.set('checkout[custom][user_id]', currentUser.uid);
      if (currentUser.email) checkoutUrl.searchParams.set('checkout[email]', currentUser.email);
      window.location.href = checkoutUrl.toString();
    } catch (error) {
      console.error('Failed to construct checkout URL:', error);
      toast('Could not initiate checkout. Please contact support.', 'error');
    }
  };
  const openPortal = () => window.open('https://my.lemonsqueezy.com/billing', '_blank');
  const recordProAcceptance = async () => {
    try {
      await repository.recordProAcceptance(user.uid);
      return true;
    } catch (error) {
      console.error('Legal Acceptance Error:', error);
      toast('Failed to record legal signature. Please try again.', 'error');
      return false;
    }
  };
  const agreeToTerms = async () => {
    try {
      await repository.agreeToTerms(user.uid);
    } catch (error) {
      console.error('Agreement Error:', error);
      toast('Failed to process agreement. Please check your connection.', 'error');
    }
  };

  return { ...subscription, startCheckout, openPortal, agreeToTerms, recordProAcceptance };
}

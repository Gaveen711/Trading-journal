import { Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { useSubscription } from '../hooks/useSubscription.js';
import { useOnboarding } from '../features/onboarding/hooks/useOnboarding.js';
import { AppServicesProvider } from './di/AppServicesContext.jsx';
import { AuthenticatedSessionProvider, useSessionWallet } from './di/AuthenticatedSessionContext.jsx';
import { AuthenticatedOverlays } from './components/AuthenticatedOverlays.jsx';
import { AuthenticatedRoutes } from './routing/AuthenticatedRoutes.jsx';
import '../styles/auth.css';

const PUBLIC_LEGAL_PATHS = new Set([
  '/privacy', '/pricing', '/contact', '/terms-and-conditions', '/refund-policy',
]);

/** Lazily creates the authenticated dependency graph after the protected chunk loads. */
export function AuthenticatedApp({ user }) {
  return (
    <AppServicesProvider>
      <AuthenticatedSessionProvider user={user}>
        <AuthenticatedAppContent user={user} />
      </AuthenticatedSessionProvider>
    </AppServicesProvider>
  );
}

/** Authenticated application orchestrator: subscription, routes and global overlays. */
function AuthenticatedAppContent({ user }) {
  const [pricing, setPricing] = useState(false);
  const [brokerSyncUpsell, setBrokerSyncUpsell] = useState(false);
  const subscription = useSubscription(user);
  // Same wallet instance the dashboard renders — onboarding's write must be the
  // balance the sidebar shows.
  const { updateBalance } = useSessionWallet();
  const toast = useToast();
  const location = useLocation();
  const onboarding = useOnboarding({ updateBalance, toast });
  const modalState = {
    pricing,
    brokerSyncUpsell,
    closePricing: () => setPricing(false),
    closeBrokerSyncUpsell: () => setBrokerSyncUpsell(false),
  };
  const actions = {
    openPricing: () => setPricing(true),
    openBrokerSyncUpsell: () => setBrokerSyncUpsell(true),
  };
  // `isFromCache` keeps the modal from flashing at a user who already agreed on
  // another device: a disk-cached `agreedToTerms: false` is not proof.
  const showConsent = !subscription.agreedToTerms
    && !subscription.isLoading
    && !subscription.isFromCache
    && !PUBLIC_LEGAL_PATHS.has(location.pathname);

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <AuthenticatedRoutes user={user} subscription={subscription} actions={actions} />
        </Suspense>
      </ErrorBoundary>
      <AuthenticatedOverlays modalState={modalState} onboarding={onboarding} subscription={subscription} showConsent={showConsent} />
    </>
  );
}

import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ConsentModal } from './components/ConsentModal';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingModal } from './components/OnboardingModal';
import { PageLoader } from './components/PageLoader';
import { PricingModal } from './components/PricingModal';
import { ProFeatureUpsellModal } from './components/ProFeatureUpsellModal';
import { useToast } from './components/ToastContext';
import { useSubscription } from './hooks/useSubscription';
import { useWallet } from './hooks/useWallet';
import './styles/auth.css';

const LogTradePage = lazy(() => import('./pages/LogTradePage.jsx').then((module) => ({ default: module.LogTradePage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx').then((module) => ({ default: module.HistoryPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx').then((module) => ({ default: module.CalendarPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx').then((module) => ({ default: module.AnalyticsPage })));
const JournalPage = lazy(() => import('./pages/JournalPage.jsx').then((module) => ({ default: module.JournalPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then((module) => ({ default: module.SettingsPage })));
const EASetup = lazy(() => import('./components/EASetup').then((module) => ({ default: module.default })));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess.jsx').then((module) => ({ default: module.CheckoutSuccess })));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel.jsx').then((module) => ({ default: module.CheckoutCancel })));

export function AuthenticatedApp({ user }) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBrokerSyncUpsell, setShowBrokerSyncUpsell] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const {
    plan, expiry, isTrial, isTrialExpired, totalTrades, totalJournals, analytics,
    agreedToTerms, isLoading: isSubLoading, startCheckout, openPortal,
    agreeToTerms, recordProAcceptance,
  } = useSubscription(user);
  const { updateBalance } = useWallet(user);
  const toast = useToast();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('xau-onboarded')) return undefined;
    const timer = window.setTimeout(() => setShowOnboarding(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('xau-onboarded', '1');
    setShowOnboarding(false);
  };

  const completeOnboarding = async (value) => {
    const startingBalance = Number(value);
    if (!Number.isNaN(startingBalance) && startingBalance > 0) {
      await updateBalance(Number(startingBalance.toFixed(2)));
    }
    localStorage.setItem('xau-onboarded', '1');
    setShowOnboarding(false);
    toast('Welcome! Log your first trade below.', 'success');
  };

  const isPublicPage = ['/privacy', '/pricing', '/contact', '/terms-and-conditions', '/refund-policy', '/the-story'].includes(location.pathname);

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<DashboardLayout user={user} analytics={analytics} plan={plan} expiry={expiry} isTrial={isTrial} isTrialExpired={isTrialExpired} totalTrades={totalTrades} totalJournals={totalJournals} setShowPricingModal={setShowPricingModal} openBrokerSyncUpsell={() => setShowBrokerSyncUpsell(true)} openPortal={openPortal} />}>
              <Route index element={<LogTradePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="sync" element={<EASetup />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="checkout-success" element={<CheckoutSuccess />} />
              <Route path="checkout-cancel" element={<CheckoutCancel />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {showPricingModal && <PricingModal plan={plan} expiry={expiry} isTrial={isTrial} isTrialExpired={isTrialExpired} onSubscribe={startCheckout} recordProAcceptance={recordProAcceptance} onClose={() => setShowPricingModal(false)} />}
      {showBrokerSyncUpsell && <ProFeatureUpsellModal feature="broker-sync" plan={plan} onSubscribe={startCheckout} recordProAcceptance={recordProAcceptance} onClose={() => setShowBrokerSyncUpsell(false)} />}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} onClose={dismissOnboarding} />}
      {!agreedToTerms && !isSubLoading && !isPublicPage && <ConsentModal onAgree={agreeToTerms} />}
    </>
  );
}

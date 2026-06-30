import { useState, useEffect, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { useToast } from './components/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useSubscription } from './hooks/useSubscription';
import { useWallet } from './hooks/useWallet';
import { ErrorBoundary } from './components/ErrorBoundary';

import { PricingModal } from './components/PricingModal';
import { ProFeatureUpsellModal } from './components/ProFeatureUpsellModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ConsentModal } from './components/ConsentModal';
import { PageSEO } from './components/PageSEO';

// Lazy load pages for performance
const LogTradePage = lazy(() => import('./pages/LogTradePage.jsx').then(m => ({ default: m.LogTradePage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx').then(m => ({ default: m.HistoryPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx').then(m => ({ default: m.CalendarPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx').then(m => ({ default: m.AnalyticsPage })));
const JournalPage = lazy(() => import('./pages/JournalPage.jsx').then(m => ({ default: m.JournalPage })));
const EASetup = lazy(() => import('./components/EASetup').then(m => ({ default: m.default })));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess.jsx').then(m => ({ default: m.CheckoutSuccess })));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel.jsx').then(m => ({ default: m.CheckoutCancel })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.jsx').then(m => ({ default: m.TermsOfServicePage })));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage.jsx').then(m => ({ default: m.RefundPolicyPage })));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx').then(m => ({ default: m.PricingPage })));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx').then(m => ({ default: m.ContactPage })));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const TheStoryPage = lazy(() => import('./pages/TheStoryPage.jsx'));
const Login = lazy(() => import('./Login.jsx'));

const PageLoader = ({ text = "Syncing Terminal" }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
    <div className="relative">
      <div className="absolute inset-0 bg-[#007CFF]/10 blur-3xl rounded-full" />
      <div className="loader-wrapper relative z-10 animate-in fade-in duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="380" height="76" className="inline-block select-none max-w-full">
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" y2={0} x2={600} y1={0} x1={0} id="loader-grad">
              <stop stopColor="#973BED" offset="0%" />
              <stop stopColor="#007CFF" offset="33%" />
              <stop stopColor="#00E0ED" offset="66%" />
              <stop stopColor="#00DA72" offset="100%" />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="'Poppins', 'Montserrat', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="54"
            letterSpacing="8"
            stroke="url(#loader-grad)"
            strokeWidth="3.5"
            fill="none"
            className="dash-text"
            pathLength="360"
          >
            XAU JOURNAL
          </text>
        </svg>
      </div>
    </div>
    {text && text !== "Syncing Terminal" && (
      <div className="flex flex-col items-center gap-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{text}</p>
      </div>
    )}
  </div>
);

function AuthenticatedApp({ user }) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBrokerSyncUpsell, setShowBrokerSyncUpsell] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { plan, expiry, isTrial, isTrialExpired, totalTrades, totalJournals, agreedToTerms, isLoading: isSubLoading, startCheckout, openPortal, agreeToTerms, recordProAcceptance } = useSubscription(user);
  const { updateBalance } = useWallet(user);
  const toast = useToast();

  useEffect(() => {
    if (!localStorage.getItem('xau-onboarded')) {
      setTimeout(() => setShowOnboarding(true), 400);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('xau-onboarded', '1');
    setShowOnboarding(false);
  };

  const completeOnboarding = async (val) => {
    const startingBalance = Number(val);
    if (!Number.isNaN(startingBalance) && startingBalance > 0) {
      const newBalance = Number(startingBalance.toFixed(2));
      await updateBalance(newBalance);
    }
    localStorage.setItem('xau-onboarded', '1');
    setShowOnboarding(false);
    toast('Welcome! Log your first trade below.', 'success');
  };

  const location = useLocation();
  const isPublicPage = ['/privacy', '/pricing', '/contact', '/terms-and-conditions', '/refund-policy', '/the-story'].includes(location.pathname);

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<DashboardLayout user={user} plan={plan} expiry={expiry} isTrial={isTrial} isTrialExpired={isTrialExpired} totalTrades={totalTrades} totalJournals={totalJournals} setShowPricingModal={setShowPricingModal} openBrokerSyncUpsell={() => setShowBrokerSyncUpsell(true)} openPortal={openPortal} />}>
              <Route index element={<LogTradePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="sync" element={<EASetup />} />
              <Route path="checkout-success" element={<CheckoutSuccess />} />
              <Route path="checkout-cancel" element={<CheckoutCancel />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {showPricingModal && <PricingModal plan={plan} expiry={expiry} isTrial={isTrial} isTrialExpired={isTrialExpired} onSubscribe={startCheckout} recordProAcceptance={recordProAcceptance} onClose={() => setShowPricingModal(false)} />}
      {showBrokerSyncUpsell && (
        <ProFeatureUpsellModal
          feature="broker-sync"
          plan={plan}
          onSubscribe={startCheckout}
          recordProAcceptance={recordProAcceptance}
          onClose={() => setShowBrokerSyncUpsell(false)}
        />
      )}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} onClose={dismissOnboarding} />}
      {!agreedToTerms && !isSubLoading && !isPublicPage && <ConsentModal onAgree={agreeToTerms} />}
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const styleId = 'global-scroll-reveal-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .scroll-reveal-text {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }
        .scroll-reveal-text.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    const isPublicPage = ['/', '/home', '/pricing', '/contact', '/privacy', '/terms-and-conditions', '/refund-policy', '/the-story'].includes(location.pathname);
    if (!isPublicPage) return;

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('h1, h2, h3, p, .prose p');
      elements.forEach(el => {
        if (
          el.closest('.framer-motion') || 
          el.closest('#features') ||
          el.closest('.step-card') ||
          el.closest('#scale-timeline-container') ||
          el.closest('.reveal-up') ||
          el.closest('.xj-split-h2') ||
          el.closest('.xj-manifesto-list') ||
          el.closest('.xj-section-label') ||
          el.closest('.xj-stat-num') ||
          el.classList.contains('char') || 
          el.classList.contains('scroll-reveal-text') ||
          el.closest('footer') ||
          el.closest('header') ||
          el.tagName === 'A'
        ) {
          return;
        }
        el.classList.add('scroll-reveal-text');
        observer.observe(el);
      });
    }, 450);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setAuthError(true);
    }, 15000);

    const unsubscribe = onAuthStateChanged(auth,
      (currentUser) => {
        clearTimeout(timeout);

        setUser(currentUser);
        setLoading(false);
        setAuthError(false);
        if (currentUser) {
          localStorage.setItem('xau-auth-hint', 'true');
        } else {
          localStorage.removeItem('xau-auth-hint');
        }
      },
      (error) => {
        console.error("Auth Failure:", error);
        setAuthError(true);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [loading]);

  return (
    <ErrorBoundary>
      <PageSEO />
      <Suspense fallback={<PageLoader />}>
        {authError ? (
          <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center border border-primary/20 relative">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain grayscale opacity-50 relative z-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-gradient uppercase tracking-tight">Sync Failure</h1>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                  The terminal failed to synchronize with the secure cloud. Please check your connection.
                </p>
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl bg-muted border border-border/50 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted/80 active:scale-95 transition-all text-foreground/70">
                Reconnect Terminal
              </button>
            </div>
          </div>
        ) : loading ? (
          localStorage.getItem('xau-auth-hint') === 'true' ? (
            <PageLoader text="Restoring Secure Session" />
          ) : (
            <PageLoader />
          )
        ) : (
          <Routes>
            <Route path="/" element={user ? <Navigate to="/app" /> : <LandingPage />} />
            <Route path="/home" element={user ? <Navigate to="/app" /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/app" /> : <Login />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsOfServicePage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/the-story" element={<TheStoryPage />} />
            <Route path="/app/*" element={user ? <AuthenticatedApp user={user} /> : <Navigate to="/login?mode=signin" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

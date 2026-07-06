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
import { PublicNavbar } from './components/PublicNavbar';

// Lazy load pages for performance
const LogTradePage = lazy(() => import('./pages/LogTradePage.jsx').then(m => ({ default: m.LogTradePage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx').then(m => ({ default: m.HistoryPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx').then(m => ({ default: m.CalendarPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx').then(m => ({ default: m.AnalyticsPage })));
const JournalPage = lazy(() => import('./pages/JournalPage.jsx').then(m => ({ default: m.JournalPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then(m => ({ default: m.SettingsPage })));
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

const PUBLIC_NAVBAR_PATHS = new Set(['/', '/home', '/pricing', '/contact', '/privacy', '/terms-and-conditions', '/refund-policy', '/the-story']);

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
              <Route path="settings" element={<SettingsPage />} />
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

function useScrollProgress(pathname) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      setScrollProgress(progress);
    };
    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    const settleId = window.setTimeout(updateProgress, 260);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.clearTimeout(settleId);
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [pathname]);

  return scrollProgress;
}

function useGlobalInteractions(pathname) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let observer;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipSelector = 'header, footer, [role="dialog"], .Toastify, .dashboard-sidebar, .story-page, .xau-page, .xau-scroll-top, .site-scroll-top, [data-ux-skip="true"]';
    const shouldSkip = (element) => Boolean(
      element.closest(skipSelector) ||
      element.closest('[aria-hidden="true"]') ||
      element.closest('svg')
    );
    const clearUxState = (element) => {
      delete element.dataset.uxCard;
      delete element.dataset.uxRow;
      delete element.dataset.uxReveal;
      element.style.removeProperty('--ux-index');
    };

    const frameId = window.requestAnimationFrame(() => {
      const main = document.querySelector('main, [role="main"]');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.classList.remove('ux-route-enter');
        if (!main.classList.contains('story-page') && !main.classList.contains('xau-page')) {
          void main.offsetWidth;
          main.classList.add('ux-route-enter');
        }

        if (document.body.dataset.uxHasMounted === 'true') {
          main.focus({ preventScroll: true });
        }
        document.body.dataset.uxHasMounted = 'true';
      }

      const controlSelector = 'button, a[href], summary, [role="button"], input[type="checkbox"], input[type="radio"]';
      document.querySelectorAll(controlSelector).forEach((control) => {
        if (control.matches('[disabled], [aria-disabled="true"]')) return;
        control.dataset.uxControl = 'true';
      });

      const cardSelector = [
        'main .card-premium',
        'main .apple-glass-panel',
        'main .xau-card',
        'main .xau-panel',
        'main .xau-soft',
        'main .story-product-panel',
        'main .story-stage-step',
        'main article',
        'main form'
      ].join(',');

      document.querySelectorAll(cardSelector).forEach((card) => {
        if (shouldSkip(card)) {
          clearUxState(card);
          return;
        }
        card.dataset.uxCard = 'true';
      });

      const rowSelector = 'main tbody tr, main .xau-row, main ul.divide-y > li, main ol.divide-y > li';
      document.querySelectorAll(rowSelector).forEach((row) => {
        if (shouldSkip(row)) {
          clearUxState(row);
          return;
        }
        row.dataset.uxRow = 'true';
      });

      const revealSelector = [
        'main section',
        'main article',
        'main form',
        'main .card-premium',
        'main .apple-glass-panel',
        'main .xau-card',
        'main .xau-panel',
        'main .xau-soft',
        'main .story-reveal',
        'main .story-product-panel',
        'main tbody tr',
        'main ul.divide-y > li',
        'main ol.divide-y > li'
      ].join(',');

      const revealItems = [...new Set(Array.from(document.querySelectorAll(revealSelector)))]
        .filter((item) => {
          if (shouldSkip(item)) {
            clearUxState(item);
            return false;
          }
          return true;
        });

      revealItems.forEach((item, index) => {
        item.style.setProperty('--ux-index', String(Math.min(index % 8, 7)));
        item.dataset.uxReveal = reducedMotion ? 'visible' : 'pending';
      });

      if (reducedMotion || typeof IntersectionObserver === 'undefined') {
        revealItems.forEach((item) => {
          item.dataset.uxReveal = 'visible';
        });
        return;
      }

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.uxReveal = 'visible';
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

      revealItems.forEach((item) => observer.observe(item));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (observer) observer.disconnect();
    };
  }, [pathname]);
}
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const location = useLocation();
  const scrollProgress = useScrollProgress(location.pathname);
  const showPublicNavbarDuringLoad = PUBLIC_NAVBAR_PATHS.has(location.pathname);
  const publicPageLoader = (text) => (
    <>
      <PublicNavbar />
      <PageLoader text={text} />
    </>
  );
  useGlobalInteractions(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const styleId = 'global-heading-reveal-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .heading-text-reveal {
          --heading-reveal-step: 34ms;
          opacity: 0;
          transform: translateY(18px);
          filter: blur(7px);
          transition: opacity 560ms cubic-bezier(0.16, 1, 0.3, 1), transform 680ms cubic-bezier(0.16, 1, 0.3, 1), filter 680ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity, filter;
        }
        .heading-text-reveal .heading-reveal-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(0.72em) rotateX(18deg);
          transform-origin: 50% 100%;
          filter: blur(5px);
          transition: opacity 520ms cubic-bezier(0.16, 1, 0.3, 1), transform 660ms cubic-bezier(0.16, 1, 0.3, 1), filter 660ms cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: calc(var(--word-index, 0) * var(--heading-reveal-step));
          will-change: transform, opacity, filter;
        }
        .heading-text-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
        .heading-text-reveal.revealed .heading-reveal-word {
          opacity: 1;
          transform: translateY(0) rotateX(0deg);
          filter: blur(0);
        }
        :is(.aurora-text, .xau-gradient, .xau-ink-highlight, .xau-heading-gooey, .story-gradient-word, .text-gradient) .heading-reveal-word {
          background: inherit;
          background-size: inherit;
          background-position: inherit;
          background-repeat: inherit;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        @media (prefers-reduced-motion: reduce) {
          .heading-text-reveal,
          .heading-text-reveal .heading-reveal-word {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            transition: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const splitHeadingText = (heading) => {
      if (heading.dataset.headingRevealReady === 'true') return;

      let wordIndex = 0;
      const splitNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          const parts = node.textContent.split(/(\s+)/);
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
              return;
            }
            const word = document.createElement('span');
            word.className = 'heading-reveal-word';
            word.style.setProperty('--word-index', wordIndex);
            word.textContent = part;
            wordIndex += 1;
            fragment.appendChild(word);
          });
          node.replaceWith(fragment);
          return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches('script, style, svg, img, input, textarea, button, .aurora-text, .xau-gradient, .xau-ink-highlight, .xau-heading-gooey, .story-gradient-word, .text-gradient')) return;
        Array.from(node.childNodes).forEach(splitNode);
      };

      Array.from(heading.childNodes).forEach(splitNode);
      heading.dataset.headingRevealReady = 'true';
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px'
    });

    const timer = setTimeout(() => {
      const headings = document.querySelectorAll('main h1, main h2, [role="main"] h1, [role="main"] h2');
      headings.forEach(heading => {
        if (
          heading.dataset.headingRevealSkip === 'true' ||
          heading.classList.contains('heading-text-reveal') ||
          heading.closest('header') ||
          heading.closest('footer') ||
          heading.closest('[role="dialog"]') ||
          heading.closest('.Toastify') ||
          heading.closest('.xau-metric') ||
          heading.closest('.xau-row') ||
          heading.closest('[aria-hidden="true"]')
        ) {
          return;
        }

        splitHeadingText(heading);
        heading.classList.add('heading-text-reveal');
        observer.observe(heading);
      });
    }, 120);

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
      <div className="ux-scroll-progress" style={{ '--ux-scroll-progress': scrollProgress }} aria-hidden="true" />
      <Suspense fallback={showPublicNavbarDuringLoad ? publicPageLoader() : <PageLoader />}>
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
            showPublicNavbarDuringLoad ? publicPageLoader("Restoring Secure Session") : <PageLoader text="Restoring Secure Session" />
          ) : (
            showPublicNavbarDuringLoad ? publicPageLoader() : <PageLoader />
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

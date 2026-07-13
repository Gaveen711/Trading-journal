import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseAuth.js";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { ErrorBoundary } from './components/ErrorBoundary';
import { PageSEO } from './components/PageSEO';
import { PublicNavbar } from './components/PublicNavbar';
import { PageLoader } from './components/PageLoader';
import { observeRouteWebVitals } from './lib/webVitals';

// Lazy load pages for performance
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.jsx').then(m => ({ default: m.TermsOfServicePage })));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage.jsx').then(m => ({ default: m.RefundPolicyPage })));
const PricingPage = lazy(() => import('./pages/PricingPage.jsx').then(m => ({ default: m.PricingPage })));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx').then(m => ({ default: m.ContactPage })));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const TheStoryPage = lazy(() => import('./pages/TheStoryPage.jsx'));
const Login = lazy(() => import('./Login.jsx'));
const AuthenticatedApp = lazy(() => import('./AuthenticatedApp.jsx').then((module) => ({ default: module.AuthenticatedApp })));

const PUBLIC_NAVBAR_PATHS = new Set(['/', '/home', '/pricing', '/contact', '/privacy', '/terms-and-conditions', '/refund-policy', '/the-story']);

function ScrollProgress({ pathname }) {
  const progressRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      progressRef.current?.style.setProperty('--ux-scroll-progress', progress);
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

  return <div ref={progressRef} className="ux-scroll-progress" aria-hidden="true" />;
}

function useGlobalInteractions(pathname) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let observer;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipSelector = 'header, footer, [role="dialog"], .Toastify, .dashboard-sidebar, .story-page, .xau-page, .xjs-page, .qgs-page, .xau-scroll-top, .site-scroll-top, [data-ux-skip="true"]';
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
        const ownsRouteMotion = Boolean(
          main.matches('[data-ux-skip="true"], .story-page, .xau-page, .qgs-page') ||
          main.closest('.xjs-page, .qgs-page')
        );
        if (!ownsRouteMotion) {
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

  useEffect(() => observeRouteWebVitals(location.pathname), [location.pathname]);
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
    const timeout = setTimeout(() => {
      setAuthError(true);
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
  }, []);

  return (
    <ErrorBoundary>
      <PageSEO />
      <ScrollProgress pathname={location.pathname} />
      <Suspense fallback={showPublicNavbarDuringLoad ? publicPageLoader() : <PageLoader />}>
        {authError && !showPublicNavbarDuringLoad ? (
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
        ) : loading && !showPublicNavbarDuringLoad ? (
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

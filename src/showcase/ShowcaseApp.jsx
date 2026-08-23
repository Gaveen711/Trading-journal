/* ————————————————————————————————————————————————————————————
   The real dashboard, mounted on in-memory repositories seeded with the
   showcase dataset. Dev-only: AppRoutes renders it for `/app/*` when no one
   is signed in and the tab has opted in (`/app?showcase=1`, or the
   `xau-showcase` session flag the capture script sets).

   Mirrors AuthenticatedApp minus the overlays — no onboarding, consent,
   pricing or verify-email banner can appear over a capture — and forces the
   dark theme with the gold accent so the shots sit on the public site's
   ground. `window.__showcaseReady` flips to true once the data has landed,
   which is what scripts/capture-shots.mjs waits for.
   ———————————————————————————————————————————————————————————— */
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { Chart } from 'chart.js';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { PageLoader } from '../components/PageLoader.jsx';
import { useAppTheme } from '../hooks/useAppTheme.js';
import { useSubscription } from '../hooks/useSubscription.js';
import { AppServicesProvider } from '../app/di/AppServicesContext.jsx';
import { AuthenticatedSessionProvider } from '../app/di/AuthenticatedSessionContext.jsx';
import { createAppServices } from '../app/di/createAppServices.js';
import { AuthenticatedRoutes } from '../app/routing/AuthenticatedRoutes.jsx';
import { DEMO_DATASET } from './demoData.js';
import { fakeAuth, showcaseUser } from './fakeAuth.js';
import { createInMemoryRepositories } from './inMemoryRepositories.js';
import '../styles/auth.css';

// Same key AppRoutes reads; set here so in-app navigation keeps the showcase
// mounted after the `?showcase=1` query is gone.
const SHOWCASE_FLAG = 'xau-showcase';
// The accent the captures use — a real option from the accent picker.
const SHOWCASE_TEMPLATE = 'royal-gold';

// Every chart lands in its final state on the first frame.
Chart.defaults.animation = false;

const NO_ACTIONS = Object.freeze({ openPricing: () => {}, openBrokerSyncUpsell: () => {} });

function createShowcaseServices() {
  const { store, ...repositories } = createInMemoryRepositories(DEMO_DATASET);
  return { store, services: createAppServices({ auth: fakeAuth, ...repositories }) };
}

export function ShowcaseApp() {
  const [{ services, store }] = useState(createShowcaseServices);
  return (
    <AppServicesProvider services={services}>
      <AuthenticatedSessionProvider user={showcaseUser}>
        <ShowcaseContent store={store} />
      </AuthenticatedSessionProvider>
    </AppServicesProvider>
  );
}

function ShowcaseContent({ store }) {
  const subscription = useSubscription(showcaseUser);
  const { isLightMode, toggleTheme, currentTemplate, setTemplate } = useAppTheme();
  const delivered = useSyncExternalStore(store.subscribeReady, store.isReady);

  // One push at mount, not a sync: a dev who flips the theme afterwards keeps it.
  useEffect(() => {
    window.sessionStorage.setItem(SHOWCASE_FLAG, '1');
    if (isLightMode) toggleTheme();
    if (currentTemplate !== SHOWCASE_TEMPLATE) setTemplate(SHOWCASE_TEMPLATE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (delivered && !subscription.isLoading) window.__showcaseReady = true;
  }, [delivered, subscription.isLoading]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AuthenticatedRoutes user={showcaseUser} subscription={subscription} actions={NO_ACTIONS} />
      </Suspense>
    </ErrorBoundary>
  );
}

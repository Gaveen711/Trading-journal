import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthSyncFailure } from './app/components/AuthSyncFailure.jsx';
import { ScrollProgress } from './app/experience/ScrollProgress.jsx';
import { useRouteExperience } from './app/experience/useRouteExperience.js';
import { AppRoutes, PUBLIC_NAVBAR_PATHS } from './app/routing/AppRoutes.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { PageLoader } from './components/PageLoader.jsx';
import { PageSEO } from './components/PageSEO.jsx';
import { PublicNavbar } from './components/PublicNavbar.jsx';
import { hasPersistedAuthHint, useAuthSession } from './features/auth/hooks/useAuthSession.js';

/** Root UI shell. Session policy, routing and route effects live in dedicated modules. */
function App() {
  const location = useLocation();
  const { user, isLoading, hasError } = useAuthSession();
  const isPublicRoute = PUBLIC_NAVBAR_PATHS.has(location.pathname);
  useRouteExperience(location.pathname);

  const publicLoader = (text) => (
    <><PublicNavbar /><PageLoader text={text} /></>
  );
  const fallback = isPublicRoute ? publicLoader() : <PageLoader />;

  let content = <AppRoutes user={user} />;
  if (hasError && !isPublicRoute) content = <AuthSyncFailure />;
  else if (isLoading && !isPublicRoute) {
    content = hasPersistedAuthHint() ? <PageLoader text="Restoring Secure Session" /> : <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <PageSEO />
      <ScrollProgress pathname={location.pathname} />
      <Suspense fallback={fallback}>{content}</Suspense>
    </ErrorBoundary>
  );
}

export default App;

import { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthSyncFailure } from './app/components/AuthSyncFailure.jsx';
import { LinkPeek } from './app/experience/LinkPeek.jsx';
import { ScrollProgress } from './app/experience/ScrollProgress.jsx';
import { useRouteExperience } from './app/experience/useRouteExperience.js';
import { AppRoutes, isPublicNavbarPath } from './app/routing/AppRoutes.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { PageLoader } from './components/PageLoader.jsx';
import { PageSEO } from './components/PageSEO.jsx';
import { MaintenanceNotice } from './components/MaintenanceNotice.jsx';
import { PublicNavSkeleton } from './components/PublicNavSkeleton.jsx';
import { BackgroundPixelStars } from './components/ui/BackgroundPixelStars.jsx';
import { hasPersistedAuthHint, useAuthSession } from './features/auth/hooks/useAuthSession.js';

function starfieldModeForPath(pathname) {
  if (pathname.startsWith('/app')) return 'terminal';
  if (pathname === '/login') return 'login';
  return 'public';
}

/** Root UI shell. Session policy, routing and route effects live in dedicated modules. */
function App() {
  const location = useLocation();
  const { user, isLoading, hasError } = useAuthSession();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadStatus = async () => {
      try {
        const response = await fetch('/api/status', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) return;
        const status = await response.json();
        setMaintenanceMode(status?.maintenanceMode === true);
      } catch (error) {
        if (error?.name !== 'AbortError') console.warn('Public availability status could not refresh.');
      }
    };
    void loadStatus();
    const interval = window.setInterval(loadStatus, 30_000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);
  const isPublicRoute = isPublicNavbarPath(location.pathname);
  const starfieldMode = starfieldModeForPath(location.pathname);
  useRouteExperience(location.pathname);

  const publicLoader = (text) => (
    <><PublicNavSkeleton /><PageLoader text={text} /></>
  );
  const fallback = isPublicRoute ? publicLoader() : <PageLoader />;

  let content = <AppRoutes user={user} />;
  if (hasError && !isPublicRoute) content = <AuthSyncFailure />;
  else if (isLoading && !isPublicRoute) {
    content = hasPersistedAuthHint() ? <PageLoader text="Restoring Secure Session" /> : <PageLoader />;
  }

  if (maintenanceMode) return <MaintenanceNotice />;

  return (
    <div className={`app-starfield app-starfield--${starfieldMode}`}>
      <BackgroundPixelStars />
      <div className="app-starfield__content">
        <ErrorBoundary>
          <PageSEO />
          <ScrollProgress pathname={location.pathname} />
          <Suspense fallback={fallback}>{content}</Suspense>
          <LinkPeek />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;

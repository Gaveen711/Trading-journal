import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AdminShell, LoadingState } from './components';
import { AdminLogin, AuthProvider, RequireAdmin, useAuth } from './auth';

const OverviewPage = lazy(async () => ({ default: (await import('./pages')).OverviewPage }));
const UsersPage = lazy(async () => ({ default: (await import('./pages')).UsersPage }));
const UserDetailPage = lazy(async () => ({ default: (await import('./pages')).UserDetailPage }));
const SubscriptionsPage = lazy(async () => ({ default: (await import('./pages')).SubscriptionsPage }));
const AnalyticsPage = lazy(async () => ({ default: (await import('./pages')).AnalyticsPage }));
const PaymentsPage = lazy(async () => ({ default: (await import('./pages')).PaymentsPage }));
const ReportsPage = lazy(async () => ({ default: (await import('./pages')).ReportsPage }));
const CouponsPage = lazy(async () => ({ default: (await import('./pages')).CouponsPage }));
const AnnouncementsPage = lazy(async () => ({ default: (await import('./pages')).AnnouncementsPage }));
const SettingsPage = lazy(async () => ({ default: (await import('./pages')).SettingsPage }));

function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOutSecurely } = useAuth();
  const operatorName = user?.displayName || user?.email || 'Admin operator';
  const initials = operatorName
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AO';

  const signOutControl = (
    <button
      type="button"
      className="admin-operator"
      onClick={() => {
        void signOutSecurely()
          .then(() => navigate('/login', { replace: true }))
          .catch(() => undefined);
      }}
    >
      <span className="admin-operator__avatar" aria-hidden="true">{initials}</span>
      <span className="admin-operator__copy">
        <strong>{operatorName}</strong>
        <span>Sign out securely</span>
      </span>
    </button>
  );

  return (
    <RequireAdmin>
      <AdminShell
        activePath={location.pathname}
        onNavigate={(href) => navigate(href)}
        operatorName={operatorName}
        operatorInitials={initials}
        footer={signOutControl}
      >
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </AdminShell>
    </RequireAdmin>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<AuthenticatedLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

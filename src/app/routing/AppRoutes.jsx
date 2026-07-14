import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const PrivacyPolicyPage = lazy(() => import('../../pages/PrivacyPolicyPage.jsx').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('../../pages/TermsOfServicePage.jsx').then((m) => ({ default: m.TermsOfServicePage })));
const RefundPolicyPage = lazy(() => import('../../pages/RefundPolicyPage.jsx').then((m) => ({ default: m.RefundPolicyPage })));
const PricingPage = lazy(() => import('../../pages/PricingPage.jsx').then((m) => ({ default: m.PricingPage })));
const ContactPage = lazy(() => import('../../pages/ContactPage.jsx').then((m) => ({ default: m.ContactPage })));
const LandingPage = lazy(() => import('../../pages/LandingPage.jsx').then((m) => ({ default: m.LandingPage })));
const TheStoryPage = lazy(() => import('../../pages/TheStoryPage.jsx'));
const Login = lazy(() => import('../../Login.jsx'));
const AuthenticatedApp = lazy(() => import('../AuthenticatedApp.jsx').then((m) => ({ default: m.AuthenticatedApp })));

// Route metadata is colocated with route definitions to keep loading policy consistent.
// eslint-disable-next-line react-refresh/only-export-components
export const PUBLIC_NAVBAR_PATHS = new Set([
  '/', '/home', '/pricing', '/contact', '/privacy', '/terms-and-conditions', '/refund-policy', '/the-story',
]);

/** URL policy is centralized here so adding a route does not grow the app shell. */
export function AppRoutes({ user }) {
  return (
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
  );
}

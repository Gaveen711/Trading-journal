import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './auth.css';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <main className="admin-auth-check" role="status" aria-live="polite">
        <span className="admin-auth-check__mark" aria-hidden="true">XAU</span>
        <span className="admin-auth-check__line" aria-hidden="true" />
        <h1>Verifying operator session</h1>
        <p>Checking the signed token and administrator claim.</p>
      </main>
    );
  }

  if (status !== 'authorized' || !user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
}

// @vitest-environment jsdom
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';

vi.mock('../../../components/layout/DashboardLayout.jsx', () => ({
  DashboardLayout: () => <><span>Dashboard shell</span><Outlet /></>,
}));
vi.mock('../../../pages/LogTradePage.jsx', () => ({
  LogTradePage: () => <span>Dashboard landing</span>,
}));

const { AuthenticatedRoutes } = await import('../AuthenticatedRoutes');

function LocationProbe() {
  return <output aria-label="Current path">{useLocation().pathname}</output>;
}

describe('AuthenticatedRoutes', () => {
  it('redirects an unknown dashboard route to the dashboard landing page', async () => {
    render(
      <MemoryRouter initialEntries={['/app/not-a-route']}>
        <Suspense fallback={<span>Loading</span>}>
          <Routes>
            <Route
              path="/app/*"
              element={(
                <AuthenticatedRoutes
                  user={{ uid: 'u1' }}
                  subscription={{ analytics: {}, plan: 'free' }}
                  actions={{}}
                />
              )}
            />
          </Routes>
          <LocationProbe />
        </Suspense>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Dashboard landing')).toBeInTheDocument();
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/app');
  });
});

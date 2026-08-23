// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { Home, Search, Settings, User } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FloatingDockNavigation } from '../FloatingDockNavigation';

const items = [
  { name: 'Home', icon: Home, to: '/app/', active: true },
  { name: 'Search', icon: Search, to: '/app/search', active: false },
  { name: 'Profile', icon: User, to: '/app/profile', active: false },
  { name: 'Settings', icon: Settings, to: '/app/settings', active: false },
];

function renderDock(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/app/']}>
      <FloatingDockNavigation items={items} {...props} />
    </MemoryRouter>
  );
}

describe('FloatingDockNavigation', () => {
  it('exposes labels and active route state to assistive technology', () => {
    renderDock();

    expect(screen.getByRole('navigation', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Search' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/app/settings');
  });

  it('magnifies the hovered item and its neighbours', () => {
    renderDock();

    const home = screen.getByRole('link', { name: 'Home' });
    const search = screen.getByRole('link', { name: 'Search' });
    const profile = screen.getByRole('link', { name: 'Profile' });

    fireEvent.mouseEnter(search);

    expect(search).toHaveStyle({ transform: 'scale(1.4)' });
    expect(home).toHaveStyle({ transform: 'scale(1.2)' });
    expect(profile).toHaveStyle({ transform: 'scale(1.2)' });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Search');
  });

  it('moves out of view when hidden', () => {
    renderDock({ visible: false });

    expect(screen.getByRole('navigation', { name: 'Dashboard' })).toHaveClass('translate-y-full');
  });
});

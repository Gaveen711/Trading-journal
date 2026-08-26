// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PublicNavbar } from '../PublicNavbar';

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  window.requestAnimationFrame = vi.fn((callback) => {
    callback();
    return 1;
  });
  window.cancelAnimationFrame = vi.fn();
});

describe('PublicNavbar mobile menu accessibility', () => {
  it('contains focus, makes the page inert, and closes back to its trigger on Escape', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PublicNavbar />
        <main><button type="button">Background action</button></main>
        <footer>Footer</footer>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: 'Open menu' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Site menu' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.querySelector('main')).toHaveAttribute('inert');
    expect(document.querySelector('main')).toHaveAttribute('aria-hidden', 'true');
    const firstMenuLink = within(dialog).getByRole('link', { name: 'Product' });
    const lastMenuControl = within(dialog).getByRole('button', { name: 'Start free' });
    await waitFor(() => expect(firstMenuLink).toHaveFocus());

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(lastMenuControl).toHaveFocus();
    await user.tab();
    expect(firstMenuLink).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(document.querySelector('main')).not.toHaveAttribute('inert');
    expect(document.querySelector('main')).not.toHaveAttribute('aria-hidden');
  });
});

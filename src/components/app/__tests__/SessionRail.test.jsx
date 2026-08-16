// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionRail, SessionGlyph } from '../SessionRail';

// Frozen instants — never the wall clock.
const TUESDAY_0800_UTC = new Date(Date.UTC(2026, 7, 4, 8, 0, 0)); // Tue 2026-08-04 08:00 UTC
const SATURDAY_1200_UTC = new Date(Date.UTC(2026, 7, 8, 12, 0, 0)); // Sat 2026-08-08 12:00 UTC

describe('app/SessionRail', () => {
  it('names exactly the open sessions for a weekday instant', () => {
    render(<SessionRail now={TUESDAY_0800_UTC} />);
    const rail = screen.getByRole('img', { name: 'Tokyo and London sessions open' });
    expect(rail.querySelectorAll('[data-session]')).toHaveLength(4);
    expect(rail.querySelector('[data-session="tok"]')).toHaveAttribute('data-state', 'live');
    expect(rail.querySelector('[data-session="lon"]')).toHaveAttribute('data-state', 'live');
    expect(rail.querySelector('[data-session="syd"]')).toHaveAttribute('data-state', 'closed');
    expect(rail.querySelector('[data-session="ny"]')).toHaveAttribute('data-state', 'ahead');
  });

  it('shows the market-closed label and zero live segments on a weekend', () => {
    render(<SessionRail now={SATURDAY_1200_UTC} />);
    const rail = screen.getByRole('img', {
      name: 'Market closed — reopens Sunday 22:00 UTC',
    });
    expect(rail.querySelectorAll('[data-state="live"]')).toHaveLength(0);
  });
});

describe('app/SessionGlyph', () => {
  it('renders decor-only (aria-hidden, no img role) when no session is stored', () => {
    const { container, rerender } = render(<SessionGlyph session="" />);
    expect(screen.queryByRole('img')).toBeNull();
    let glyph = container.querySelector('[aria-hidden="true"]');
    expect(glyph).not.toBeNull();
    expect(glyph.querySelectorAll('[data-state="off"]').length).toBeGreaterThan(0);

    rerender(<SessionGlyph session={undefined} />);
    expect(screen.queryByRole('img')).toBeNull();
    glyph = container.querySelector('[aria-hidden="true"]');
    expect(glyph).not.toBeNull();
  });

  it('marks exactly one segment for a recognized session and carries the name', () => {
    render(<SessionGlyph session="London" />);
    const glyph = screen.getByRole('img', { name: 'London session' });
    expect(glyph).toHaveAttribute('title', 'London session');
    const on = glyph.querySelectorAll('[data-state="on"]');
    expect(on).toHaveLength(1);
    expect(on[0]).toHaveAttribute('data-session', 'lon');
  });

  it('tolerates stored free-text variants like "NewYork"', () => {
    render(<SessionGlyph session="NewYork" />);
    const glyph = screen.getByRole('img', { name: 'New York session' });
    const on = glyph.querySelectorAll('[data-state="on"]');
    expect(on).toHaveLength(1);
    expect(on[0]).toHaveAttribute('data-session', 'ny');
  });

  it('marks zero segments for an unknown value and keeps the raw string in the title', () => {
    render(<SessionGlyph session="Overlap" />);
    const glyph = screen.getByTitle('Overlap');
    expect(glyph.querySelectorAll('[data-state="on"]')).toHaveLength(0);
    expect(glyph.querySelectorAll('[data-state="off"]')).toHaveLength(4);
  });
});

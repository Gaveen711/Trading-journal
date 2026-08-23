// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from '../Hero';
import { DEMO_TRADES, bestHour, formatR, formatR2, hourWindow, sessionSplit, summarise } from '../../../lib/deskDemo';

/* The hero's readouts must be derived, never typed. These assertions
   recompute each figure from the same sample record and expect the strip
   to agree — if someone hand-edits a number, this is what catches it. */

function mountHero() {
  return render(
    <MemoryRouter>
      <div className='xj'>
        <Hero />
      </div>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  // jsdom has no matchMedia; the hero only asks about motion and pointer.
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Hero', () => {
  it('renders the page’s only h1 with exactly one emphasised word', () => {
    mountHero();
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveClass('xj-h1');
    expect(headings[0].querySelectorAll('em')).toHaveLength(1);
  });

  it('points both CTAs at the real routes', () => {
    mountHero();
    expect(screen.getByRole('link', { name: /start free/i })).toHaveAttribute('href', '/login?mode=signup');
    expect(screen.getByRole('link', { name: /see pricing/i })).toHaveAttribute('href', '/pricing');
  });

  it('reads the desk clock as a live chip', () => {
    mountHero();
    const chip = document.querySelector('.xh-eyebrow .xj-live');
    expect(chip).not.toBeNull();
    expect(chip.textContent).toMatch(/is open|opens in|desk is ready/);
    expect(document.querySelector('.xh-eyebrow .xj-num').textContent).toMatch(/^\d{2}:\d{2} UTC$/);
  });

  it('derives every readout in the strip from the sample record', () => {
    mountHero();
    const strip = screen.getByRole('list', { name: /sample record/i });
    const cells = within(strip).getAllByRole('listitem');
    expect(cells.length).toBeGreaterThanOrEqual(5);
    expect(cells.length).toBeLessThanOrEqual(6);

    const stats = summarise(DEMO_TRADES);
    const split = sessionSplit();
    const london = split.find((s) => s.id === 'london');
    const asia = split.find((s) => s.id === 'asia');
    const text = strip.textContent;

    expect(text).toContain(`${stats.count} fills`);
    expect(text).toContain(`${stats.winRate}%`);
    expect(text).toContain(formatR2(stats.expectancy));
    expect(text).toContain(formatR(london.net));
    expect(text).toContain(formatR(asia.net));
    expect(text).toContain(`${hourWindow(bestHour(DEMO_TRADES).hour)} UTC`);
  });

  it('colours only the signed R figures', () => {
    mountHero();
    const strip = screen.getByRole('list', { name: /sample record/i });
    const toned = strip.querySelectorAll('.is-up, .is-down');
    expect(toned.length).toBeGreaterThan(0);
    toned.forEach((node) => expect(node.textContent).toMatch(/R$/));
  });

  it('keeps the back plates out of the accessibility tree and the front plate in it', () => {
    mountHero();
    const plates = document.querySelectorAll('.xh-plate figure');
    expect(plates).toHaveLength(3);
    expect(document.querySelector('.xh-plate--front figure').getAttribute('aria-hidden')).toBe('false');
    expect(document.querySelector('.xh-plate--mid figure').getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('.xh-plate--back figure').getAttribute('aria-hidden')).toBe('true');
    const front = document.querySelector('.xh-plate--front img');
    expect(front.getAttribute('alt')).toBeTruthy();
    expect(front.getAttribute('fetchpriority')).toBe('high');
    expect(document.querySelector('.xh-plate--front figure')).toHaveClass('xj-shot--sweep');
  });

  it('settles flat immediately under reduced motion', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    mountHero();
    expect(document.querySelector('.xh-stage').style.getPropertyValue('--xh-progress')).toBe('1');
  });
});

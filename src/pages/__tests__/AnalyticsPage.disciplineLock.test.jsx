// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsPage } from '../AnalyticsPage';

// One mutable box for everything the hoisted module factories close over.
// Factories run before the test file body, so they may only *reference* it.
const h = vi.hoisted(() => ({ context: null }));

vi.mock('react-router-dom', () => ({
  useOutletContext: () => h.context,
  useNavigate: () => vi.fn(),
}));

// The real charts need a canvas; nothing here asserts on them.
vi.mock('react-chartjs-2', () => ({ Bar: () => null }));

vi.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({ isLightMode: false, currentTemplate: 'default' }),
}));

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKeyAgo = (days) => new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

function trade(overrides) {
  return {
    id: 'seed',
    date: dayKeyAgo(1),
    direction: 'BUY',
    entry: 2400,
    exit: 2410,
    lots: 0.1,
    pnl: 0,
    outcome: 'WIN',
    ...overrides,
  };
}

function renderPage(overrides = {}) {
  h.context = {
    trades: [trade({ id: 't1', pnl: -342.1, outcome: 'LOSS' }), trade({ id: 't2', pnl: 500 })],
    analytics: null,
    isLoadingTrades: false,
    isLoadingMore: false,
    hasMoreTrades: false,
    loadAllTrades: vi.fn(async () => {}),
    walletBalance: 1000,
    // The free plan, which is what arms `isLocked = isFree && stat.index > 1`.
    plan: 'basic',
    isTrial: false,
    setShowPricingModal: vi.fn(),
    setups: [],
    setupsById: {},
    renameSetup: vi.fn(),
    mergeSetups: vi.fn(),
    archiveSetup: vi.fn(),
    deleteSetup: vi.fn(),
    disciplineViolations: [{ ruleId: 'maxTradesPerDay', tradeId: 't1' }],
    enabledRuleIds: ['maxTradesPerDay'],
    ...overrides,
  };
  return render(<AnalyticsPage />);
}

/** The rendered StatCard shell for a label, so lock/blur can be inspected. */
function statCard(label) {
  const labelNode = screen.queryByText(label);
  return labelNode ? labelNode.closest('[data-slot="card"]') : null;
}

beforeEach(() => {
  h.context = null;
});

// §4.4: discipline is a free-plan feature. This is the page where the plan lock
// is actually live — `isLocked = isFree && stat.index > 1` over the statCards
// array — so the card being a plain sibling of that array is load-bearing, not
// incidental. LogTradePage pins the same invariant on a page that has no lock
// at all; without this file the one page that *does* lock cards has nothing
// stopping a refactor from folding the card into statCards as index 6.
describe('AnalyticsPage — cost of broken rules is never plan-locked (§4.4)', () => {
  it('renders the real figure for a free user, not the redaction placeholder', () => {
    renderPage();
    const card = statCard('Cost of broken rules');
    expect(card).not.toBeNull();
    expect(card).toHaveTextContent('−$342.10');
    // StatCard renders '••••' in place of the value when `locked` is set.
    expect(card.textContent).not.toContain('••••');
  });

  it('carries no upgrade affordance and no blur, unlike the locked KPI cards', () => {
    renderPage();
    const card = statCard('Cost of broken rules');
    // A locked StatCard is a button with an "Unlock with Pro"-style aria-label.
    expect(card.tagName).not.toBe('BUTTON');
    expect(card.querySelector('button')).toBeNull();
    expect(card.className).not.toMatch(/\bblur\b/);
    expect(card.querySelector('[class*="blur"]')).toBeNull();
  });

  it('sits OUTSIDE the indexed statCards array, so no index-based lock can catch it', () => {
    const { container } = renderPage();
    const card = statCard('Cost of broken rules');
    const grid = card.parentElement;
    // The four cards the free plan does lock are index > 1 and must still be
    // redacted — proving the lock is live on this page and simply does not
    // reach the discipline card.
    for (const label of ['Expectancy', 'Average win', 'Average loss', 'Profit factor']) {
      expect(statCard(label).textContent).toContain('••••');
    }
    // …while the two free cards and the discipline card are not.
    expect(statCard('Wallet balance').textContent).not.toContain('••••');
    expect(statCard('Win rate').textContent).not.toContain('••••');
    // Same grid, different provenance: it is the LAST child, appended after the
    // mapped array rather than being a member of it.
    expect(grid.lastElementChild).toBe(card);
    expect(container.contains(card)).toBe(true);
  });

  it('is hidden outright when every discipline rule is off', () => {
    renderPage({ enabledRuleIds: [] });
    expect(statCard('Cost of broken rules')).toBeNull();
    // The plan lock is untouched by the card's absence.
    expect(statCard('Profit factor').textContent).toContain('••••');
  });

  it('stays unlocked and unredacted on a clean week, showing an unsigned $0.00', () => {
    renderPage({ disciplineViolations: [] });
    const card = statCard('Cost of broken rules');
    expect(card).toHaveTextContent('$0.00');
    expect(card).toHaveTextContent('No rule breaks this week');
    expect(card.textContent).not.toContain('••••');
    expect(card.querySelector('button')).toBeNull();
  });
});

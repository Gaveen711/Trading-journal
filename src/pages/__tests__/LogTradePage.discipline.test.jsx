// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LogTradePage } from '../LogTradePage';

// One mutable box for everything the hoisted module factories close over.
// Factories run before the test file body, so they may only *reference* it.
const h = vi.hoisted(() => ({
  context: null,
  /** What the stubbed LiveMarketWidget reports through onTickersUpdate. */
  widgetTickers: null,
  fetchSpotPrice: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useOutletContext: () => h.context,
}));

// The real chart needs a canvas; nothing here asserts on it.
vi.mock('react-chartjs-2', () => ({ Line: () => null }));

vi.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({ isLightMode: false, currentTemplate: 'default' }),
}));

// The real widget polls four spot symbols plus Yahoo and embeds a TradingView
// iframe. The stub keeps only the one thing the page reads from it — the
// onTickersUpdate callback — so the fallback-poll handshake stays observable.
vi.mock('../../components/LiveMarketWidget', async () => {
  const { useEffect } = await import('react');
  return {
    LiveMarketWidget: ({ onTickersUpdate }) => {
      useEffect(() => {
        if (h.widgetTickers) onTickersUpdate?.(h.widgetTickers);
      }, [onTickersUpdate]);
      return null;
    },
  };
});

vi.mock('../../lib/marketData', () => ({
  fetchSpotPrice: h.fetchSpotPrice,
  fetchYahooChart: vi.fn(async () => null),
  isSpotPollingPaused: () => false,
  useMarketDataHealth: () => 'ok',
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
    trades: [],
    walletBalance: 1000,
    isExpanded: false,
    setIsExpanded: () => {},
    disciplineViolations: [],
    enabledRuleIds: ['maxTradesPerDay'],
    ...overrides,
  };
  return render(<LogTradePage />);
}

/** The rendered StatCard shell for a label, so lock/blur can be inspected. */
function statCard(label) {
  const labelNode = screen.queryByText(label);
  return labelNode ? labelNode.closest('[data-slot="card"]') : null;
}

beforeEach(() => {
  h.widgetTickers = null;
  h.fetchSpotPrice.mockReset();
  h.fetchSpotPrice.mockResolvedValue(2400.5);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LogTradePage — cost of broken rules StatCard (§4.4)', () => {
  it('renders the card inside the dashboard KPI row, not some other grid', () => {
    const { container } = renderPage();
    const card = statCard('Cost of broken rules');
    expect(card).not.toBeNull();
    expect(container.querySelector('.dashboard-kpi-grid').contains(card)).toBe(true);
  });

  it('shows an unsigned $0.00 and the clean-week hint when nothing was flagged', () => {
    renderPage({ trades: [trade({ id: 't1', pnl: -120 })] });
    const card = statCard('Cost of broken rules');
    expect(card).toHaveTextContent('$0.00');
    expect(card).toHaveTextContent('No rule breaks this week');
    // Unsigned: neither a plus nor the U+2212 minus the signed formatter uses.
    expect(card.textContent).not.toMatch(/[+−]\$0\.00/);
  });

  it('shows the signed cost and the window hint when rules were broken', () => {
    renderPage({
      trades: [trade({ id: 't1', pnl: -342.1, outcome: 'LOSS' }), trade({ id: 't2', pnl: 500 })],
      disciplineViolations: [{ ruleId: 'maxTradesPerDay', tradeId: 't1' }],
    });
    const card = statCard('Cost of broken rules');
    expect(card).toHaveTextContent('−$342.10');
    expect(card).toHaveTextContent('Last 7 days');
    expect(card).not.toHaveTextContent('No rule breaks this week');
  });

  it('counts a trade flagged twice once, and ignores flags older than the window', () => {
    renderPage({
      trades: [
        trade({ id: 't1', pnl: -100, outcome: 'LOSS' }),
        trade({ id: 'old', date: dayKeyAgo(10), pnl: -900, outcome: 'LOSS' }),
      ],
      disciplineViolations: [
        { ruleId: 'maxTradesPerDay', tradeId: 't1' },
        { ruleId: 'maxRiskPerTrade', tradeId: 't1' },
        { ruleId: 'maxTradesPerDay', tradeId: 'old' },
      ],
    });
    expect(statCard('Cost of broken rules')).toHaveTextContent('−$100.00');
  });

  it('hides the card entirely when every rule is disabled', () => {
    const { container } = renderPage({
      enabledRuleIds: [],
      trades: [trade({ id: 't1', pnl: -342.1, outcome: 'LOSS' })],
      disciplineViolations: [{ ruleId: 'maxTradesPerDay', tradeId: 't1' }],
    });
    expect(statCard('Cost of broken rules')).toBeNull();
    expect(container.textContent).not.toContain('No rule breaks this week');
    // The four plan-independent KPIs are untouched by the hide.
    expect(statCard('Win rate')).not.toBeNull();
  });

  it('survives an undefined discipline context without rendering the card', () => {
    renderPage({ enabledRuleIds: undefined, disciplineViolations: undefined });
    expect(statCard('Cost of broken rules')).toBeNull();
  });

  it('is never locked and never blurred, even on a free plan', () => {
    renderPage({
      plan: 'basic',
      isTrial: false,
      trades: [trade({ id: 't1', pnl: -342.1, outcome: 'LOSS' })],
      disciplineViolations: [{ ruleId: 'maxTradesPerDay', tradeId: 't1' }],
    });
    const card = statCard('Cost of broken rules');
    // Redaction is how StatCard renders `locked`; the real figure must be there.
    expect(card).toHaveTextContent('−$342.10');
    expect(card.textContent).not.toContain('••••');
    expect(card.querySelector('button')).toBeNull();
    expect(card.className).not.toMatch(/blur/);
    expect(card.querySelector('[class*="blur"]')).toBeNull();
  });
});

describe('LogTradePage — gold price fallback poll', () => {
  it('goes through the shared market-data layer, never a hand-rolled fetch', async () => {
    const rawFetch = vi.spyOn(globalThis, 'fetch');
    await act(async () => { renderPage(); });
    expect(h.fetchSpotPrice).toHaveBeenCalledWith('XAU', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
    expect(rawFetch).not.toHaveBeenCalled();
    rawFetch.mockRestore();
  });

  it('keeps polling while LiveMarketWidget never reports a ticker', async () => {
    vi.useFakeTimers();
    await act(async () => { renderPage(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(90_000); });
    // Mount plus one per 30s interval.
    expect(h.fetchSpotPrice.mock.calls.length).toBeGreaterThan(1);
  });

  it('stops once LiveMarketWidget supplies a live XAU price, so the two do not double-poll', async () => {
    vi.useFakeTimers();
    h.widgetTickers = { xauusd: { price: 4150.56, change: -0.2, history: [4140, 4150.56] } };
    await act(async () => { renderPage(); });
    const afterMount = h.fetchSpotPrice.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(90_000); });
    expect(h.fetchSpotPrice.mock.calls.length).toBe(afterMount);
    expect(afterMount).toBeLessThanOrEqual(1);
  });
});

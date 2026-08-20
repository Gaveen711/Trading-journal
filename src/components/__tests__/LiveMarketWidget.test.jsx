// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../hooks/useAppTheme';
import { LiveMarketWidget } from '../LiveMarketWidget';
import { fetchSpotPrice, fetchYahooChart, isSpotPollingPaused } from '../../lib/marketData';

// The widget under test is all timing and state bookkeeping; the network layer it
// sits on is already covered by src/__tests__/marketData.test.js. Mocking it makes
// the poll clock the only variable in here.
vi.mock('../../lib/marketData', () => ({
  fetchSpotPrice: vi.fn(),
  fetchYahooChart: vi.fn(),
  isSpotPollingPaused: vi.fn(() => false),
}));

// Seed history[0] for XAU in the component's initial state — the baseline every
// percentage in the drift tests below is measured from.
const XAU_SEED_BASE = 4140;
const SPOT_TTL_MS = 10000;   // Cache-Control: public, s-maxage=10 on /spot-price
const TICK_MS = 12000;       // fast timeframes: first cadence that clears the TTL
const SLOW_TICK_MS = 60000;  // 1h and longer, incl. 1D/1W

/** Per-symbol spot price for the next call; tests replace it. */
let spotFor = () => null;
/** Per-symbol Yahoo payload for the next call; tests replace it. */
let yahooFor = () => null;

function yahooMeta(meta) {
  return { chart: { result: [{ meta }] } };
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  spotFor = () => null;
  yahooFor = () => null;
  isSpotPollingPaused.mockReturnValue(false);
  fetchSpotPrice.mockImplementation((symbol) => Promise.resolve(spotFor(symbol)));
  fetchYahooChart.mockImplementation((symbol) => Promise.resolve(yahooFor(symbol)));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

/** Runs pending microtasks (the mocked fetches) inside act. */
async function settle() {
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
}

/** Advances the fake clock and lets everything it woke up settle. */
async function advance(ms) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

async function mountWidget(props = {}) {
  const utils = render(
    <ThemeProvider>
      <LiveMarketWidget {...props} />
    </ThemeProvider>,
  );
  await settle(); // the mount fetchRealPrices round
  return utils;
}

/** Clicks a timeframe button and lets the effect it restarts settle. */
async function selectTimeframe(label) {
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: label })); });
  await settle();
}

/** Spot calls only, ignoring which loop made them. */
function spotCallCount() {
  return fetchSpotPrice.mock.calls.length;
}

/** The four sparkline stroke paths, in card order (xau, xag, xpt, xpd). */
function sparklinePaths(container) {
  return [...container.querySelectorAll('path[fill="none"]')].map((p) => p.getAttribute('d'));
}

describe('LiveMarketWidget poll cadence', () => {
  it('does not poll faster than the /spot-price CDN TTL on fast timeframes', async () => {
    await mountWidget();
    fetchSpotPrice.mockClear();

    // Anything inside the s-maxage window would be re-reading a byte-identical
    // CDN body. Nothing may go out before the tick cadence clears it.
    await advance(SPOT_TTL_MS);
    expect(spotCallCount()).toBe(0);

    await advance(TICK_MS - SPOT_TTL_MS - 1);
    expect(spotCallCount()).toBe(0);

    await advance(1);
    expect(spotCallCount()).toBe(4); // one round: XAU, XAG, XPT, XPD
  });

  it('backs the tick loop off to 60s on 1D, where second-by-second ticks are noise', async () => {
    const { container } = await mountWidget();

    await selectTimeframe('1D');
    // The hop armed before the click still fires on the old cadence; the new one
    // is picked up when that hop re-arms.
    await advance(TICK_MS);
    fetchSpotPrice.mockClear();

    await advance(SLOW_TICK_MS - 1);
    expect(spotCallCount()).toBe(0);

    await advance(1);
    expect(spotCallCount()).toBe(4);
    expect(container).toBeTruthy();
  });

  it('reads the timeframe from a ref, so clicking one does not reset the tick clock', async () => {
    await mountWidget();

    // 1ms short of the first tick, then a timeframe change lands.
    await advance(TICK_MS - 1);
    await selectTimeframe('5m');
    // The click restarts the slow loop (an immediate round of its own); from here
    // on, every spot call in this window belongs to the tick loop.
    fetchSpotPrice.mockClear();

    // A tick loop that listed `interval` as a dep would have been torn down and
    // rebuilt by that click, throwing away 11999ms of elapsed wait and going
    // quiet until t+24s — and a user browsing timeframes could starve it forever.
    await advance(1);
    expect(spotCallCount()).toBe(4);
  });
});

describe('LiveMarketWidget weekend gate', () => {
  it('makes no repeat polls while the market is at rest, and resumes without a remount', async () => {
    isSpotPollingPaused.mockReturnValue(true);
    await mountWidget();
    fetchSpotPrice.mockClear();
    fetchYahooChart.mockClear();

    // A full 1m-timeframe period: both the tick loop and the slow loop's repeat
    // fall inside it.
    await advance(SLOW_TICK_MS);
    expect(spotCallCount()).toBe(0);
    expect(fetchYahooChart).not.toHaveBeenCalled();

    // The loop must be dormant, not dead: it re-arms across the paused hops.
    isSpotPollingPaused.mockReturnValue(false);
    await advance(TICK_MS);
    expect(spotCallCount()).toBe(4);
  });

  it('still runs the mount fetch on a weekend so the widget shows the last close, not its seed', async () => {
    isSpotPollingPaused.mockReturnValue(true);
    spotFor = (symbol) => (symbol === 'XAU' ? 4321.5 : null);
    await mountWidget();

    expect(fetchSpotPrice).toHaveBeenCalled();
    expect(screen.getAllByText(/4,321\.500/).length).toBeGreaterThan(0);
  });
});

describe('LiveMarketWidget % baseline', () => {
  it('measures change from a pinned baseline that the history window cannot shift away', async () => {
    const { container } = await mountWidget();

    // 1D so the slow loop (24h period) cannot interleave: every write below is
    // the tick loop's.
    await selectTimeframe('1D');

    let nextXau = XAU_SEED_BASE; // first tick lands at 4141
    spotFor = (symbol) => (symbol === 'XAU' ? (nextXau += 1) : null);

    // 15 ticks: more than the 12-sample window, so the oldest seed samples —
    // including the one the baseline was read from — are shifted off.
    await advance(TICK_MS);
    for (let i = 0; i < 14; i += 1) await advance(SLOW_TICK_MS);

    expect(nextXau).toBe(4155);
    // Against the pinned 4140 baseline: +0.36%. Against a baseline re-read from
    // the shifted history[0] (4144 by now) it would read +0.27%.
    const expected = (((4155 - XAU_SEED_BASE) / XAU_SEED_BASE) * 100).toFixed(2);
    expect(expected).toBe('0.36');
    expect(screen.getAllByText(`+${expected}%`).length).toBeGreaterThan(0);
    expect(screen.queryAllByText('+0.27%')).toHaveLength(0);

    // And the window stayed bounded while doing it: 12 points is 11 curve segments.
    const [xauPath] = sparklinePaths(container);
    expect(xauPath.startsWith('M ')).toBe(true);
    expect(xauPath.match(/C/g)).toHaveLength(11);
  });
});

describe('LiveMarketWidget Yahoo payload handling', () => {
  it('survives a missing regularMarketPrice instead of poisoning badge and sparkline with NaN', async () => {
    spotFor = (symbol) => (symbol === 'XAU' ? 4200 : null);
    // Yahoo omits the field on a partial payload. `Number(undefined)` is NaN, and
    // the NaN change that produced used to be written into `base` and
    // `history[0]` — after which every tick was (price - NaN)/NaN, the badge read
    // "NaN%" and the sparkline's `d` was "M NaN NaN", i.e. invisible.
    yahooFor = () => yahooMeta({ chartPreviousClose: 4180 });

    const { container } = await mountWidget();

    expect(container.textContent).not.toContain('NaN');
    sparklinePaths(container).forEach((d) => {
      expect(d).not.toContain('NaN');
      expect(d.startsWith('M ')).toBe(true);
    });

    // The poison used to persist: a NaN baseline broke every later tick too.
    spotFor = (symbol) => (symbol === 'XAU' ? 4210 : null);
    await advance(TICK_MS);
    expect(container.textContent).not.toContain('NaN');
    expect(screen.getAllByText(/4,210\.000/).length).toBeGreaterThan(0);
  });

  it('ignores a null regularMarketPrice rather than reading it as a price of zero', async () => {
    spotFor = (symbol) => (symbol === 'XAU' ? 4200 : null);
    // Yahoo returns this between sessions. `Number(null)` is 0, so the old
    // arithmetic read it as "gold is at $0" and published a -100% day.
    yahooFor = () => yahooMeta({ regularMarketPrice: null, chartPreviousClose: 4180 });

    const { container } = await mountWidget();

    expect(screen.queryAllByText('-100%')).toHaveLength(0);
    expect(container.textContent).not.toContain('NaN');
    // No usable Yahoo quote means the change is unknown, so the last one stands.
    expect(screen.getAllByText('-0.2%').length).toBeGreaterThan(0);
  });

  it('keeps the last known change when Yahoo omits chartPreviousClose, rather than publishing 0.00%', async () => {
    spotFor = () => null;
    yahooFor = (symbol) => yahooMeta({
      regularMarketPrice: { 'GC=F': 4200, 'SI=F': 29.4, 'PL=F': 995, 'PA=F': 1028 }[symbol],
      // chartPreviousClose absent — Number(undefined) is NaN, which used to be
      // read as "no previous close" and reported as a flat 0%.
    });

    await mountWidget();

    expect(screen.queryAllByText('0%')).toHaveLength(0);
    expect(screen.getAllByText('-0.2%').length).toBeGreaterThan(0);
  });
});

describe('LiveMarketWidget lifecycle', () => {
  it('aborts in-flight requests and stops polling on unmount', async () => {
    spotFor = () => 4200;
    const { unmount } = await mountWidget();

    const signal = fetchSpotPrice.mock.calls[0][1].signal;
    expect(signal.aborted).toBe(false);
    fetchSpotPrice.mockClear();

    unmount();
    expect(signal.aborted).toBe(true);

    await advance(SLOW_TICK_MS * 2);
    expect(spotCallCount()).toBe(0);
  });

  it('drops a round that resolves after its timeframe was switched away', async () => {
    // Every spot call parks until the test resolves it by hand, so the two rounds
    // can be landed out of order on purpose.
    const resolvers = [];
    fetchSpotPrice.mockImplementation(() => new Promise((resolve) => { resolvers.push(resolve); }));

    await mountWidget();
    expect(resolvers).toHaveLength(4); // the 1m round, still in the air

    await selectTimeframe('5m');
    expect(resolvers).toHaveLength(8); // the 5m round joins it

    // The fresh round lands first.
    await act(async () => {
      [4300, 30, 1000, 1030].forEach((price, i) => resolvers[4 + i](price));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getAllByText(/4,300\.000/).length).toBeGreaterThan(0);

    // Then the round belonging to the timeframe the user already left. Its
    // controller was aborted on the way out, so it must not overwrite anything.
    await act(async () => {
      [4100, 29, 990, 1020].forEach((price, i) => resolvers[i](price));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryAllByText(/4,100\.000/)).toHaveLength(0);
    expect(screen.getAllByText(/4,300\.000/).length).toBeGreaterThan(0);
  });

  it('drops a poll that lands after unmount without a React warning', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let resolveSpot;
    fetchSpotPrice.mockImplementation(() => new Promise((resolve) => { resolveSpot = resolve; }));

    const { unmount } = await mountWidget();
    await advance(TICK_MS); // a tick is now in flight
    unmount();

    await act(async () => { resolveSpot?.(4200); await vi.advanceTimersByTimeAsync(0); });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('LiveMarketWidget state identity', () => {
  it('does not republish tickers when a poll returns the price it already had', async () => {
    spotFor = (symbol) => ({ XAU: 4200, XAG: 30, XPT: 1000, XPD: 1030 }[symbol]);
    const onTickersUpdate = vi.fn();
    await mountWidget({ onTickersUpdate });

    onTickersUpdate.mockClear();

    // Three polls, same numbers every time — the common case behind a 10s CDN
    // TTL. A fresh state object per poll re-runs every consumer memo downstream.
    await advance(TICK_MS);
    await advance(TICK_MS);
    await advance(TICK_MS);
    expect(spotCallCount()).toBeGreaterThan(0);
    expect(onTickersUpdate).not.toHaveBeenCalled();

    // A real move still gets through.
    spotFor = (symbol) => ({ XAU: 4211, XAG: 30, XPT: 1000, XPD: 1030 }[symbol]);
    await advance(TICK_MS);
    expect(onTickersUpdate).toHaveBeenCalledTimes(1);
  });
});

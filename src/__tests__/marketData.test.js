import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PROXY_DOWN_AFTER_FAILURES,
  PROXY_SKIP_WINDOW_MS,
  fetchSpotPrice,
  fetchYahooChart,
  getMarketDataHealth,
  subscribeMarketDataHealth,
  resetMarketDataHealth,
  isSpotPollingPaused,
  useMarketDataHealth,
} from '../lib/marketData.js';
import { isWeekendRestAt, isMarketClosed } from '../lib/goldSessions.js';

/**
 * Nothing here touches the network and nothing reads the wall clock: `fetch` is
 * replaced per test and every `now` is an explicit UTC epoch, so the suite gives
 * the same verdict on a CI box in UTC and a laptop in Asia/Colombo.
 *
 * The health store is a module singleton by design, so isolation is the seam the
 * module exports for exactly this: `resetMarketDataHealth()` runs before AND after
 * every test, and every subscription made in a test is torn down in afterEach.
 * Without that, one test's outage would decide the next test's verdict.
 */

const REAL_FETCH = globalThis.fetch;

const SPOT_PROXY_XAU = '/api/spot-price/XAU';
const GOLD_DIRECT_XAU = 'https://api.gold-api.com/price/XAU';

/** Fixed clock for the skip-window state machine — Wednesday 2026-07-15 12:00 UTC. */
const NOW = Date.UTC(2026, 6, 15, 12);

const unsubscribers = [];

/** Subscribes and registers the teardown, so a failing assertion cannot leak a listener. */
function subscribe(listener) {
  const unsubscribe = subscribeMarketDataHealth(listener);
  unsubscribers.push(unsubscribe);
  return unsubscribe;
}

/** Lets already-resolved promise chains (shared-request settle, health writes) drain. */
const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

function stubFetch(handler) {
  const spy = vi.fn((url, init) => handler(String(url), init ?? {}));
  globalThis.fetch = spy;
  return spy;
}

const jsonOk = (data) => Promise.resolve({ ok: true, status: 200, json: async () => data });
const httpStatus = (status) => Promise.resolve({
  ok: false,
  status,
  json: async () => ({ error: status }),
});
const networkError = () => Promise.reject(new TypeError('Failed to fetch'));

function makeAbortError() {
  const error = new Error('The operation was aborted.');
  error.name = 'AbortError';
  return error;
}

const isProxyUrl = (url) => url.startsWith('/api/');

/** Routes by destination so a test can fail one leg and succeed on the other. */
const route = ({ proxy, direct }) => (url) => (isProxyUrl(url) ? proxy(url) : direct(url));

const urlsOf = (spy) => spy.mock.calls.map(([url]) => String(url));

/**
 * Drives the proxy to `down` the only way app code can: consecutive outage
 * responses. Returns with skipUntil = `now + PROXY_SKIP_WINDOW_MS`.
 */
async function driveProxyDown(now = NOW) {
  stubFetch(() => httpStatus(503));
  for (let i = 0; i < PROXY_DOWN_AFTER_FAILURES; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- consecutive failures are the point
    await fetchSpotPrice('XAU', { now });
  }
  expect(getMarketDataHealth()).toBe('down');
}

beforeEach(() => {
  resetMarketDataHealth();
});

afterEach(async () => {
  while (unsubscribers.length) unsubscribers.pop()();
  resetMarketDataHealth();
  await flush();
  globalThis.fetch = REAL_FETCH;
  vi.restoreAllMocks();
});

describe('module surface', () => {
  it('pins the health thresholds the UI copy is written against', () => {
    expect(PROXY_DOWN_AFTER_FAILURES).toBe(3);
    expect(PROXY_SKIP_WINDOW_MS).toBe(60000);
  });

  it('keeps React to a single exported hook', () => {
    expect(typeof useMarketDataHealth).toBe('function');
    expect(typeof fetchSpotPrice).toBe('function');
    expect(typeof fetchYahooChart).toBe('function');
  });

  it('starts ok in every environment', () => {
    expect(getMarketDataHealth()).toBe('ok');
  });
});

describe('fetchSpotPrice — proxy first', () => {
  it('returns the proxy price when the proxy succeeds', async () => {
    const spy = stubFetch(() => jsonOk({ price: 3421.5 }));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBe(3421.5);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU]);
    expect(getMarketDataHealth()).toBe('ok');
  });

  it('accepts a numeric-string price from the proxy', async () => {
    stubFetch(() => jsonOk({ price: '2015.25' }));
    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBe(2015.25);
  });

  it('encodes the symbol instead of interpolating it into the path', async () => {
    const spy = stubFetch(() => jsonOk({ price: 1 }));

    await fetchSpotPrice('../admin', { now: NOW });

    expect(urlsOf(spy)).toEqual(['/api/spot-price/..%2Fadmin']);
  });

  it('returns null without touching the network for a blank symbol', async () => {
    const spy = stubFetch(() => jsonOk({ price: 3400 }));

    await expect(fetchSpotPrice('   ', { now: NOW })).resolves.toBeNull();
    await expect(fetchSpotPrice('', { now: NOW })).resolves.toBeNull();
    await expect(fetchSpotPrice(null, { now: NOW })).resolves.toBeNull();
    await expect(fetchSpotPrice(undefined, { now: NOW })).resolves.toBeNull();

    expect(spy).not.toHaveBeenCalled();
  });

  it('works with no options object at all', async () => {
    stubFetch(() => jsonOk({ price: 3400 }));
    await expect(fetchSpotPrice('XAU')).resolves.toBe(3400);
  });
});

describe('fetchSpotPrice — gold-api direct fallback', () => {
  it('falls back to the direct endpoint when the proxy errors on the wire', async () => {
    const spy = stubFetch(route({ proxy: networkError, direct: () => jsonOk({ price: 3333.33 }) }));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBe(3333.33);

    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
  });

  it('falls back when the proxy answers with an outage status', async () => {
    const spy = stubFetch(route({ proxy: () => httpStatus(502), direct: () => jsonOk({ price: 2999 }) }));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBe(2999);

    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
  });

  it('falls back when the proxy answers 200 with an unusable price, without blaming the proxy', async () => {
    const spy = stubFetch(route({ proxy: () => jsonOk({ price: 0 }), direct: () => jsonOk({ price: 3100 }) }));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBe(3100);

    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
    // The proxy answered; a bad payload upstream is not a proxy outage.
    expect(getMarketDataHealth()).toBe('ok');
  });

  it('returns null — never throws — when both sources fail', async () => {
    const spy = stubFetch(networkError);

    const price = await fetchSpotPrice('XAU', { now: NOW });

    expect(price).toBeNull();
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
  });

  it('returns null when both sources answer 500', async () => {
    const spy = stubFetch(() => httpStatus(500));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBeNull();

    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
  });

  it('returns null when the body is not JSON', async () => {
    stubFetch(() => Promise.resolve({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('Unexpected token < in JSON'); },
    }));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBeNull();
  });
});

describe('fetchSpotPrice — price validation', () => {
  const unusable = [
    ['zero', { price: 0 }],
    ['negative', { price: -12.5 }],
    ['NaN-producing string', { price: 'not-a-price' }],
    ['Infinity', { price: Number.POSITIVE_INFINITY }],
    ['null', { price: null }],
    ['missing field', { symbol: 'XAU' }],
    ['empty object', {}],
    ['null payload', null],
    ['array payload', []],
  ];

  it.each(unusable)('rejects a %s payload as null from both sources', async (_label, payload) => {
    stubFetch(() => jsonOk(payload));

    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBeNull();
  });

  it('never returns a price that is not a positive finite number', async () => {
    stubFetch(route({ proxy: () => jsonOk({ price: '-0' }), direct: () => jsonOk({ price: 1e-9 }) }));

    // 1e-9 is finite and positive, so it is a price — the guard is >0, not a plausibility check.
    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBe(1e-9);
  });
});

describe('health state machine', () => {
  it('goes degraded after one proxy outage and stays degraded at two', async () => {
    stubFetch(() => httpStatus(503));

    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('degraded');

    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('degraded');
  });

  it(`goes down at ${PROXY_DOWN_AFTER_FAILURES} consecutive proxy outages`, async () => {
    stubFetch(() => httpStatus(503));

    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('degraded');

    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('down');
  });

  it.each([[500], [503], [408], [429]])('counts HTTP %i as a proxy outage', async (status) => {
    stubFetch(() => httpStatus(status));

    await fetchSpotPrice('XAU', { now: NOW });

    expect(getMarketDataHealth()).toBe('degraded');
  });

  it.each([[400], [401], [403], [404]])('does not count HTTP %i as a proxy outage', async (status) => {
    stubFetch(() => httpStatus(status));

    await fetchSpotPrice('XAU', { now: NOW });

    // The proxy answered, so it is reachable — a 404 is this caller asking for a bad symbol.
    expect(getMarketDataHealth()).toBe('ok');
  });

  it('resets the failure count on any proxy answer, so recovery is not sticky', async () => {
    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('degraded');

    stubFetch(() => httpStatus(404));
    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('ok');

    // Back to a full ladder, not one failure away from down.
    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('degraded');
  });

  it('skips the proxy wholesale while the down window is open', async () => {
    await driveProxyDown(NOW);

    const spy = stubFetch(route({ proxy: () => jsonOk({ price: 9999 }), direct: () => jsonOk({ price: 3300 }) }));
    const price = await fetchSpotPrice('XAU', { now: NOW + 1000 });

    expect(price).toBe(3300);
    expect(urlsOf(spy)).toEqual([GOLD_DIRECT_XAU]);
    expect(getMarketDataHealth()).toBe('down');
  });

  it('lets exactly one caller probe once the window expires', async () => {
    await driveProxyDown(NOW);

    const spy = stubFetch(route({ proxy: () => jsonOk({ price: 9999 }), direct: () => jsonOk({ price: 3300 }) }));
    const after = NOW + PROXY_SKIP_WINDOW_MS + 1;

    // Two different URLs, so nothing is shared: the gate alone decides who probes.
    const [probe, blocked] = await Promise.all([
      fetchSpotPrice('XAU', { now: after }),
      fetchSpotPrice('XAG', { now: after }),
    ]);

    expect(probe).toBe(9999);
    expect(blocked).toBe(3300);
    expect(urlsOf(spy).filter(isProxyUrl)).toEqual([SPOT_PROXY_XAU]);
  });

  it('restores ok when the probe succeeds', async () => {
    await driveProxyDown(NOW);

    stubFetch(() => jsonOk({ price: 3400 }));
    await expect(fetchSpotPrice('XAU', { now: NOW + PROXY_SKIP_WINDOW_MS + 1 })).resolves.toBe(3400);

    expect(getMarketDataHealth()).toBe('ok');
  });

  it('opens a fresh window and stays down when the probe fails', async () => {
    await driveProxyDown(NOW);

    const probeAt = NOW + PROXY_SKIP_WINDOW_MS + 1;
    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: probeAt });
    expect(getMarketDataHealth()).toBe('down');

    // The failed probe must not leave the expired window waving the next caller through.
    const spy = stubFetch(route({ proxy: () => jsonOk({ price: 9999 }), direct: () => jsonOk({ price: 3300 }) }));
    await expect(fetchSpotPrice('XAU', { now: probeAt + 1000 })).resolves.toBe(3300);
    expect(urlsOf(spy)).toEqual([GOLD_DIRECT_XAU]);
  });

  it('resetMarketDataHealth drops the state back to ok', async () => {
    await driveProxyDown(NOW);

    resetMarketDataHealth();

    expect(getMarketDataHealth()).toBe('ok');

    // And the skip window is gone with it: the proxy is tried again immediately.
    const spy = stubFetch(() => jsonOk({ price: 3400 }));
    await expect(fetchSpotPrice('XAU', { now: NOW + 1 })).resolves.toBe(3400);
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU]);
  });
});

describe('subscribeMarketDataHealth', () => {
  it('notifies on state changes only, and stops after unsubscribe', async () => {
    const seen = [];
    const unsubscribe = subscribe(() => { seen.push(getMarketDataHealth()); });

    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: NOW }); // ok -> degraded
    await fetchSpotPrice('XAU', { now: NOW }); // degraded -> degraded (silent)
    await fetchSpotPrice('XAU', { now: NOW }); // degraded -> down

    expect(seen).toEqual(['degraded', 'down']);

    unsubscribe();

    stubFetch(() => jsonOk({ price: 3400 }));
    await fetchSpotPrice('XAU', { now: NOW + PROXY_SKIP_WINDOW_MS + 1 }); // down -> ok

    expect(getMarketDataHealth()).toBe('ok');
    expect(seen).toEqual(['degraded', 'down']);
  });

  it('notifies every subscriber, and unsubscribing one leaves the others', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = subscribe(first);
    subscribe(second);

    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: NOW });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW }); // -> down

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('calls listeners with no arguments — the snapshot is read, never pushed', async () => {
    const listener = vi.fn();
    subscribe(listener);

    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: NOW });

    expect(listener).toHaveBeenCalledWith();
  });

  it('is idempotent on repeated unsubscribe and tolerates a non-function listener', async () => {
    const unsubscribe = subscribeMarketDataHealth(null);
    expect(typeof unsubscribe).toBe('function');
    expect(() => { unsubscribe(); unsubscribe(); }).not.toThrow();

    stubFetch(() => httpStatus(503));
    await expect(fetchSpotPrice('XAU', { now: NOW })).resolves.toBeNull();
    expect(getMarketDataHealth()).toBe('degraded');
  });
});

describe('aborts never move health', () => {
  it('an AbortError from the wire leaves health ok', async () => {
    const spy = stubFetch(() => Promise.reject(makeAbortError()));

    const price = await fetchSpotPrice('XAU', { now: NOW });
    await flush();

    expect(price).toBeNull();
    expect(getMarketDataHealth()).toBe('ok');
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
  });

  it('an abort cannot push a degraded proxy to down', async () => {
    stubFetch(() => httpStatus(503));
    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW });
    expect(getMarketDataHealth()).toBe('degraded');

    stubFetch(() => Promise.reject(makeAbortError()));
    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW });
    await flush();

    // A caller walking away is not an upstream outage: still 2 real failures, not 4.
    expect(getMarketDataHealth()).toBe('degraded');
  });

  it('a caller aborting mid-flight yields null, cancels the wire, and leaves health ok', async () => {
    const spy = stubFetch((_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => { reject(makeAbortError()); });
    }));

    const controller = new AbortController();
    const pending = fetchSpotPrice('XAU', { signal: controller.signal, now: NOW });
    controller.abort();

    await expect(pending).resolves.toBeNull();
    await flush();

    expect(getMarketDataHealth()).toBe('ok');
    // An abort is not a proxy failure, so there is no direct fallback either.
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU]);
  });

  it('one caller aborting does not cancel the other sharing the same request', async () => {
    let settle;
    const spy = stubFetch(() => new Promise((resolve) => { settle = resolve; }));

    const controller = new AbortController();
    const abandoned = fetchSpotPrice('XAU', { signal: controller.signal, now: NOW });
    const waiting = fetchSpotPrice('XAU', { now: NOW });

    controller.abort();
    settle({ ok: true, status: 200, json: async () => ({ price: 3450 }) });

    await expect(abandoned).resolves.toBeNull();
    await expect(waiting).resolves.toBe(3450);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(getMarketDataHealth()).toBe('ok');
  });

  it('a pre-aborted signal yields null without a price', async () => {
    stubFetch(() => jsonOk({ price: 3400 }));
    const controller = new AbortController();
    controller.abort();

    await expect(fetchSpotPrice('XAU', { signal: controller.signal, now: NOW })).resolves.toBeNull();
    await flush();

    expect(getMarketDataHealth()).toBe('ok');
  });
});

describe('in-flight dedupe', () => {
  it('issues exactly one fetch for two simultaneous calls to the same URL', async () => {
    let settle;
    const spy = stubFetch(() => new Promise((resolve) => { settle = resolve; }));

    const first = fetchSpotPrice('XAU', { now: NOW });
    const second = fetchSpotPrice('XAU', { now: NOW });

    expect(spy).toHaveBeenCalledTimes(1);

    settle({ ok: true, status: 200, json: async () => ({ price: 3400 }) });

    await expect(first).resolves.toBe(3400);
    await expect(second).resolves.toBe(3400);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU]);
  });

  it('shares one failing request rather than counting it as two outages', async () => {
    let settle;
    stubFetch(route({
      proxy: () => new Promise((resolve) => { settle = resolve; }),
      direct: networkError,
    }));

    const first = fetchSpotPrice('XAU', { now: NOW });
    const second = fetchSpotPrice('XAU', { now: NOW });

    settle({ ok: false, status: 503, json: async () => ({}) });
    await expect(Promise.all([first, second])).resolves.toEqual([null, null]);
    await flush();

    // Two callers, one request, one failure — not an instant jump to degraded-plus.
    expect(getMarketDataHealth()).toBe('degraded');
  });

  it('does not share across different symbols', async () => {
    let settled = 0;
    const spy = stubFetch(() => { settled += 1; return jsonOk({ price: 3400 + settled }); });

    const [gold, silver] = await Promise.all([
      fetchSpotPrice('XAU', { now: NOW }),
      fetchSpotPrice('XAG', { now: NOW }),
    ]);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(urlsOf(spy)).toEqual(['/api/spot-price/XAU', '/api/spot-price/XAG']);
    expect(gold).not.toBe(silver);
  });

  it('dedupes concurrency without caching — a later call refetches', async () => {
    const spy = stubFetch(() => jsonOk({ price: 3400 }));

    await fetchSpotPrice('XAU', { now: NOW });
    await fetchSpotPrice('XAU', { now: NOW });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('shares the direct fallback URL too', async () => {
    let settle;
    const spy = stubFetch(route({
      proxy: () => httpStatus(503),
      direct: () => new Promise((resolve) => { settle = resolve; }),
    }));

    const first = fetchSpotPrice('XAU', { now: NOW });
    const second = fetchSpotPrice('XAU', { now: NOW });

    await flush();
    settle({ ok: true, status: 200, json: async () => ({ price: 3200 }) });

    await expect(first).resolves.toBe(3200);
    await expect(second).resolves.toBe(3200);
    expect(urlsOf(spy)).toEqual([SPOT_PROXY_XAU, GOLD_DIRECT_XAU]);
  });
});

describe('fetchYahooChart — proxy only', () => {
  it('returns the parsed proxy payload', async () => {
    const payload = { chart: { result: [{ meta: { symbol: 'GC=F' } }] } };
    const spy = stubFetch(() => jsonOk(payload));

    await expect(fetchYahooChart('GC=F', { now: NOW })).resolves.toEqual(payload);
    expect(urlsOf(spy)).toEqual(['/api/yahoo-chart/GC%3DF']);
  });

  it('appends only the query params it was given', async () => {
    const spy = stubFetch(() => jsonOk({}));

    await fetchYahooChart('GC=F', { interval: '5m', range: '1d', now: NOW });
    await fetchYahooChart('GC=F', { range: '1mo', now: NOW });
    await fetchYahooChart('GC=F', { now: NOW });

    expect(urlsOf(spy)).toEqual([
      '/api/yahoo-chart/GC%3DF?interval=5m&range=1d',
      '/api/yahoo-chart/GC%3DF?range=1mo',
      '/api/yahoo-chart/GC%3DF',
    ]);
  });

  it('never falls back to gold-api — Yahoo blocks CORS, so there is no browser fallback', async () => {
    const spy = stubFetch(() => httpStatus(503));

    await expect(fetchYahooChart('GC=F', { now: NOW })).resolves.toBeNull();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(urlsOf(spy).every(isProxyUrl)).toBe(true);
    expect(getMarketDataHealth()).toBe('degraded');
  });

  it('returns null while the proxy is down, without a request', async () => {
    await driveProxyDown(NOW);

    const spy = stubFetch(() => jsonOk({ chart: {} }));

    await expect(fetchYahooChart('GC=F', { now: NOW + 1000 })).resolves.toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns null for a blank symbol without a request', async () => {
    const spy = stubFetch(() => jsonOk({}));

    await expect(fetchYahooChart('  ', { now: NOW })).resolves.toBeNull();

    expect(spy).not.toHaveBeenCalled();
  });

  it('returns null on abort rather than a half-read payload', async () => {
    stubFetch((_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => { reject(makeAbortError()); });
    }));

    const controller = new AbortController();
    const pending = fetchYahooChart('GC=F', { signal: controller.signal, now: NOW });
    controller.abort();

    await expect(pending).resolves.toBeNull();
    await flush();
    expect(getMarketDataHealth()).toBe('ok');
  });
});

describe('isSpotPollingPaused', () => {
  // Every instant is an explicit UTC epoch; nothing here reads the current time.
  const SATURDAY = Date.UTC(2026, 6, 18, 12); // Sat 08:00 America/New_York
  const WEDNESDAY = Date.UTC(2026, 6, 15, 12); // Wed 08:00 America/New_York
  const FRIDAY_SUMMER_OPEN = Date.UTC(2026, 6, 17, 20, 30); // Fri 16:30 EDT
  const FRIDAY_SUMMER_REST = Date.UTC(2026, 6, 17, 21); // Fri 17:00 EDT — boundary
  const SUNDAY_REST = Date.UTC(2026, 6, 19, 12); // Sun 08:00 EDT
  const SUNDAY_OPEN = Date.UTC(2026, 6, 19, 22); // Sun 18:00 EDT
  const FRIDAY_WINTER_OPEN = Date.UTC(2026, 0, 16, 21, 30); // Fri 16:30 EST

  it('pauses on a Saturday instant', () => {
    expect(isSpotPollingPaused(SATURDAY)).toBe(true);
  });

  it('does not pause on a Wednesday instant', () => {
    expect(isSpotPollingPaused(WEDNESDAY)).toBe(false);
  });

  it('turns over at Friday 17:00 New York, not at a fixed UTC hour', () => {
    expect(isSpotPollingPaused(FRIDAY_SUMMER_OPEN)).toBe(false);
    expect(isSpotPollingPaused(FRIDAY_SUMMER_REST)).toBe(true);
  });

  it('resumes at Sunday 17:00 New York', () => {
    expect(isSpotPollingPaused(SUNDAY_REST)).toBe(true);
    expect(isSpotPollingPaused(SUNDAY_OPEN)).toBe(false);
  });

  it('delegates to isWeekendRestAt, not to the legacy UTC-hour isMarketClosed (R3)', () => {
    const instants = [
      SATURDAY, WEDNESDAY, FRIDAY_SUMMER_OPEN, FRIDAY_SUMMER_REST,
      SUNDAY_REST, SUNDAY_OPEN, FRIDAY_WINTER_OPEN,
    ];
    for (const instant of instants) {
      expect(isSpotPollingPaused(instant)).toBe(isWeekendRestAt(instant));
    }

    // The discriminating instant: winter Friday 21:30 UTC is 16:30 EST — still
    // trading. The legacy Fri >= 21:00 UTC rule would have paused the poller here.
    expect(isMarketClosed(new Date(FRIDAY_WINTER_OPEN))).toBe(true);
    expect(isSpotPollingPaused(FRIDAY_WINTER_OPEN)).toBe(false);
  });

  it('accepts Date, epoch ms, and ISO string alike', () => {
    expect(isSpotPollingPaused(new Date(SATURDAY))).toBe(true);
    expect(isSpotPollingPaused(SATURDAY)).toBe(true);
    expect(isSpotPollingPaused(new Date(SATURDAY).toISOString())).toBe(true);
  });

  it('fails open on unusable input — a silent poller is indistinguishable from a dead feed', () => {
    expect(isSpotPollingPaused(undefined)).toBe(false);
    expect(isSpotPollingPaused(null)).toBe(false);
    expect(isSpotPollingPaused('not-a-date')).toBe(false);
    expect(isSpotPollingPaused(Number.NaN)).toBe(false);
    expect(isSpotPollingPaused(new Date('nope'))).toBe(false);
  });
});

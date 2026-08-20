/**
 * Market data access, defined once.
 *
 * Every spot/chart request funnels through here: one proxy→direct fallback rule,
 * one health signal, one weekend gate, one request in flight per URL. The pattern
 * was previously hand-rolled per component (LiveMarketWidget carries two copies of
 * it in one file), so a proxy outage degraded differently on every screen and the
 * same four symbols were fetched twice a tick.
 *
 * Contracts callers depend on:
 *  - the fetch functions NEVER throw and NEVER reject; every failure is `null`
 *  - an abort is a caller decision, not an upstream outage, and can never move
 *    the health state
 *  - `isSpotPollingPaused` delegates to `isWeekendRestAt` (R3) — new code has ONE
 *    weekend truth; the legacy UTC-hour `isMarketClosed` is deliberately not it
 *
 * React appears exactly once, in `useMarketDataHealth`. The fetch functions and the
 * health store touch no React and no ambient app state, so they stay usable from a
 * worker, a test, or any non-React caller.
 */
import { useSyncExternalStore } from 'react';
import { isWeekendRestAt } from './sessionEngine.js';

/** Consecutive proxy outages before the proxy counts as down rather than flaky. */
export const PROXY_DOWN_AFTER_FAILURES = 3;

/** How long the proxy is skipped once down: long enough to outlast a deploy, short enough that recovery is invisible. */
export const PROXY_SKIP_WINDOW_MS = 60000;

const SPOT_PROXY_PATH = '/api/spot-price/';
const YAHOO_PROXY_PATH = '/api/yahoo-chart/';
const GOLD_API_PRICE_URL = 'https://api.gold-api.com/price/';

// ---------------------------------------------------------------------------
// Health store
// ---------------------------------------------------------------------------

const listeners = new Set();

/**
 * Module singleton by design: health is a property of the proxy, not of any one
 * component, and a per-caller copy would let three widgets disagree about whether
 * data is delayed. `failures` is capped so its domain stays 0..PROXY_DOWN_AFTER_FAILURES.
 */
const health = { state: 'ok', failures: 0, skipUntil: 0, probing: false };

function notify() {
  // A faulty subscriber must not fail the request whose settle triggered this;
  // the microtask rethrow reports it to the global handler instead of hiding it.
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch (error) {
      queueMicrotask(() => { throw error; });
    }
  }
}

function setState(next) {
  if (health.state === next) return;
  health.state = next;
  notify();
}

/** @returns {'ok'|'degraded'|'down'} */
export function getMarketDataHealth() {
  return health.state;
}

/**
 * @param {() => void} listener Called on state changes only, never with arguments.
 * @returns {() => void} unsubscribe
 */
export function subscribeMarketDataHealth(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * Drops health state and in-flight sharing. The seam a module singleton needs so
 * one test's outage cannot leak into the next; not for app code.
 */
export function resetMarketDataHealth() {
  health.failures = 0;
  health.skipUntil = 0;
  health.probing = false;
  for (const [url, entry] of inFlight) {
    inFlight.delete(url);
    entry.controller.abort();
  }
  setState('ok');
}

/** Any proxy response at all — including a 404 — proves the proxy is reachable. */
function recordProxySuccess() {
  health.failures = 0;
  health.skipUntil = 0;
  setState('ok');
}

function recordProxyFailure(now) {
  health.failures = Math.min(health.failures + 1, PROXY_DOWN_AFTER_FAILURES);
  const next = health.failures >= PROXY_DOWN_AFTER_FAILURES ? 'down' : 'degraded';
  // Refreshed on every down-state failure, so a failed probe opens a fresh window
  // rather than letting the expired one wave the next caller straight through.
  health.skipUntil = next === 'down' ? now + PROXY_SKIP_WINDOW_MS : 0;
  setState(next);
}

/**
 * Once down, the proxy is skipped wholesale until the window expires; then exactly
 * one caller carries a probe while the rest keep skipping. Letting every caller
 * retry at the window edge would hammer a proxy that is likely still mid-deploy.
 *
 * @returns {{allowed: boolean, probe: boolean}}
 */
function openProxyGate(now) {
  if (health.state !== 'down') return { allowed: true, probe: false };
  if (now < health.skipUntil) return { allowed: false, probe: false };
  if (health.probing) return { allowed: false, probe: false };
  health.probing = true;
  return { allowed: true, probe: true };
}

// ---------------------------------------------------------------------------
// Request sharing
// ---------------------------------------------------------------------------

/** Distinguishes "this caller walked away" from "the request produced nothing". */
const ABORTED = Symbol('market-data-aborted');

/** url → shared request. Cleared on settle, so it dedupes concurrency and never caches. */
const inFlight = new Map();

function isAbortError(error, signal) {
  return signal?.aborted === true || error?.name === 'AbortError';
}

/**
 * 5xx/408/429 are the proxy failing to deliver; a plain 4xx is this caller asking
 * for something that does not exist. Counting one mistyped symbol as an outage
 * would flip the whole app to "Delayed".
 */
function isOutageStatus(status) {
  return status >= 500 || status === 408 || status === 429;
}

/** @returns {Promise<{data: unknown|null, outage: boolean, aborted?: boolean}>} — never rejects. */
async function requestJson(url, signal) {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return { data: null, outage: isOutageStatus(response.status) };
    return { data: await response.json(), outage: false };
  } catch (error) {
    if (isAbortError(error, signal)) return { data: null, outage: false, aborted: true };
    // Network error, DNS, CORS, or a body that is not JSON: this URL did not deliver.
    return { data: null, outage: true };
  }
}

/**
 * The shared request runs on its own controller, never on a caller's signal — one
 * caller unmounting must not cancel the other three waiting on the same URL.
 * `run` is normalised to never reject: a rejected shared promise would surface as
 * a throw from functions documented never to throw.
 */
function beginShared(url, run) {
  const controller = new AbortController();
  const entry = { controller, refs: 0, promise: null };
  entry.promise = run(controller.signal)
    .catch(() => ({ data: null, outage: false }))
    .finally(() => {
      if (inFlight.get(url) === entry) inFlight.delete(url);
    });
  inFlight.set(url, entry);
  return entry;
}

/** Last caller out cancels the shared request — an abort nobody is waiting on should leave the wire. */
function release(url, entry, result) {
  entry.refs -= 1;
  if (entry.refs <= 0 && inFlight.get(url) === entry) {
    inFlight.delete(url);
    entry.controller.abort();
  }
  return result;
}

function joinShared(url, entry, signal) {
  const abortable = signal && typeof signal.addEventListener === 'function';
  if (signal?.aborted === true) return Promise.resolve(ABORTED);
  entry.refs += 1;
  if (!abortable) return entry.promise.then((result) => release(url, entry, result));
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve(release(url, entry, value));
    };
    const onAbort = () => finish(ABORTED);
    signal.addEventListener('abort', onAbort, { once: true });
    entry.promise.then(finish);
  });
}

/** @returns {Promise<unknown|null|typeof ABORTED>} */
async function proxyJson(url, now, signal) {
  let entry = inFlight.get(url);
  if (!entry) {
    // Gated only when a new request is needed: joining an open one is strictly
    // better than skipping, and it must not consume the single recovery probe.
    const gate = openProxyGate(now);
    if (!gate.allowed) return null;
    entry = beginShared(url, async (sharedSignal) => {
      const result = await requestJson(url, sharedSignal);
      if (!result.aborted) {
        if (result.outage) recordProxyFailure(now);
        else recordProxySuccess();
      }
      if (gate.probe) health.probing = false;
      return result;
    });
  }
  const result = await joinShared(url, entry, signal);
  return result === ABORTED ? ABORTED : result.data;
}

/** Gold-API is not our proxy: its failures say nothing about proxy health, so this path never records. */
async function directJson(url, signal) {
  const entry = inFlight.get(url) ?? beginShared(url, (sharedSignal) => requestJson(url, sharedSignal));
  const result = await joinShared(url, entry, signal);
  return result === ABORTED ? ABORTED : result.data;
}

// ---------------------------------------------------------------------------
// Public fetchers
// ---------------------------------------------------------------------------

/**
 * The symbol lands in a URL path, so it is encoded rather than interpolated: a raw
 * '../' would otherwise reach a different API route.
 */
function symbolPath(symbol) {
  if (typeof symbol !== 'string' && typeof symbol !== 'number') return '';
  const trimmed = String(symbol).trim();
  return trimmed ? encodeURIComponent(trimmed) : '';
}

/** A price of 0, NaN, or a missing field is not a price — never a number to show or size a trade against. */
function parsePrice(data) {
  const price = Number(data?.price);
  return Number.isFinite(price) && price > 0 ? price : null;
}

/**
 * Live spot price for a metal symbol ('XAU', 'XAG', 'XPT', 'XPD').
 *
 * Proxy first (cached and coalesced server-side), Gold-API direct as fallback —
 * it is the same upstream the proxy wraps and it sends CORS headers, so a browser
 * keeps quoting the real price while our own API is down.
 *
 * @param {string|number} symbol
 * @param {{signal?: AbortSignal, now?: number}} [options] `now` is the skip-window
 *   clock, injectable so the state machine is testable without fake timers.
 * @returns {Promise<number|null>} null on abort, bad input, or total failure. Never throws.
 */
export async function fetchSpotPrice(symbol, { signal, now = Date.now() } = {}) {
  const path = symbolPath(symbol);
  if (!path) return null;
  const proxied = await proxyJson(SPOT_PROXY_PATH + path, now, signal);
  if (proxied === ABORTED) return null;
  const price = parsePrice(proxied);
  if (price !== null) return price;
  const direct = await directJson(GOLD_API_PRICE_URL + path, signal);
  return direct === ABORTED ? null : parsePrice(direct);
}

function chartQuery(interval, range) {
  const params = new URLSearchParams();
  if (interval) params.set('interval', String(interval));
  if (range) params.set('range', String(range));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Yahoo chart payload, proxy-only: Yahoo sends no CORS headers, so there is no
 * browser-side fallback and a down proxy correctly yields null rather than a
 * request that can only fail.
 *
 * @param {string|number} symbol Yahoo ticker, e.g. 'GC=F'.
 * @param {{interval?: string, range?: string, signal?: AbortSignal, now?: number}} [options]
 * @returns {Promise<object|null>} The raw parsed payload; callers read `chart.result[0]`. Never throws.
 */
export async function fetchYahooChart(symbol, { interval, range, signal, now = Date.now() } = {}) {
  const path = symbolPath(symbol);
  if (!path) return null;
  const result = await proxyJson(YAHOO_PROXY_PATH + path + chartQuery(interval, range), now, signal);
  return result === ABORTED || result === undefined ? null : result;
}

/**
 * Whether spot polling should stand down. R3: delegates to `isWeekendRestAt` so
 * new code has one weekend definition — the legacy `isMarketClosed` (Fri ≥21:00
 * UTC) disagrees with it twice a year and is deliberately not called here.
 *
 * Fails open (false) on unusable input: a paused poller is silent, and silence
 * caused by a bad clock value is indistinguishable from a broken feed.
 *
 * @param {Date|number|string} now
 * @returns {boolean}
 */
export function isSpotPollingPaused(now) {
  return isWeekendRestAt(now);
}

/**
 * The health state, re-rendering on change. The snapshot is a string primitive, so
 * it is referentially stable with no cache; the server snapshot is the same read
 * because the store starts 'ok' in every environment.
 *
 * @returns {'ok'|'degraded'|'down'}
 */
export function useMarketDataHealth() {
  return useSyncExternalStore(subscribeMarketDataHealth, getMarketDataHealth, getMarketDataHealth);
}

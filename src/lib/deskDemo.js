/* ————————————————————————————————————————————————————————————
   Sample record behind the public site's interactive panels.

   Everything the visitor sees — win rate, expectancy, profit factor,
   the equity curve, the session split, the best hour — is DERIVED from
   DEMO_TRADES below. Nothing is hand-written per metric, so the page
   can never quote two figures that disagree with each other.

   The record is deliberately ordinary: 50% win rate overall, one
   session carrying the edge and one quietly bleeding. That is the
   pattern the product exists to make visible.
   ———————————————————————————————————————————————————————————— */

import { pad2 } from './tradeUtils.js';

export const DEMO_SESSIONS = [
  { id: 'all', label: 'All sessions', window: '24h · UTC' },
  { id: 'london', label: 'London', window: '07:00–16:00 UTC' },
  { id: 'ny', label: 'New York', window: '12:00–21:00 UTC' },
  { id: 'asia', label: 'Asia', window: '00:00–09:00 UTC' },
];

/** [day, hourUTC, session, rMultiple] — one quarter of XAU/USD review. */
const RECORD = [
  [1, 8, 'london', 1.9], [1, 14, 'ny', -1.0],
  [2, 3, 'asia', -1.0], [2, 9, 'london', 2.4],
  [3, 8, 'london', -1.0], [3, 13, 'ny', 1.6],
  [4, 2, 'asia', -1.0], [4, 7, 'london', -1.0], [4, 15, 'ny', -1.0],
  [5, 9, 'london', 3.1],
  [8, 8, 'london', -1.0], [8, 14, 'ny', 2.2],
  [9, 4, 'asia', 0.8], [9, 10, 'london', 1.5],
  [10, 8, 'london', 2.0], [10, 16, 'ny', -1.0],
  [11, 7, 'london', -1.0], [11, 13, 'ny', 1.1],
  [12, 1, 'asia', -1.0], [12, 9, 'london', 2.7],
  [15, 8, 'london', 1.4], [15, 14, 'ny', -1.0],
  [16, 11, 'london', -1.0], [16, 15, 'ny', 1.9],
  [17, 5, 'asia', -1.0], [17, 8, 'london', 2.3],
  [18, 9, 'london', -1.0], [18, 13, 'ny', 0.9],
  [19, 7, 'london', -1.0], [19, 17, 'ny', -1.0],
  [22, 3, 'asia', 1.2], [22, 8, 'london', 2.6],
  [23, 10, 'london', 1.3], [23, 14, 'ny', -1.0],
  [24, 8, 'london', -1.0], [24, 12, 'ny', 1.5],
  [25, 2, 'asia', -1.0], [25, 9, 'london', 2.1],
  [26, 8, 'london', 1.6], [26, 16, 'ny', 2.0],
  [29, 4, 'asia', -1.0], [29, 7, 'london', -1.0],
  [30, 8, 'london', 2.9], [30, 13, 'ny', -1.0],
  [31, 9, 'london', -1.0], [31, 15, 'ny', 1.3],
  [32, 1, 'asia', 0.6], [32, 8, 'london', -1.0],
  [33, 10, 'london', 2.2], [33, 14, 'ny', -1.0],
  [36, 5, 'asia', -1.0], [36, 8, 'london', 1.8],
  [37, 9, 'london', -1.0], [37, 13, 'ny', 1.7],
  [38, 3, 'asia', -1.0], [38, 8, 'london', 2.5],
  [39, 11, 'london', -1.0], [39, 16, 'ny', -1.0],
  [40, 8, 'london', 1.9], [40, 14, 'ny', 1.2],
];

export const DEMO_TRADES = RECORD.map(([day, hour, session, r]) => ({ day, hour, session, r }));

export function tradesFor(sessionId) {
  return sessionId === 'all' ? DEMO_TRADES : DEMO_TRADES.filter((t) => t.session === sessionId);
}

const sum = (list) => list.reduce((total, value) => total + value, 0);

/** Headline statistics for a set of trades. Profit factor is null when
    a set has no losers — an infinite ratio is not a number worth showing. */
export function summarise(trades) {
  const wins = trades.filter((t) => t.r > 0);
  const losses = trades.filter((t) => t.r <= 0);
  const grossWin = sum(wins.map((t) => t.r));
  const grossLoss = Math.abs(sum(losses.map((t) => t.r)));
  const net = grossWin - grossLoss;

  return {
    count: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: trades.length ? Math.round((wins.length / trades.length) * 100) : 0,
    expectancy: trades.length ? net / trades.length : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    net,
  };
}

/** The hour that contributed the most R, with its own hit rate. */
export function bestHour(trades) {
  if (!trades.length) return null;
  const byHour = new Map();
  for (const trade of trades) {
    const bucket = byHour.get(trade.hour) || { hour: trade.hour, net: 0, count: 0, wins: 0 };
    bucket.net += trade.r;
    bucket.count += 1;
    if (trade.r > 0) bucket.wins += 1;
    byHour.set(trade.hour, bucket);
  }
  const ranked = [...byHour.values()].sort((a, b) => b.net - a.net);
  return ranked[0];
}

export function hourWindow(hour) {
  return `${pad2(hour)}:00–${pad2((hour + 1) % 24)}:00`;
}

/**
 * Cumulative-R equity curve as SVG geometry.
 * Returns the line path, a matching fill path and the y of the zero line
 * so the chart can draw a real baseline rather than a decorative one.
 */
export function equityCurve(trades, width = 640, height = 200, pad = 12) {
  const ordered = [...trades].sort((a, b) => a.day - b.day || a.hour - b.hour);

  let running = 0;
  const values = [0, ...ordered.map((trade) => (running += trade.r))];

  const high = Math.max(...values, 0);
  const low = Math.min(...values, 0);
  const span = high - low || 1;
  const stepX = width / Math.max(values.length - 1, 1);
  const toY = (value) => pad + (height - pad * 2) * (1 - (value - low) / span);

  const points = values.map((value, index) => [index * stepX, toY(value)]);
  const line = points
    .map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  return {
    line,
    area: `${line} L${width.toFixed(1)} ${height} L0 ${height} Z`,
    zeroY: toY(0),
    final: values[values.length - 1],
    width,
    height,
  };
}

/**
 * Net R for each of the 24 UTC hours, always full-length so the dial can
 * draw an empty spoke for hours the trader never touched. `peak` is the
 * largest absolute hour, used to normalise spoke length.
 */
export function hourlyProfile(trades = DEMO_TRADES) {
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, net: 0, count: 0, wins: 0 }));
  for (const trade of trades) {
    const bucket = hours[trade.hour];
    bucket.net += trade.r;
    bucket.count += 1;
    if (trade.r > 0) bucket.wins += 1;
  }
  const peak = Math.max(...hours.map((h) => Math.abs(h.net)), 1);
  return { hours, peak };
}

/** Which sessions cover a given UTC hour — an hour can belong to two desks. */
export function sessionsAtHour(hour) {
  return DEMO_SESSIONS.filter((session) => {
    if (session.id === 'all') return false;
    const [from, to] = session.window.split('–').map((part) => parseInt(part, 10));
    return from < to ? hour >= from && hour < to : hour >= from || hour < to;
  }).map((session) => session.id);
}

/** Per-session totals, ranked — powers the "where your edge lives" split. */
export function sessionSplit() {
  return DEMO_SESSIONS.filter((session) => session.id !== 'all')
    .map((session) => ({ ...session, ...summarise(tradesFor(session.id)) }))
    .sort((a, b) => b.net - a.net);
}

export const formatR = (value, decimals = 1) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(decimals)}R`;

export const formatR2 = (value) => formatR(value, 2);

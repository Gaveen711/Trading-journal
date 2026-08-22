import { describe, it, expect, vi } from 'vitest';
import { XAUUSD_OZ_PER_LOT } from '../lib/goldContract.js';
import { SESSION_CODES, SESSION_ENGINE_VERSION } from '../lib/sessionEngine.js';
import {
  ANALYTICS_VERSION,
  MIN_SESSION_INSIGHT_SAMPLE,
  MIN_SETUP_SAMPLE,
  SESSION_ANALYTICS_VERSION,
  SESSION_BUCKETS,
  analyticsUpdate,
  closeMoment,
  deriveSessionStats,
  emptySessionAnalytics,
  emptyTradeAnalytics,
  entryMoment,
  getTradeOutcome,
  getTradeSessionCode,
  getTradeSetupKey,
  getTradeStrategyTags,
  isLongDirection,
  isTradeAnalyticsEligible,
  resolveTradeRiskUsd,
  sessionAnalyticsDelta,
  sessionAnalyticsDeltaForTrades,
  sessionAnalyticsUpdate,
  slugifySetupName,
  subtractSessionAnalytics,
  tradeAnalyticsDelta,
  tradePnlValue,
} from '../lib/tradeAnalytics.js';

/* Instants verified against sessionEngine.resolveSessionAt; all weekdays unless
 * noted, so the weekend-rest short-circuit is exercised only where intended. */
const SYDNEY_TOKYO = '2026-08-19T02:00:00Z';  // Wed
const SYDNEY = '2026-08-19T22:00:00Z';        // Sydney alone, before Tokyo opens
const TOKYO = '2026-08-19T06:00:00Z';         // Tokyo alone, after Sydney closes
const TOKYO_LONDON = '2026-08-19T08:00:00Z';
const LONDON = '2026-08-19T10:00:00Z';
const LONDON_NY = '2026-08-19T13:00:00Z';
const NY = '2026-08-19T18:00:00Z';
const WEEKEND = '2026-08-22T12:00:00Z';    // Sat

const ms = (iso) => Date.parse(iso);

/** Firestore client/Admin Timestamp: only `.toDate()` is contractual across SDKs. */
const timestampLike = (iso) => ({ toDate: () => new Date(iso) });

/** The JSON-serialized Timestamp forms that survive an API round-trip. */
const secondsLike = (iso) => ({ seconds: ms(iso) / 1000 });
const underscoreSecondsLike = (iso) => ({ _seconds: ms(iso) / 1000 });

/** Accumulates deltas into a stored map the way a Firestore increment would. */
function applySessionDelta(analytics, delta) {
  SESSION_BUCKETS.forEach((bucket) => {
    Object.keys(analytics.buckets[bucket]).forEach((key) => {
      analytics.buckets[bucket][key] += delta[bucket][key];
    });
  });
  return analytics;
}

describe('slugifySetupName', () => {
  it("turns 'S/R' into a Firestore-legal id fragment", () => {
    // The review blocker: `default_s/r` is an illegal document id.
    expect(slugifySetupName('S/R')).toBe('s-r');
    expect(slugifySetupName('S/R')).not.toContain('/');
    expect(slugifySetupName('S/R Bounce')).toBe('s-r-bounce');
  });

  it('lowercases and hyphenates ordinary names', () => {
    expect(slugifySetupName('News fade')).toBe('news-fade');
    expect(slugifySetupName('Breakout')).toBe('breakout');
    expect(slugifySetupName('ICT')).toBe('ict');
  });

  it('trims leading and trailing separator runs', () => {
    expect(slugifySetupName('  --Breakout!!  ')).toBe('breakout');
    expect(slugifySetupName('---')).toBe('');
    expect(slugifySetupName('???')).toBe('');
  });

  it('collapses unicode and symbol runs to a single hyphen', () => {
    expect(slugifySetupName('Café  ☕ Fade')).toBe('caf-fade');
    expect(slugifySetupName('A///B___C')).toBe('a-b-c');
    expect(slugifySetupName('пробой')).toBe('');
  });

  it('never emits a character outside [a-z0-9-]', () => {
    const samples = ['S/R', 'Café ☕', 'A///B', '50% retrace', 'Order-Block #3', 'наш'];
    samples.forEach((name) => {
      expect(slugifySetupName(name)).toMatch(/^[a-z0-9-]*$/);
    });
  });

  it('coerces non-string input instead of throwing', () => {
    expect(slugifySetupName(null)).toBe('');
    expect(slugifySetupName(undefined)).toBe('');
    expect(slugifySetupName('')).toBe('');
    expect(slugifySetupName(42)).toBe('42');
  });
});

describe('entryMoment', () => {
  it('prefers entryTimestampUtc over openTime over timestamp', () => {
    expect(entryMoment({
      entryTimestampUtc: LONDON,
      openTime: NY,
      timestamp: SYDNEY_TOKYO,
    })).toBe(ms(LONDON));
    expect(entryMoment({ openTime: NY, timestamp: SYDNEY_TOKYO })).toBe(ms(NY));
    expect(entryMoment({ timestamp: SYDNEY_TOKYO })).toBe(ms(SYDNEY_TOKYO));
  });

  it('falls through a tier that cannot be coerced rather than giving up', () => {
    expect(entryMoment({ entryTimestampUtc: 'not-a-date', openTime: NY })).toBe(ms(NY));
    expect(entryMoment({ entryTimestampUtc: null, openTime: '', timestamp: SYDNEY_TOKYO })).toBe(ms(SYDNEY_TOKYO));
  });

  it('accepts ISO strings, epoch ms, Dates and Timestamp shapes', () => {
    expect(entryMoment({ entryTimestampUtc: LONDON })).toBe(ms(LONDON));
    expect(entryMoment({ entryTimestampUtc: ms(LONDON) })).toBe(ms(LONDON));
    expect(entryMoment({ entryTimestampUtc: new Date(LONDON) })).toBe(ms(LONDON));
    expect(entryMoment({ entryTimestampUtc: timestampLike(LONDON) })).toBe(ms(LONDON));
    expect(entryMoment({ entryTimestampUtc: secondsLike(LONDON) })).toBe(ms(LONDON));
    expect(entryMoment({ entryTimestampUtc: underscoreSecondsLike(LONDON) })).toBe(ms(LONDON));
  });

  it('treats the epoch itself as a resolved instant, not as absent', () => {
    expect(entryMoment({ entryTimestampUtc: 0 })).toBe(0);
  });

  it('returns null when nothing resolves', () => {
    expect(entryMoment(null)).toBeNull();
    expect(entryMoment(undefined)).toBeNull();
    expect(entryMoment({})).toBeNull();
    expect(entryMoment({ entryTimestampUtc: '' })).toBeNull();
    expect(entryMoment({ entryTimestampUtc: 'yesterday' })).toBeNull();
    expect(entryMoment({ entryTimestampUtc: NaN })).toBeNull();
    expect(entryMoment({ entryTimestampUtc: Infinity })).toBeNull();
    expect(entryMoment({ entryTimestampUtc: new Date('nope') })).toBeNull();
    expect(entryMoment({ entryTimestampUtc: 8.64e15 + 1 })).toBeNull();
    expect(entryMoment({ closeTime: LONDON })).toBeNull();
  });
});

describe('closeMoment', () => {
  it('prefers closeTime over timestamp', () => {
    expect(closeMoment({ closeTime: NY, timestamp: SYDNEY_TOKYO })).toBe(ms(NY));
    expect(closeMoment({ timestamp: SYDNEY_TOKYO })).toBe(ms(SYDNEY_TOKYO));
  });

  it('ignores the entry-only tiers', () => {
    expect(closeMoment({ entryTimestampUtc: LONDON, openTime: NY })).toBeNull();
  });

  it('accepts the same coercion shapes as entryMoment', () => {
    expect(closeMoment({ closeTime: timestampLike(NY) })).toBe(ms(NY));
    expect(closeMoment({ closeTime: secondsLike(NY) })).toBe(ms(NY));
    expect(closeMoment({ closeTime: ms(NY) })).toBe(ms(NY));
  });

  it('returns null when nothing resolves', () => {
    expect(closeMoment(null)).toBeNull();
    expect(closeMoment({})).toBeNull();
    expect(closeMoment({ closeTime: 'soon' })).toBeNull();
  });
});

describe('resolveTradeRiskUsd', () => {
  it('multiplies stop distance by lots and the contract size', () => {
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2390, lots: 0.5 }))
      .toBe(10 * 0.5 * XAUUSD_OZ_PER_LOT);
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2385, lots: 2 }))
      .toBe(15 * 2 * XAUUSD_OZ_PER_LOT);
  });

  it('uses the absolute stop distance, so shorts price the same as longs', () => {
    const long = resolveTradeRiskUsd({ entry: 2400, sl: 2390, lots: 1 });
    const short = resolveTradeRiskUsd({ entry: 2390, sl: 2400, lots: 1 });
    expect(long).toBe(short);
    expect(long).toBe(10 * XAUUSD_OZ_PER_LOT);
  });

  it('falls back to openPrice for broker documents', () => {
    expect(resolveTradeRiskUsd({ openPrice: 2400, sl: 2390, lots: 1 }))
      .toBe(10 * XAUUSD_OZ_PER_LOT);
    // `entry` wins when both are present.
    expect(resolveTradeRiskUsd({ entry: 2400, openPrice: 1000, sl: 2390, lots: 1 }))
      .toBe(10 * XAUUSD_OZ_PER_LOT);
  });

  it('coerces numeric strings from the log form', () => {
    expect(resolveTradeRiskUsd({ entry: '2400', sl: '2390', lots: '0.5' }))
      .toBe(10 * 0.5 * XAUUSD_OZ_PER_LOT);
  });

  it('returns null — never 0 — when risk is not expressible', () => {
    expect(resolveTradeRiskUsd({ entry: 2400, lots: 1 })).toBeNull();            // no sl
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2390 })).toBeNull();           // no lots
    expect(resolveTradeRiskUsd({ sl: 2390, lots: 1 })).toBeNull();               // no entry
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 0, lots: 1 })).toBeNull();     // sl unset as 0
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2390, lots: 0 })).toBeNull();  // zero size
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2400, lots: 1 })).toBeNull();  // zero distance
    expect(resolveTradeRiskUsd({})).toBeNull();
    expect(resolveTradeRiskUsd(null)).toBeNull();
  });

  it('returns null for non-finite inputs', () => {
    expect(resolveTradeRiskUsd({ entry: 'abc', sl: 2390, lots: 1 })).toBeNull();
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 'abc', lots: 1 })).toBeNull();
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2390, lots: 'abc' })).toBeNull();
    expect(resolveTradeRiskUsd({ entry: 2400, sl: 2390, lots: Infinity })).toBeNull();
    expect(resolveTradeRiskUsd({ entry: NaN, sl: 2390, lots: 1 })).toBeNull();
  });
});

describe('getTradeSessionCode', () => {
  it('trusts a stored tag at the current engine version', () => {
    // The stored tag disagrees with the instant on purpose: the tag must win.
    expect(getTradeSessionCode({
      sessionEngineVersion: SESSION_ENGINE_VERSION,
      sessionCode: 'London',
      entryTimestampUtc: NY,
    })).toBe('London');
  });

  it('ignores a stored tag from a stale engine version and derives instead', () => {
    expect(getTradeSessionCode({
      sessionEngineVersion: SESSION_ENGINE_VERSION - 1,
      sessionCode: 'London',
      entryTimestampUtc: NY,
    })).toBe('NY');
    expect(getTradeSessionCode({
      sessionCode: 'London',
      entryTimestampUtc: NY,
    })).toBe('NY');
  });

  it('ignores a stored code outside the rules enum', () => {
    expect(getTradeSessionCode({
      sessionEngineVersion: SESSION_ENGINE_VERSION,
      sessionCode: 'Unknown',
      entryTimestampUtc: NY,
    })).toBe('NY');
    expect(getTradeSessionCode({
      sessionEngineVersion: SESSION_ENGINE_VERSION,
      sessionCode: 'Frankfurt',
      entryTimestampUtc: NY,
    })).toBe('NY');
  });

  it('derives every code from the entry instant', () => {
    expect(getTradeSessionCode({ entryTimestampUtc: SYDNEY })).toBe('Sydney');
    expect(getTradeSessionCode({ entryTimestampUtc: SYDNEY_TOKYO })).toBe('SydneyTokyo');
    expect(getTradeSessionCode({ entryTimestampUtc: TOKYO })).toBe('Tokyo');
    expect(getTradeSessionCode({ entryTimestampUtc: TOKYO_LONDON })).toBe('TokyoLondon');
    expect(getTradeSessionCode({ entryTimestampUtc: LONDON })).toBe('London');
    expect(getTradeSessionCode({ entryTimestampUtc: LONDON_NY })).toBe('LondonNY');
    expect(getTradeSessionCode({ entryTimestampUtc: NY })).toBe('NY');
    expect(getTradeSessionCode({ entryTimestampUtc: WEEKEND })).toBe('Off');
  });

  it('derives from the entryMoment ladder, not from one field', () => {
    expect(getTradeSessionCode({ openTime: LONDON })).toBe('London');
    expect(getTradeSessionCode({ timestamp: LONDON })).toBe('London');
    expect(getTradeSessionCode({ openTime: timestampLike(NY) })).toBe('NY');
  });

  it('prefers a precise instant over the user pick', () => {
    expect(getTradeSessionCode({ entryTimestampUtc: NY, session: 'London' })).toBe('NY');
  });

  it('trusts a precise instant even when the stored day disagrees', () => {
    // A position opened before midnight UTC legitimately carries the next day.
    expect(getTradeSessionCode({ openTime: NY, date: '2026-08-12' })).toBe('NY');
  });

  it('falls back to the user pick when only log time is available and the day disagrees', () => {
    expect(getTradeSessionCode({ timestamp: NY, date: '2026-08-12', session: 'London' })).toBe('London');
    expect(getTradeSessionCode({ timestamp: NY, date: '2026-08-12' })).toBe('Unknown');
    // Matching day: the log-time instant is trusted.
    expect(getTradeSessionCode({ timestamp: NY, date: '2026-08-19', session: 'London' })).toBe('NY');
  });

  it('maps the legacy session vocabulary onto the four sessions, case-insensitively', () => {
    // Each city now keeps its own identity. The bare 'Asia' pick predates the
    // split and names no desk, so it resolves to the deeper Asian book.
    expect(getTradeSessionCode({ session: 'Sydney' })).toBe('Sydney');
    expect(getTradeSessionCode({ session: 'Tokyo' })).toBe('Tokyo');
    expect(getTradeSessionCode({ session: 'Asia' })).toBe('Tokyo');
    expect(getTradeSessionCode({ session: 'London' })).toBe('London');
    expect(getTradeSessionCode({ session: 'NewYork' })).toBe('NY');
    expect(getTradeSessionCode({ session: 'New York' })).toBe('NY');
    expect(getTradeSessionCode({ session: 'NY' })).toBe('NY');
    expect(getTradeSessionCode({ session: 'sYdNeY' })).toBe('Sydney');
    expect(getTradeSessionCode({ session: '  london  ' })).toBe('London');
  });

  it("returns 'Unknown' when nothing resolves", () => {
    expect(getTradeSessionCode(null)).toBe('Unknown');
    expect(getTradeSessionCode(undefined)).toBe('Unknown');
    expect(getTradeSessionCode({})).toBe('Unknown');
    expect(getTradeSessionCode({ session: 'Frankfurt' })).toBe('Unknown');
    expect(getTradeSessionCode({ entryTimestampUtc: 'not-a-date' })).toBe('Unknown');
  });

  it('always returns a SESSION_BUCKETS member', () => {
    const trades = [
      null, {}, { session: 'Tokyo' }, { entryTimestampUtc: WEEKEND },
      { entryTimestampUtc: LONDON_NY }, { sessionCode: 'nonsense' },
    ];
    trades.forEach((trade) => {
      expect(SESSION_BUCKETS).toContain(getTradeSessionCode(trade));
    });
  });
});

describe('SESSION_BUCKETS', () => {
  it('is the rules enum plus Unknown, with Off first-class', () => {
    expect(SESSION_BUCKETS).toEqual([
      'Sydney', 'Tokyo', 'London', 'NY',
      'SydneyTokyo', 'TokyoLondon', 'LondonNY',
      'Off', 'Unknown',
    ]);
    expect(SESSION_BUCKETS).toHaveLength(9);
    expect(SESSION_BUCKETS).toContain('Off');
    expect(SESSION_CODES.every((code) => SESSION_BUCKETS.includes(code))).toBe(true);
    expect(Object.isFrozen(SESSION_BUCKETS)).toBe(true);
  });
});

describe('emptySessionAnalytics', () => {
  it('stamps both versions and zeroes all nine buckets', () => {
    const empty = emptySessionAnalytics();
    expect(empty.version).toBe(SESSION_ANALYTICS_VERSION);
    expect(empty.engineVersion).toBe(SESSION_ENGINE_VERSION);
    expect(Object.keys(empty.buckets)).toEqual([...SESSION_BUCKETS]);
    SESSION_BUCKETS.forEach((bucket) => {
      Object.values(empty.buckets[bucket]).forEach((value) => expect(value).toBe(0));
    });
  });

  it('returns a fresh mutable map each call', () => {
    const a = emptySessionAnalytics();
    a.buckets.London.tradeCount = 9;
    expect(emptySessionAnalytics().buckets.London.tradeCount).toBe(0);
  });
});

describe('sessionAnalyticsDelta', () => {
  const trade = {
    id: 't1',
    status: 'closed',
    netPnl: 120,
    entry: 2400,
    sl: 2390,
    lots: 0.5,
    entryTimestampUtc: LONDON,
    closeTime: '2026-08-19T11:00:00Z',
  };

  it('always emits all seven buckets, including Off', () => {
    const delta = sessionAnalyticsDelta(trade);
    expect(Object.keys(delta)).toEqual([...SESSION_BUCKETS]);
    expect(delta.Off).toBeDefined();
    expect(delta.Off.tradeCount).toBe(0);
  });

  it('books every counter into the resolved bucket', () => {
    const delta = sessionAnalyticsDelta(trade);
    expect(delta.London).toEqual({
      tradeCount: 1,
      totalPnl: 120,
      wins: 1,
      losses: 0,
      breakEven: 0,
      grossProfit: 120,
      grossLoss: 0,
      totalR: 120 / (10 * 0.5 * XAUUSD_OZ_PER_LOT),
      rCount: 1,
      holdMsTotal: 60 * 60 * 1000,
      holdMsCount: 1,
    });
    expect(delta.NY.tradeCount).toBe(0);
  });

  it('books a loss into grossLoss as a positive magnitude', () => {
    const delta = sessionAnalyticsDelta({ ...trade, netPnl: -75 });
    expect(delta.London.losses).toBe(1);
    expect(delta.London.wins).toBe(0);
    expect(delta.London.grossLoss).toBe(75);
    expect(delta.London.grossProfit).toBe(0);
    expect(delta.London.totalPnl).toBe(-75);
  });

  it('omits R and hold samples when they are not expressible', () => {
    const noRisk = sessionAnalyticsDelta({ status: 'closed', netPnl: 50, entryTimestampUtc: LONDON });
    expect(noRisk.London.rCount).toBe(0);
    expect(noRisk.London.totalR).toBe(0);
    expect(noRisk.London.holdMsCount).toBe(0);
    // Manual trade: entry and close both fall through to the same log time.
    const logTime = sessionAnalyticsDelta({ status: 'closed', netPnl: 50, timestamp: LONDON, date: '2026-08-19' });
    expect(logTime.London.holdMsCount).toBe(0);
    expect(logTime.London.holdMsTotal).toBe(0);
  });

  it('buckets an untimed trade under Unknown', () => {
    const delta = sessionAnalyticsDelta({ status: 'closed', netPnl: 10 });
    expect(delta.Unknown.tradeCount).toBe(1);
    expect(delta.London.tradeCount).toBe(0);
  });

  it('buckets a weekend-gap fill under Off', () => {
    const delta = sessionAnalyticsDelta({ status: 'closed', netPnl: 10, entryTimestampUtc: WEEKEND });
    expect(delta.Off.tradeCount).toBe(1);
  });

  it('books nothing for an open broker position', () => {
    const delta = sessionAnalyticsDelta({ ...trade, status: 'open' });
    expect(delta).toEqual(emptySessionAnalytics().buckets);
  });

  it('round-trips to empty when the same delta is applied at multiplier −1', () => {
    // The delete-correction path: a wrong sign here drifts the aggregate forever.
    const stored = emptySessionAnalytics();
    applySessionDelta(stored, sessionAnalyticsDelta(trade, 1));
    expect(stored.buckets.London.tradeCount).toBe(1);
    applySessionDelta(stored, sessionAnalyticsDelta(trade, -1));
    expect(stored).toEqual(emptySessionAnalytics());
    expect(Object.keys(stored.buckets)).toHaveLength(9);
  });

  it('round-trips for a loss, a BE trade, an Off trade and an untagged trade', () => {
    const cases = [
      { status: 'closed', netPnl: -75, entry: 2400, sl: 2390, lots: 1, entryTimestampUtc: NY, closeTime: '2026-08-19T19:00:00Z' },
      { status: 'closed', netPnl: 0.005, entryTimestampUtc: TOKYO_LONDON },
      { status: 'closed', netPnl: 12, entryTimestampUtc: WEEKEND },
      { status: 'closed', netPnl: 12 },
    ];
    cases.forEach((candidate) => {
      const stored = emptySessionAnalytics();
      applySessionDelta(stored, sessionAnalyticsDelta(candidate, 1));
      applySessionDelta(stored, sessionAnalyticsDelta(candidate, -1));
      expect(stored).toEqual(emptySessionAnalytics());
    });
  });
});

describe('subtractSessionAnalytics', () => {
  const base = { status: 'closed', netPnl: 100, entryTimestampUtc: LONDON };

  it('moves a trade between buckets when an edit changes its session', () => {
    const diff = subtractSessionAnalytics(base, { ...base, entryTimestampUtc: NY });
    expect(diff.London.tradeCount).toBe(-1);
    expect(diff.London.totalPnl).toBe(-100);
    expect(diff.NY.tradeCount).toBe(1);
    expect(diff.NY.totalPnl).toBe(100);
    // Untouched buckets stay at zero — the diff moves one trade, it does not
    // rewrite the aggregate.
    expect(diff.Sydney.tradeCount).toBe(0);
    expect(diff.Tokyo.tradeCount).toBe(0);
  });

  it('is a no-op when nothing analytics-relevant changed', () => {
    const diff = subtractSessionAnalytics(base, { ...base, notes: 'edited' });
    expect(diff).toEqual(emptySessionAnalytics().buckets);
  });

  it('handles create (no previous) and delete (no next)', () => {
    expect(subtractSessionAnalytics(null, base).London.tradeCount).toBe(1);
    expect(subtractSessionAnalytics(base, null).London.tradeCount).toBe(-1);
  });
});

describe('sessionAnalyticsDeltaForTrades', () => {
  it('accumulates across buckets', () => {
    const total = sessionAnalyticsDeltaForTrades([
      { status: 'closed', netPnl: 100, entryTimestampUtc: LONDON },
      { status: 'closed', netPnl: -40, entryTimestampUtc: LONDON },
      { status: 'closed', netPnl: 25, entryTimestampUtc: NY },
      { status: 'open', netPnl: 999, entryTimestampUtc: NY },
    ]);
    expect(total.London.tradeCount).toBe(2);
    expect(total.London.totalPnl).toBe(60);
    expect(total.London.wins).toBe(1);
    expect(total.London.losses).toBe(1);
    expect(total.NY.tradeCount).toBe(1);
    expect(total.Off.tradeCount).toBe(0);
  });

  it('returns the zeroed seven-bucket map for empty and missing input', () => {
    expect(sessionAnalyticsDeltaForTrades([])).toEqual(emptySessionAnalytics().buckets);
    expect(sessionAnalyticsDeltaForTrades(null)).toEqual(emptySessionAnalytics().buckets);
  });
});

describe('sessionAnalyticsUpdate', () => {
  it('emits dot paths under sessionAnalytics.buckets and defers to the SDK increment', () => {
    const increment = vi.fn((value) => ({ __increment: value }));
    const delta = sessionAnalyticsDelta({
      status: 'closed', netPnl: 100, entryTimestampUtc: LONDON,
    });
    const update = sessionAnalyticsUpdate(delta, increment);

    Object.keys(update).forEach((key) => {
      expect(key.startsWith('sessionAnalytics.buckets.')).toBe(true);
    });
    expect(update['sessionAnalytics.buckets.London.tradeCount']).toEqual({ __increment: 1 });
    expect(update['sessionAnalytics.buckets.London.totalPnl']).toEqual({ __increment: 100 });
    expect(update['sessionAnalytics.buckets.London.wins']).toEqual({ __increment: 1 });
    expect(increment).toHaveBeenCalledWith(1);
    expect(increment).toHaveBeenCalledWith(100);
  });

  it('writes only the touched bucket, never all 77 fields', () => {
    const delta = sessionAnalyticsDelta({ status: 'closed', netPnl: 100, entryTimestampUtc: LONDON });
    const update = sessionAnalyticsUpdate(delta, (value) => value);
    expect(Object.keys(update).every((key) => key.includes('.London.'))).toBe(true);
    expect(Object.keys(update)).toContain('sessionAnalytics.buckets.London.grossProfit');
    expect(Object.keys(update)).not.toContain('sessionAnalytics.buckets.London.losses');
  });

  it('stamps neither version — only a full rebuild may claim one', () => {
    const update = sessionAnalyticsUpdate(
      sessionAnalyticsDelta({ status: 'closed', netPnl: 100, entryTimestampUtc: LONDON }),
      (value) => value,
    );
    expect(update['sessionAnalytics.version']).toBeUndefined();
    expect(update['sessionAnalytics.engineVersion']).toBeUndefined();
  });

  it('carries negative counters through for the delete path', () => {
    const update = sessionAnalyticsUpdate(
      sessionAnalyticsDelta({ status: 'closed', netPnl: 100, entryTimestampUtc: LONDON }, -1),
      (value) => value,
    );
    expect(update['sessionAnalytics.buckets.London.tradeCount']).toBe(-1);
    expect(update['sessionAnalytics.buckets.London.totalPnl']).toBe(-100);
  });

  it('returns {} for an all-zero or absent delta so callers can skip the write', () => {
    expect(sessionAnalyticsUpdate(emptySessionAnalytics().buckets, (v) => v)).toEqual({});
    expect(sessionAnalyticsUpdate({}, (v) => v)).toEqual({});
    expect(sessionAnalyticsUpdate(null, (v) => v)).toEqual({});
  });

  it('drops non-finite counters rather than poisoning the stored map', () => {
    const update = sessionAnalyticsUpdate(
      { London: { tradeCount: NaN, totalPnl: Infinity, wins: 1 } },
      (value) => value,
    );
    expect(update).toEqual({ 'sessionAnalytics.buckets.London.wins': 1 });
  });
});

describe('deriveSessionStats', () => {
  it('reproduces the AnalyticsPage ratios', () => {
    const stats = deriveSessionStats({
      tradeCount: 4, totalPnl: 200, wins: 2, losses: 2, breakEven: 0,
      grossProfit: 300, grossLoss: 100, totalR: 3, rCount: 2,
      holdMsTotal: 4000, holdMsCount: 2,
    });
    expect(stats.tradeCount).toBe(4);
    expect(stats.netPnl).toBe(200);
    expect(stats.winRate).toBe(0.5);                 // fraction, not percent
    expect(stats.expectancy).toBe(50);               // 0.5 × 150 + 0.5 × (−50)
    expect(stats.netR).toBe(3);
    expect(stats.rCount).toBe(2);
    expect(stats.avgHoldMs).toBe(2000);
    expect(stats.holdMsCount).toBe(2);
  });

  it('returns null for every zero denominator on an empty bucket', () => {
    const stats = deriveSessionStats(emptySessionAnalytics().buckets.Off);
    expect(stats.tradeCount).toBe(0);
    expect(stats.netPnl).toBe(0);
    expect(stats.winRate).toBeNull();
    expect(stats.expectancy).toBeNull();
    expect(stats.netR).toBeNull();
    expect(stats.avgHoldMs).toBeNull();
  });

  it('returns null — never NaN or Infinity — for a bucket with no R samples', () => {
    const stats = deriveSessionStats({ tradeCount: 3, totalPnl: 90, wins: 3, grossProfit: 90, totalR: 0, rCount: 0 });
    expect(stats.netR).toBeNull();
    expect(Number.isNaN(stats.netR)).toBe(false);
  });

  it('returns null for a bucket with no hold samples', () => {
    const stats = deriveSessionStats({ tradeCount: 3, wins: 3, grossProfit: 90, holdMsTotal: 0, holdMsCount: 0 });
    expect(stats.avgHoldMs).toBeNull();
  });

  it('never emits NaN or Infinity for any zero-denominator shape', () => {
    const shapes = [
      undefined, null, {}, emptySessionAnalytics().buckets.Asia,
      { tradeCount: 2, wins: 0, losses: 0, breakEven: 2, totalPnl: 0 },
      { tradeCount: 2, wins: 2, losses: 0, grossProfit: 40, grossLoss: 0 },
      { tradeCount: 2, wins: 0, losses: 2, grossProfit: 0, grossLoss: 40 },
      { tradeCount: 'x', wins: 'y', totalR: 'z', rCount: 'w' },
    ];
    shapes.forEach((shape) => {
      const stats = deriveSessionStats(shape);
      Object.entries(stats).forEach(([key, value]) => {
        if (value === null) return;
        expect(Number.isFinite(value), key + ' was ' + value).toBe(true);
      });
    });
  });

  it('handles an all-break-even bucket without dividing by zero', () => {
    const stats = deriveSessionStats({ tradeCount: 2, wins: 0, losses: 0, breakEven: 2, totalPnl: 0 });
    expect(stats.winRate).toBe(0);
    expect(stats.expectancy).toBe(0);
  });
});

describe('getTradeSetupKey', () => {
  /* Mirrors the §2.1a seed catalog: deterministic default_<slug> ids. */
  const catalog = {
    default_breakout: { id: 'default_breakout', name: 'Breakout', slug: 'breakout', isDefault: true, createdAt: 1000 },
    default_smc: { id: 'default_smc', name: 'SMC', slug: 'smc', isDefault: true, createdAt: 1000 },
    'default_s-r': { id: 'default_s-r', name: 'S/R', slug: 's-r', isDefault: true, createdAt: 1000 },
    default_scalp: { id: 'default_scalp', name: 'Scalp', slug: 'scalp', isDefault: true, createdAt: 1000, archived: true },
  };

  it('returns the stored setupId', () => {
    expect(getTradeSetupKey({ setupId: 'abc123' }, catalog)).toBe('abc123');
    expect(getTradeSetupKey({ setupId: '  abc123  ' }, catalog)).toBe('abc123');
  });

  it('returns an unresolvable setupId rather than folding it into untagged', () => {
    expect(getTradeSetupKey({ setupId: 'gone' }, catalog)).toBe('gone');
    expect(getTradeSetupKey({ setupId: 'gone' }, undefined)).toBe('gone');
    expect(getTradeSetupKey({ setupId: 'gone' }, {})).toBe('gone');
  });

  it('follows exactly one mergedInto hop', () => {
    const merged = {
      a: { id: 'a', name: 'A', mergedInto: 'b' },
      b: { id: 'b', name: 'B', mergedInto: 'c' },
      c: { id: 'c', name: 'C' },
    };
    expect(getTradeSetupKey({ setupId: 'a' }, merged)).toBe('b');
    expect(getTradeSetupKey({ setupId: 'b' }, merged)).toBe('c');
    expect(getTradeSetupKey({ setupId: 'c' }, merged)).toBe('c');
  });

  it('terminates on a user-authored merge loop', () => {
    const looped = {
      a: { id: 'a', mergedInto: 'b' },
      b: { id: 'b', mergedInto: 'a' },
    };
    expect(getTradeSetupKey({ setupId: 'a' }, looped)).toBe('b');
    expect(getTradeSetupKey({ setupId: 'b' }, looped)).toBe('a');
  });

  it('hops even when the merge target is not loaded', () => {
    expect(getTradeSetupKey({ setupId: 'a' }, { a: { id: 'a', mergedInto: 'not-loaded' } })).toBe('not-loaded');
  });

  it('ignores an empty mergedInto pointer', () => {
    expect(getTradeSetupKey({ setupId: 'a' }, { a: { id: 'a', mergedInto: '   ' } })).toBe('a');
    expect(getTradeSetupKey({ setupId: 'a' }, { a: { id: 'a', mergedInto: null } })).toBe('a');
  });

  it('matches legacy names against the seed catalog by slug', () => {
    expect(getTradeSetupKey({ strategy: 'Breakout' }, catalog)).toBe('default_breakout');
    expect(getTradeSetupKey({ strategy: 'breakout' }, catalog)).toBe('default_breakout');
    expect(getTradeSetupKey({ strategy: 'S/R' }, catalog)).toBe('default_s-r');
    expect(getTradeSetupKey({ setup: 'SMC' }, catalog)).toBe('default_smc');
  });

  it('honours the strategies → strategy → setup precedence of getTradeStrategyTags', () => {
    const trade = { strategies: ['SMC'], strategy: 'Breakout', setup: 'S/R' };
    expect(getTradeSetupKey(trade, catalog)).toBe('default_smc');
    expect(getTradeStrategyTags(trade)[0]).toBe('SMC');

    expect(getTradeSetupKey({ strategy: 'Breakout', setup: 'S/R' }, catalog)).toBe('default_breakout');
    expect(getTradeSetupKey({ setup: 'S/R' }, catalog)).toBe('default_s-r');
    expect(getTradeSetupKey({ strategies: ['SMC', 'Breakout'] }, catalog)).toBe('default_smc');
  });

  it('agrees with getTradeStrategyTags on an unsluggable strategies array', () => {
    // A non-empty strategies array wins outright; falling through to `strategy`
    // would make the Setups table and the Strategy chart disagree.
    const trade = { strategies: ['  '], strategy: 'Breakout' };
    expect(getTradeStrategyTags(trade)).toEqual([]);
    expect(getTradeSetupKey(trade, catalog)).toBe('untagged');
  });

  it('applies a merge hop to a slug-matched legacy trade', () => {
    const merged = { ...catalog, default_breakout: { ...catalog.default_breakout, mergedInto: 'custom1' } };
    expect(getTradeSetupKey({ strategy: 'Breakout' }, merged)).toBe('custom1');
  });

  it('skips archived catalog docs', () => {
    expect(getTradeSetupKey({ strategy: 'Scalp' }, catalog)).toBe('untagged');
  });

  it('resolves duplicate slugs by oldest createdAt, ties by lexicographic id', () => {
    const oldestWins = {
      zzz: { id: 'zzz', name: 'Breakout', createdAt: 1000 },
      aaa: { id: 'aaa', name: 'Breakout', createdAt: 2000 },
    };
    expect(getTradeSetupKey({ strategy: 'Breakout' }, oldestWins)).toBe('zzz');

    const tie = {
      zzz: { id: 'zzz', name: 'Breakout', createdAt: 1000 },
      aaa: { id: 'aaa', name: 'Breakout', createdAt: 1000 },
    };
    expect(getTradeSetupKey({ strategy: 'Breakout' }, tie)).toBe('aaa');

    // Undated docs rank last, never first.
    const undated = {
      aaa: { id: 'aaa', name: 'Breakout' },
      zzz: { id: 'zzz', name: 'Breakout', createdAt: 5000 },
    };
    expect(getTradeSetupKey({ strategy: 'Breakout' }, undated)).toBe('zzz');
  });

  it('is order-independent for duplicate slugs', () => {
    const forward = { aaa: { id: 'aaa', name: 'Breakout', createdAt: 2000 }, zzz: { id: 'zzz', name: 'Breakout', createdAt: 1000 } };
    const reversed = { zzz: { id: 'zzz', name: 'Breakout', createdAt: 1000 }, aaa: { id: 'aaa', name: 'Breakout', createdAt: 2000 } };
    expect(getTradeSetupKey({ strategy: 'Breakout' }, forward))
      .toBe(getTradeSetupKey({ strategy: 'Breakout' }, reversed));
  });

  it('prefers a stored slug over the display name and coerces Timestamp createdAt', () => {
    const renamed = {
      s1: { id: 's1', name: 'Breakout (renamed)', slug: 'breakout', createdAt: timestampLike('2026-01-01T00:00:00Z') },
    };
    expect(getTradeSetupKey({ strategy: 'Breakout' }, renamed)).toBe('s1');
  });

  it('falls back to the map key when a doc carries no id field', () => {
    expect(getTradeSetupKey({ strategy: 'Breakout' }, { keyed: { name: 'Breakout', createdAt: 1 } })).toBe('keyed');
  });

  it('accepts a Map as well as a plain object', () => {
    const asMap = new Map(Object.entries(catalog));
    expect(getTradeSetupKey({ setupId: 'default_smc' }, asMap)).toBe('default_smc');
    expect(getTradeSetupKey({ strategy: 'S/R' }, asMap)).toBe('default_s-r');
    const mergedMap = new Map([['a', { id: 'a', mergedInto: 'b' }], ['b', { id: 'b', mergedInto: 'c' }]]);
    expect(getTradeSetupKey({ setupId: 'a' }, mergedMap)).toBe('b');
  });

  it("falls back to 'untagged'", () => {
    expect(getTradeSetupKey(null, catalog)).toBe('untagged');
    expect(getTradeSetupKey({}, catalog)).toBe('untagged');
    expect(getTradeSetupKey({ strategy: '   ' }, catalog)).toBe('untagged');
    expect(getTradeSetupKey({ strategy: 'Never seeded' }, catalog)).toBe('untagged');
    expect(getTradeSetupKey({ strategy: 'Breakout' }, undefined)).toBe('untagged');
    expect(getTradeSetupKey({ strategy: 'Breakout' }, {})).toBe('untagged');
    expect(getTradeSetupKey({ strategy: 'Breakout' }, null)).toBe('untagged');
  });

  it('does not resolve inherited object properties as catalog docs', () => {
    // Trade ids and setup ids are document ids; 'constructor' is reachable input.
    expect(getTradeSetupKey({ setupId: 'constructor' }, {})).toBe('constructor');
    expect(getTradeSetupKey({ setupId: 'toString' }, catalog)).toBe('toString');
    expect(getTradeSetupKey({ strategy: '__proto__' }, catalog)).toBe('untagged');
  });

  it("is distinct from the sessions catch-alls", () => {
    expect(getTradeSetupKey({}, catalog)).not.toBe('Unknown');
    expect(getTradeSetupKey({}, catalog)).not.toBe('Off');
  });
});

describe('sample-size thresholds', () => {
  it('are the spec values', () => {
    expect(MIN_SESSION_INSIGHT_SAMPLE).toBe(10);
    expect(MIN_SETUP_SAMPLE).toBe(20);
    expect(SESSION_ANALYTICS_VERSION).toBe(1);
  });
});

describe('pre-existing exports are unchanged', () => {
  it('keeps ANALYTICS_VERSION at 2', () => {
    expect(ANALYTICS_VERSION).toBe(2);
    expect(emptyTradeAnalytics().version).toBe(2);
  });

  it('keeps the v2 analytics shape', () => {
    expect(emptyTradeAnalytics()).toEqual({
      version: 2,
      tradeCount: 0, totalPnl: 0, totalPips: 0, wins: 0, losses: 0,
      breakEven: 0, longs: 0, shorts: 0, grossProfit: 0, grossLoss: 0,
    });
  });

  it('keeps tradePnlValue preferring netPnl over pnl', () => {
    expect(tradePnlValue({ netPnl: 12, pnl: 99 })).toBe(12);
    expect(tradePnlValue({ pnl: 99 })).toBe(99);
    expect(tradePnlValue({ netPnl: 0, pnl: 99 })).toBe(0);
    expect(tradePnlValue({})).toBe(0);
    expect(tradePnlValue(null)).toBe(0);
  });

  it('keeps getTradeOutcome and isLongDirection', () => {
    expect(getTradeOutcome({ netPnl: 10 })).toBe('WIN');
    expect(getTradeOutcome({ netPnl: -10 })).toBe('LOSS');
    expect(getTradeOutcome({ netPnl: 0.005 })).toBe('BE');
    expect(getTradeOutcome({ outcome: 'win', netPnl: -10 })).toBe('WIN');
    expect(isLongDirection('BUY')).toBe(true);
    expect(isLongDirection('long')).toBe(true);
    expect(isLongDirection('SELL')).toBe(false);
  });

  it('keeps isTradeAnalyticsEligible excluding open broker positions', () => {
    expect(isTradeAnalyticsEligible({ status: 'open' })).toBe(false);
    expect(isTradeAnalyticsEligible({ status: 'OPEN' })).toBe(false);
    expect(isTradeAnalyticsEligible({ status: 'closed' })).toBe(true);
    expect(isTradeAnalyticsEligible({})).toBe(true);
    expect(isTradeAnalyticsEligible(null)).toBe(false);
  });

  it('keeps tradeAnalyticsDelta and its analytics. dot-path payload', () => {
    const delta = tradeAnalyticsDelta({ status: 'closed', netPnl: 100, pips: 20, direction: 'BUY' });
    expect(delta).toEqual({
      tradeCount: 1, totalPnl: 100, totalPips: 20, wins: 1, losses: 0,
      breakEven: 0, longs: 1, shorts: 0, grossProfit: 100, grossLoss: 0,
    });
    const update = analyticsUpdate(delta, (value) => value);
    expect(update.totalTradesLogged).toBe(1);
    expect(update['analytics.totalPnl']).toBe(100);
    expect(update['analytics.wins']).toBe(1);
  });

  it('keeps getTradeStrategyTags deduping and trimming', () => {
    expect(getTradeStrategyTags({ strategies: [' SMC ', 'SMC', ''] })).toEqual(['SMC']);
    expect(getTradeStrategyTags({ strategy: 'Breakout' })).toEqual(['Breakout']);
    expect(getTradeStrategyTags({ setup: 'S/R' })).toEqual(['S/R']);
    expect(getTradeStrategyTags(null)).toEqual([]);
  });
});

/**
 * Regression: the legacy `session` fallback was a bare index into an object
 * literal, so `session: 'constructor'` returned the Object constructor and
 * `session: '__proto__'` returned Object.prototype — neither a SESSION_BUCKETS
 * member, breaking the "returns a SESSION_BUCKETS member, always" contract.
 *
 * Reachable against the LIVE rules: firestore.rules lists `session` in the
 * trade allowlist with no type and no enum check, so a client can store it. The
 * blast radius is a Phase-2 Admin-SDK writer building a field path from the
 * returned value — `sessionAnalytics.buckets.function Object() {...}.tradeCount`
 * is an illegal Firestore field path and fails the entire batch write.
 */
describe('getTradeSessionCode — legacy `session` prototype keys', () => {
  const PROTO_KEYS = ['constructor', '__proto__', 'CONSTRUCTOR', '__PROTO__', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', ' constructor '];

  it('returns Unknown, not an inherited member, for every Object.prototype key', () => {
    for (const session of PROTO_KEYS) {
      const code = getTradeSessionCode({ session });
      expect(typeof code).toBe('string');
      expect(SESSION_BUCKETS).toContain(code);
      expect(code).toBe('Unknown');
    }
  });

  it('still folds the legacy vocabulary onto the four sessions', () => {
    expect(getTradeSessionCode({ session: 'Sydney' })).toBe('Sydney');
    expect(getTradeSessionCode({ session: 'tokyo' })).toBe('Tokyo');
    expect(getTradeSessionCode({ session: ' London ' })).toBe('London');
    expect(getTradeSessionCode({ session: 'New York' })).toBe('NY');
    expect(getTradeSessionCode({ session: 'ny' })).toBe('NY');
    expect(getTradeSessionCode({ session: 'nope' })).toBe('Unknown');
  });

  it('keeps the aggregate and its field paths legal for a prototype-key trade', () => {
    const trade = { status: 'closed', netPnl: -25, session: 'constructor' };
    const delta = sessionAnalyticsDelta(trade);

    expect(Object.keys(delta)).toEqual([...SESSION_BUCKETS]);
    expect(delta.Unknown.tradeCount).toBe(1);
    expect(delta.Unknown.totalPnl).toBe(-25);

    const update = sessionAnalyticsUpdate(delta, (value) => value);
    // Every field path must be exactly three legal segments; a function source
    // string would carry braces, dots and spaces and be rejected by Firestore.
    Object.keys(update).forEach((path) => {
      expect(path).toMatch(/^sessionAnalytics\.buckets\.[A-Za-z]+\.[A-Za-z]+$/);
    });
    expect(update['sessionAnalytics.buckets.Unknown.tradeCount']).toBe(1);
  });

  it('leaves a precise instant in charge — the legacy field is only a fallback', () => {
    expect(getTradeSessionCode({ entryTimestampUtc: LONDON, session: 'constructor' })).toBe('London');
  });
});

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DISCIPLINE_RULES,
  DISCIPLINE_RULES_VERSION,
  RULE_BOUNDS,
  RULE_IDS,
  VIOLATION_SEVERITY,
  clampRuleValue,
  costOfBrokenRules,
  evaluateRules,
  normalizeDisciplineRules,
  positionKey,
  tradeDayKey,
  violationsByTradeId,
} from '../lib/disciplineRules.js';

const DAY = '2026-08-19';
const NEXT_DAY = '2026-08-20';

/** `HH:MM` UTC on a calendar day. Every instant in this file is written out in full. */
const at = (hhmm, day = DAY) => `${day}T${hhmm}:00Z`;

/**
 * A precisely-timed trade: entry resolves from `entryTimestampUtc` and close from
 * `closeTime`, so it is never treated as log-time-only by the revenge rule.
 */
function timed({ id, position = id, open, close, day = DAY, ...rest }) {
  return {
    id,
    positionId: position,
    date: day,
    entryTimestampUtc: at(open, day),
    closeTime: at(close, day),
    ...rest,
  };
}

/** |2000 − 1980| × 0.1 × 100 oz = $200 risk → 2% of a $10,000 balance. */
const RISKY = { entry: 2000, sl: 1980, lots: 0.1 };
/** $50 risk → 0.5% of a $10,000 balance. */
const SAFE = { entry: 2000, sl: 1995, lots: 0.1 };

const BALANCE = { accountBalance: 10000 };

const onlyDay = (value) => ({ maxTradesPerDay: { enabled: true, value } });
const onlyRisk = (value) => ({ maxRiskPercent: { enabled: true, value } });
const onlyRevenge = (value) => ({ revengeWindow: { enabled: true, value } });

const pairs = (violations) => violations.map((entry) => `${entry.tradeId}:${entry.ruleId}`);
const messages = (violations) => violations.map((entry) => entry.message);

/** Deterministic LCG shuffle — the determinism contract needs a reproducible scramble. */
function shuffle(items, seed) {
  const out = [...items];
  let state = seed >>> 0;
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ─────────────────────────── settings normalization ─────────────────────────── */

describe('settings', () => {
  it('ships every rule disabled', () => {
    expect(DEFAULT_DISCIPLINE_RULES.version).toBe(DISCIPLINE_RULES_VERSION);
    for (const ruleId of RULE_IDS) {
      expect(DEFAULT_DISCIPLINE_RULES[ruleId].enabled).toBe(false);
      expect(DEFAULT_DISCIPLINE_RULES[ruleId].value).toBe(RULE_BOUNDS[ruleId].defaultValue);
    }
  });

  it('clamps to bounds and falls back to the default, never to a bound', () => {
    expect(clampRuleValue('maxTradesPerDay', 99)).toBe(RULE_BOUNDS.maxTradesPerDay.max);
    expect(clampRuleValue('maxTradesPerDay', 0)).toBe(RULE_BOUNDS.maxTradesPerDay.min);
    expect(clampRuleValue('maxTradesPerDay', 4.7)).toBe(5);
    expect(clampRuleValue('maxRiskPercent', 0.05)).toBe(RULE_BOUNDS.maxRiskPercent.min);
    expect(clampRuleValue('maxRiskPercent', 1.24)).toBe(1.2);
    expect(clampRuleValue('revengeWindow', 1000)).toBe(RULE_BOUNDS.revengeWindow.max);
    expect(clampRuleValue('maxTradesPerDay', '')).toBe(RULE_BOUNDS.maxTradesPerDay.defaultValue);
    expect(clampRuleValue('maxRiskPercent', 'abc')).toBe(RULE_BOUNDS.maxRiskPercent.defaultValue);
    expect(clampRuleValue('nope', 3)).toBeNull();
  });

  it('arms a rule only on a strict boolean true', () => {
    const normalized = normalizeDisciplineRules({
      maxTradesPerDay: { enabled: 'yes', value: 4 },
      maxRiskPercent: { enabled: true, value: 2 },
    });
    expect(normalized.maxTradesPerDay.enabled).toBe(false);
    expect(normalized.maxRiskPercent.enabled).toBe(true);
    expect(normalized.revengeWindow).toEqual({ enabled: false, value: RULE_BOUNDS.revengeWindow.defaultValue });
    expect(normalized.version).toBe(DISCIPLINE_RULES_VERSION);
  });

  it('reads trade keys off the stored fields', () => {
    expect(tradeDayKey({ date: ' 2026-08-19 ' })).toBe('2026-08-19');
    expect(tradeDayKey({ entryTimestampUtc: at('23:30') })).toBe(DAY);
    expect(tradeDayKey({})).toBeNull();
    expect(positionKey({ positionId: 'pos_1', id: 'broker_9' })).toBe('pos_1');
    expect(positionKey({ id: 'broker_9' })).toBe('broker_9');
    expect(positionKey({})).toBeNull();
  });
});

/* ─────────────────────────── 1. defaults are inert ─────────────────────────── */

describe('evaluateRules with every rule disabled', () => {
  // Breaks all three rules at once: five positions in one day, 2% risk each,
  // every entry moments after the previous loss closed.
  const flagrant = [
    timed({ id: 'x1', open: '09:00', close: '09:05', netPnl: -150, ...RISKY }),
    timed({ id: 'x2', open: '09:06', close: '09:10', netPnl: -120, ...RISKY }),
    timed({ id: 'x3', open: '09:11', close: '09:15', netPnl: -90, ...RISKY }),
    timed({ id: 'x4', open: '09:16', close: '09:20', netPnl: -80, ...RISKY }),
    timed({ id: 'x5', open: '09:21', close: '09:25', netPnl: -60, ...RISKY }),
  ];

  it('returns [] for undefined, empty, and default settings', () => {
    expect(evaluateRules(flagrant, undefined, BALANCE)).toEqual([]);
    expect(evaluateRules(flagrant, {}, BALANCE)).toEqual([]);
    expect(evaluateRules(flagrant, DEFAULT_DISCIPLINE_RULES, BALANCE)).toEqual([]);
    expect(evaluateRules(flagrant, normalizeDisciplineRules(), BALANCE)).toEqual([]);
  });

  it('proves the fixture is genuinely violating once the rules are armed', () => {
    const armed = evaluateRules(
      flagrant,
      { maxTradesPerDay: { enabled: true, value: 3 }, maxRiskPercent: { enabled: true, value: 1 }, revengeWindow: { enabled: true, value: 30 } },
      BALANCE,
    );
    expect(armed.length).toBeGreaterThan(0);
    expect(new Set(armed.map((entry) => entry.ruleId))).toEqual(new Set(RULE_IDS));
  });

  it('tolerates missing trades, settings, and context', () => {
    expect(evaluateRules(null, onlyDay(1), BALANCE)).toEqual([]);
    expect(evaluateRules([], onlyDay(1), BALANCE)).toEqual([]);
    expect(evaluateRules(flagrant, onlyRisk(1), undefined)).toEqual([]);
  });
});

/* ──────────────────────────── 2. maxTradesPerDay ──────────────────────────── */

describe('maxTradesPerDay', () => {
  it('flags every trade past the limit', () => {
    const trades = [
      timed({ id: 'a', open: '09:00', close: '09:05' }),
      timed({ id: 'b', open: '09:10', close: '09:15' }),
      timed({ id: 'c', open: '09:20', close: '09:25' }),
      timed({ id: 'd', open: '09:30', close: '09:35' }),
      timed({ id: 'e', open: '09:40', close: '09:45' }),
    ];
    const violations = evaluateRules(trades, onlyDay(3), BALANCE);
    expect(pairs(violations)).toEqual(['d:maxTradesPerDay', 'e:maxTradesPerDay']);
    expect(messages(violations)).toEqual(['4th trade of 3 allowed', '5th trade of 3 allowed']);
    expect(violations[0].severity).toBe(VIOLATION_SEVERITY);
  });

  it('counts unique positionKeys, so partial fills of one position count once', () => {
    const trades = [
      timed({ id: 'p1', open: '09:00', close: '09:05' }),
      timed({ id: 'p2', open: '09:10', close: '09:15' }),
      // One position, three fills: three docs, one trade.
      timed({ id: 'broker_1', position: 'pos_3', open: '09:20', close: '09:50' }),
      timed({ id: 'broker_2', position: 'pos_3', open: '09:21', close: '09:52' }),
      timed({ id: 'broker_3', position: 'pos_3', open: '09:22', close: '09:55' }),
    ];
    expect(evaluateRules(trades, onlyDay(3), BALANCE)).toEqual([]);
  });

  it('flags every doc of an over-limit position with that position ordinal', () => {
    const trades = [
      timed({ id: 'p1', open: '09:00', close: '09:05' }),
      timed({ id: 'p2', open: '09:10', close: '09:15' }),
      timed({ id: 'p3', open: '09:20', close: '09:25' }),
      timed({ id: 'broker_1', position: 'pos_4', open: '09:30', close: '09:50' }),
      timed({ id: 'broker_2', position: 'pos_4', open: '09:31', close: '09:55' }),
    ];
    const violations = evaluateRules(trades, onlyDay(3), BALANCE);
    expect(pairs(violations)).toEqual(['broker_1:maxTradesPerDay', 'broker_2:maxTradesPerDay']);
    expect(messages(violations)).toEqual(['4th trade of 3 allowed', '4th trade of 3 allowed']);
  });

  it('does not bleed across days', () => {
    const trades = [
      timed({ id: 'a', open: '09:00', close: '09:05' }),
      timed({ id: 'b', open: '09:10', close: '09:15' }),
      timed({ id: 'c', open: '09:20', close: '09:25' }),
      timed({ id: 'd', open: '09:00', close: '09:05', day: NEXT_DAY }),
      timed({ id: 'e', open: '09:10', close: '09:15', day: NEXT_DAY }),
      timed({ id: 'f', open: '09:20', close: '09:25', day: NEXT_DAY }),
    ];
    expect(evaluateRules(trades, onlyDay(3), BALANCE)).toEqual([]);
  });

  it('counts a still-open position and skips an undatable trade', () => {
    const trades = [
      timed({ id: 'a', open: '09:00', close: '09:05' }),
      { id: 'live', positionId: 'pos_live', date: DAY, status: 'open', entryTimestampUtc: at('09:10') },
      { id: 'nowhere', positionId: 'pos_nowhere' },
    ];
    expect(pairs(evaluateRules(trades, onlyDay(1), BALANCE))).toEqual(['live:maxTradesPerDay']);
  });

  it('renders teen ordinals correctly', () => {
    const trades = Array.from({ length: 12 }, (_, index) => timed({
      id: `t${index}`,
      open: `${String(9 + Math.floor(index / 6)).padStart(2, '0')}:${String((index % 6) * 10).padStart(2, '0')}`,
      close: `${String(9 + Math.floor(index / 6)).padStart(2, '0')}:${String((index % 6) * 10 + 5).padStart(2, '0')}`,
    }));
    expect(messages(evaluateRules(trades, onlyDay(10), BALANCE)))
      .toEqual(['11th trade of 10 allowed', '12th trade of 10 allowed']);
  });
});

/* ───────────────────────────── 3. maxRiskPercent ───────────────────────────── */

describe('maxRiskPercent', () => {
  it('flags a trade risking more than the limit', () => {
    const trades = [timed({ id: 'hot', open: '09:00', close: '09:30', ...RISKY })];
    const violations = evaluateRules(trades, onlyRisk(1), BALANCE);
    expect(pairs(violations)).toEqual(['hot:maxRiskPercent']);
    expect(violations[0].message).toBe('Risked 2% of balance, 1% allowed');
  });

  it('formats a fractional percentage without locale separators', () => {
    const trades = [timed({ id: 'hot', open: '09:00', close: '09:30', entry: 2000, sl: 1975.9, lots: 0.1 })];
    expect(messages(evaluateRules(trades, onlyRisk(1), BALANCE)))
      .toEqual(['Risked 2.41% of balance, 1% allowed']);
  });

  it('does not flag a trade sized exactly to the limit, or under it', () => {
    const trades = [
      timed({ id: 'exact', open: '09:00', close: '09:30', entry: 2000, sl: 1990, lots: 0.1 }),
      timed({ id: 'under', open: '10:00', close: '10:30', ...SAFE }),
    ];
    expect(evaluateRules(trades, onlyRisk(1), BALANCE)).toEqual([]);
  });

  it('fails open when the account balance is missing, zero, or negative', () => {
    const trades = [timed({ id: 'hot', open: '09:00', close: '09:30', ...RISKY })];
    expect(evaluateRules(trades, onlyRisk(1), undefined)).toEqual([]);
    expect(evaluateRules(trades, onlyRisk(1), {})).toEqual([]);
    expect(evaluateRules(trades, onlyRisk(1), { accountBalance: 0 })).toEqual([]);
    expect(evaluateRules(trades, onlyRisk(1), { accountBalance: -5000 })).toEqual([]);
    expect(evaluateRules(trades, onlyRisk(1), { accountBalance: null })).toEqual([]);
    // Same fixture, same rule, a usable balance: the guard above is fail-open, not a dead rule.
    expect(pairs(evaluateRules(trades, onlyRisk(1), BALANCE))).toEqual(['hot:maxRiskPercent']);
  });

  it('fails open on a trade with no resolvable risk, without muting its neighbours', () => {
    const trades = [
      // Broker-synced shape: an open price but no stop loss.
      timed({ id: 'nosl', open: '09:00', close: '09:30', openPrice: 2000, lots: 5 }),
      timed({ id: 'nolots', open: '09:40', close: '10:00', entry: 2000, sl: 1900 }),
      // A zero-distance stop resolves to null risk, never to 0.
      timed({ id: 'zerodist', open: '10:10', close: '10:30', entry: 2000, sl: 2000, lots: 5 }),
      timed({ id: 'hot', open: '10:40', close: '11:00', ...RISKY }),
    ];
    expect(pairs(evaluateRules(trades, onlyRisk(1), BALANCE))).toEqual(['hot:maxRiskPercent']);
  });
});

/* ───────────────────────────── 4. revengeWindow ───────────────────────────── */

describe('revengeWindow', () => {
  it('flags an entry inside the window after a realized loss', () => {
    const trades = [
      timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
      timed({ id: 'revenge', open: '10:12', close: '10:40', netPnl: 50 }),
    ];
    const violations = evaluateRules(trades, onlyRevenge(30), BALANCE);
    expect(pairs(violations)).toEqual(['revenge:revengeWindow']);
    expect(violations[0].message).toBe('Entered 12 minutes after a loss, inside your 30 minute cooldown');
  });

  it('does not flag an entry after a win', () => {
    const trades = [
      timed({ id: 'winner', open: '09:00', close: '10:00', netPnl: 200 }),
      timed({ id: 'next', open: '10:05', close: '10:40', netPnl: -50 }),
    ];
    expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
  });

  it('does not flag an entry outside the window, and treats the boundary as inside', () => {
    const outside = [
      timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
      timed({ id: 'late', open: '10:45', close: '11:10', netPnl: 20 }),
    ];
    expect(evaluateRules(outside, onlyRevenge(30), BALANCE)).toEqual([]);

    const onTheEdge = [
      timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
      timed({ id: 'edge', open: '10:30', close: '11:10', netPnl: 20 }),
    ];
    expect(messages(evaluateRules(onTheEdge, onlyRevenge(30), BALANCE)))
      .toEqual(['Entered 30 minutes after a loss, inside your 30 minute cooldown']);
  });

  it('uses singular and sub-minute wording', () => {
    const oneMinute = [
      timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
      timed({ id: 'quick', open: '10:01', close: '10:30', netPnl: 20 }),
    ];
    expect(messages(evaluateRules(oneMinute, onlyRevenge(30), BALANCE)))
      .toEqual(['Entered 1 minute after a loss, inside your 30 minute cooldown']);

    const instant = [
      timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
      { id: 'instant', positionId: 'instant', date: DAY, entryTimestampUtc: '2026-08-19T10:00:30Z', closeTime: at('10:30'), netPnl: 20 },
    ];
    expect(messages(evaluateRules(instant, onlyRevenge(30), BALANCE)))
      .toEqual(['Entered less than a minute after a loss, inside your 30 minute cooldown']);
  });

  it('never lets a position trigger against itself', () => {
    const trades = [
      timed({ id: 'fill_1', position: 'pos_a', open: '09:00', close: '09:30', netPnl: -60 }),
      timed({ id: 'fill_2', position: 'pos_a', open: '09:40', close: '10:00', netPnl: -40 }),
    ];
    expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
  });

  it('does not open a cooldown on an open position with a floating loss', () => {
    const trades = [
      { id: 'floating', positionId: 'pos_a', date: DAY, status: 'open', entryTimestampUtc: at('09:00'), closeTime: at('10:00'), netPnl: -100 },
      timed({ id: 'next', open: '10:05', close: '10:40', netPnl: 20 }),
    ];
    expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
  });

  it('crosses midnight — the window is not day-scoped', () => {
    const trades = [
      timed({ id: 'loser', open: '23:40', close: '23:50', netPnl: -100 }),
      timed({ id: 'revenge', open: '00:05', close: '00:30', day: NEXT_DAY, netPnl: 20 }),
    ];
    expect(messages(evaluateRules(trades, onlyRevenge(30), BALANCE)))
      .toEqual(['Entered 15 minutes after a loss, inside your 30 minute cooldown']);
  });

  describe('log-time guard', () => {
    it('produces nothing for a day batch-logged in one sitting', () => {
      const loggedAt = at('20:00');
      const trades = [
        { id: 'm1', positionId: 'm1', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: loggedAt, timestamp: loggedAt, netPnl: -150 },
        { id: 'm2', positionId: 'm2', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: loggedAt, timestamp: loggedAt, netPnl: -80 },
        { id: 'm3', positionId: 'm3', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: loggedAt, timestamp: loggedAt, netPnl: 40 },
      ];
      expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
    });

    it('does not let a log-time loss open a cooldown for a real trade', () => {
      const trades = [
        { id: 'm1', positionId: 'm1', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: at('10:00'), timestamp: at('10:00'), netPnl: -150 },
        timed({ id: 'broker', open: '10:05', close: '10:40', netPnl: -50 }),
      ];
      expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
    });

    it('does not flag a log-time trade after a real loss', () => {
      const trades = [
        timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
        { id: 'm1', positionId: 'm1', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: at('10:05'), timestamp: at('10:05'), netPnl: -50 },
      ];
      expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
    });

    it('treats a pre-release doc carrying only `timestamp` as log-time-only', () => {
      const trades = [
        { id: 'old1', positionId: 'old1', date: DAY, timestamp: at('10:00'), netPnl: -150 },
        { id: 'old2', positionId: 'old2', date: DAY, timestamp: at('10:05'), netPnl: -50 },
      ];
      expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
    });

    it('still treats a webhook doc with a precise closeTime as real trading cadence', () => {
      const trades = [
        // Entry fell through to the server write instant; the close is real.
        { id: 'hook', positionId: 'hook', date: DAY, timestamp: at('10:00'), closeTime: at('10:00'), netPnl: -150 },
        timed({ id: 'after', open: '10:10', close: '10:40', netPnl: -50 }),
      ];
      expect(messages(evaluateRules(trades, onlyRevenge(30), BALANCE)))
        .toEqual(['Entered 10 minutes after a loss, inside your 30 minute cooldown']);
    });

    it('leaves the other two rules unaffected by the guard', () => {
      const loggedAt = at('20:00');
      const manual = (id, extra) => ({
        id,
        positionId: id,
        date: DAY,
        sessionSource: 'manual-logtime',
        entryTimestampUtc: loggedAt,
        timestamp: loggedAt,
        ...extra,
      });
      const trades = [manual('m1', RISKY), manual('m2', RISKY), manual('m3', SAFE), manual('m4', SAFE)];
      const violations = evaluateRules(
        trades,
        { maxTradesPerDay: { enabled: true, value: 3 }, maxRiskPercent: { enabled: true, value: 1 }, revengeWindow: { enabled: true, value: 30 } },
        BALANCE,
      );
      expect(new Set(violations.map((entry) => entry.ruleId)))
        .toEqual(new Set(['maxTradesPerDay', 'maxRiskPercent']));
    });
  });
});

/* ────────────────────────────── 5. determinism ────────────────────────────── */

describe('determinism', () => {
  const settings = {
    maxTradesPerDay: { enabled: true, value: 3 },
    maxRiskPercent: { enabled: true, value: 1 },
    revengeWindow: { enabled: true, value: 30 },
  };

  const fixture = [
    timed({ id: 'd1', open: '08:00', close: '08:30', netPnl: -150, ...RISKY }),
    timed({ id: 'd2', open: '08:40', close: '09:10', netPnl: 60, ...SAFE }),
    timed({ id: 'd3', open: '10:00', close: '10:20', netPnl: -40, ...SAFE }),
    timed({ id: 'd4a', position: 'pos_d4', open: '10:40', close: '11:10', netPnl: 20, ...SAFE }),
    timed({ id: 'd4b', position: 'pos_d4', open: '10:45', close: '11:20', netPnl: 10, ...SAFE }),
    timed({ id: 'd5', open: '08:00', close: '08:30', day: NEXT_DAY, netPnl: -200, ...RISKY }),
    timed({ id: 'd6', open: '08:40', close: '09:10', day: NEXT_DAY, netPnl: -30, ...SAFE }),
  ];

  const expected = [
    'd1:maxRiskPercent',
    'd2:revengeWindow',
    'd4a:maxTradesPerDay',
    'd4a:revengeWindow',
    'd4b:maxTradesPerDay',
    'd4b:revengeWindow',
    'd5:maxRiskPercent',
    'd6:revengeWindow',
  ];

  it('emits violations in trade order then RULE_IDS order', () => {
    expect(pairs(evaluateRules(fixture, settings, BALANCE))).toEqual(expected);
  });

  it('returns byte-identical output for any input ordering', () => {
    const baseline = evaluateRules(fixture, settings, BALANCE);
    const orderings = [
      [...fixture].reverse(),
      ...[1, 7, 42, 1337, 90210, 2026].map((seed) => shuffle(fixture, seed)),
    ];
    for (const ordering of orderings) {
      expect(ordering.map((trade) => trade.id).sort()).toEqual(fixture.map((trade) => trade.id).sort());
      expect(evaluateRules(ordering, settings, BALANCE)).toEqual(baseline);
    }
  });

  it('does not mutate the trades it is handed', () => {
    const snapshot = JSON.stringify(fixture);
    evaluateRules(fixture, settings, BALANCE);
    expect(JSON.stringify(fixture)).toBe(snapshot);
  });
});

/* ──────────────────────────── 6. cost of the breaks ──────────────────────── */

describe('costOfBrokenRules', () => {
  const NOW = Date.parse('2026-08-19T18:00:00Z');
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const window = { now: NOW, windowMs: WEEK_MS };

  const flag = (tradeId, ruleId) => ({ tradeId, ruleId, message: 'x', severity: VIOLATION_SEVERITY });

  it('counts a trade flagged by two rules exactly once', () => {
    const trades = [timed({ id: 'a', open: '09:00', close: '09:30', netPnl: -100 })];
    const violations = [flag('a', 'maxTradesPerDay'), flag('a', 'maxRiskPercent')];
    expect(costOfBrokenRules(violations, trades, window)).toBe(-100);
  });

  it('nets winners against losers over the distinct flagged trades', () => {
    const trades = [
      timed({ id: 'a', open: '09:00', close: '09:30', netPnl: -400 }),
      timed({ id: 'b', open: '10:00', close: '10:30', netPnl: 57.9 }),
      timed({ id: 'clean', open: '11:00', close: '11:30', netPnl: -1000 }),
    ];
    const violations = [flag('a', 'maxRiskPercent'), flag('b', 'maxTradesPerDay')];
    expect(costOfBrokenRules(violations, trades, window)).toBeCloseTo(-342.1, 6);
  });

  it('respects the window, measured from the `now` param', () => {
    const trades = [
      timed({ id: 'inside', open: '09:00', close: '09:30', netPnl: -100 }),
      { id: 'stale', positionId: 'stale', date: '2026-08-01', entryTimestampUtc: '2026-08-01T09:00:00Z', netPnl: -900 },
    ];
    const violations = [flag('inside', 'maxRiskPercent'), flag('stale', 'maxRiskPercent')];
    expect(costOfBrokenRules(violations, trades, window)).toBe(-100);
    // A wider window with the same `now` pulls the older trade back in.
    expect(costOfBrokenRules(violations, trades, { now: NOW, windowMs: 60 * WEEK_MS })).toBe(-1000);
    // Rolling `now` forward past the window drops everything.
    expect(costOfBrokenRules(violations, trades, { now: NOW + 60 * WEEK_MS, windowMs: WEEK_MS })).toBe(0);
  });

  it('skips still-open positions, unflagged trades, and unusable options', () => {
    const trades = [
      { id: 'floating', positionId: 'floating', date: DAY, status: 'open', entryTimestampUtc: at('09:00'), netPnl: -800 },
      timed({ id: 'closed', open: '10:00', close: '10:30', netPnl: -60 }),
    ];
    const violations = [flag('floating', 'maxRiskPercent'), flag('closed', 'maxRiskPercent')];
    expect(costOfBrokenRules(violations, trades, window)).toBe(-60);
    expect(costOfBrokenRules([], trades, window)).toBe(0);
    expect(costOfBrokenRules(violations, trades, { windowMs: WEEK_MS })).toBe(0);
    expect(costOfBrokenRules(violations, trades, { now: NOW, windowMs: 0 })).toBe(0);
    expect(costOfBrokenRules(violations, trades, undefined)).toBe(0);
  });

  it('groups violations by trade id in a Map, dropping id-less drafts', () => {
    const violations = [flag('a', 'maxTradesPerDay'), flag('a', 'maxRiskPercent'), flag(null, 'revengeWindow')];
    const grouped = violationsByTradeId(violations);
    expect(grouped).toBeInstanceOf(Map);
    expect(grouped.size).toBe(1);
    expect(grouped.get('a').map((entry) => entry.ruleId)).toEqual(['maxTradesPerDay', 'maxRiskPercent']);
    expect(violationsByTradeId(null).size).toBe(0);
  });

  it('evaluates an id-less draft so the pre-submit warning can fire', () => {
    const trades = [
      timed({ id: 'a', open: '09:00', close: '09:05' }),
      timed({ id: 'b', open: '09:10', close: '09:15' }),
      timed({ id: 'c', open: '09:20', close: '09:25' }),
      { positionId: null, date: DAY, entryTimestampUtc: at('09:30') },
    ];
    const violations = evaluateRules(trades, onlyDay(3), BALANCE);
    expect(violations).toHaveLength(1);
    expect(violations[0].tradeId).toBeNull();
    expect(violations[0].message).toBe('4th trade of 3 allowed');
  });
});

/**
 * Regression: clampRuleValue indexed RULE_BOUNDS directly, so
 * `clampRuleValue('constructor', 5)` found the Object constructor, read
 * undefined min/max/decimals off it and returned NaN from a function whose
 * contract is a clamped number or null. RULE_BOUNDS is exported for the
 * settings card to clamp with, so the id is not always one of RULE_IDS.
 */
describe('clampRuleValue — prototype-key rule ids', () => {
  const PROTO_KEYS = ['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'];

  it('returns null, never NaN, for an Object.prototype key', () => {
    for (const ruleId of PROTO_KEYS) {
      const result = clampRuleValue(ruleId, 5);
      expect(Number.isNaN(result)).toBe(false);
      expect(result).toBeNull();
    }
  });

  it('returns null for non-string and unknown ids too', () => {
    for (const ruleId of ['nope', '', null, undefined, 42, {}]) {
      expect(clampRuleValue(ruleId, 5)).toBeNull();
    }
  });

  it('still clamps and rounds the three real rules', () => {
    expect(clampRuleValue('maxTradesPerDay', 99)).toBe(RULE_BOUNDS.maxTradesPerDay.max);
    expect(clampRuleValue('maxTradesPerDay', 0)).toBe(RULE_BOUNDS.maxTradesPerDay.min);
    expect(clampRuleValue('maxRiskPercent', 2.46)).toBe(2.5);
    expect(clampRuleValue('revengeWindow', '')).toBe(RULE_BOUNDS.revengeWindow.defaultValue);
    for (const ruleId of RULE_IDS) {
      expect(clampRuleValue(ruleId, null)).toBe(RULE_BOUNDS[ruleId].defaultValue);
    }
  });
});

/**
 * Regression: the log-time guard ANDed the two precision probes, so ONE precise
 * field cleared a trade for BOTH roles. A doc with a real `closeTime` but a
 * log-time entry was therefore eligible to be flagged on the instant its row was
 * written — the batch-logging false positive, re-entering through the close.
 *
 * Triggering a cooldown needs a precise CLOSE; receiving a flag needs a precise
 * ENTRY. The two are now gated independently.
 */
describe('revenge window — entry and close precision are separate roles', () => {
  it('does not flag a log-time entry just because the same doc carries a real close', () => {
    const trades = [
      timed({ id: 'loser', open: '10:00', close: '10:30', netPnl: -100 }),
      // Written at 10:40 with a real close at 11:00; 10:40 is when the row was
      // typed, not when the trader entered.
      { id: 'batch', positionId: 'batch', date: DAY, timestamp: at('10:40'), closeTime: at('11:00'), netPnl: 12 },
    ];
    expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
  });

  it('does not open a cooldown from a log-time close, even with a real entry', () => {
    const trades = [
      // Entry is real; the close fell through to the 20:00 log instant.
      { id: 'loser', positionId: 'loser', date: DAY, entryTimestampUtc: at('10:00'), timestamp: at('20:00'), netPnl: -100 },
      timed({ id: 'after', open: '20:05', close: '20:30', netPnl: 5 }),
    ];
    expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
  });

  it('still flags a precise entry inside a cooldown opened by a precise close', () => {
    const trades = [
      timed({ id: 'loser', open: '09:00', close: '10:00', netPnl: -100 }),
      timed({ id: 'revenge', open: '10:10', close: '10:40', netPnl: -20 }),
    ];
    expect(pairs(evaluateRules(trades, onlyRevenge(30), BALANCE))).toEqual(['revenge:revengeWindow']);
  });

  it('honours manual-logtime on both roles regardless of what else the doc carries', () => {
    const trades = [
      { id: 'm1', positionId: 'm1', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: at('10:00'), closeTime: at('10:30'), netPnl: -100 },
      { id: 'm2', positionId: 'm2', date: DAY, sessionSource: 'manual-logtime', entryTimestampUtc: at('10:35'), closeTime: at('11:00'), netPnl: -20 },
    ];
    expect(evaluateRules(trades, onlyRevenge(30), BALANCE)).toEqual([]);
  });

  it('uses openTime as a precise entry, so a broker fill is judged on its own clock', () => {
    const trades = [
      { id: 'loser', positionId: 'loser', date: DAY, openTime: at('09:00'), closeTime: at('10:00'), netPnl: -100 },
      { id: 'revenge', positionId: 'revenge', date: DAY, openTime: at('10:05'), closeTime: at('10:20'), timestamp: at('23:00'), netPnl: -30 },
    ];
    expect(pairs(evaluateRules(trades, onlyRevenge(30), BALANCE))).toEqual(['revenge:revengeWindow']);
  });

  it('leaves the day and risk rules judging the same batch-logged doc', () => {
    const doc = (id, extra) => ({ id, positionId: id, date: DAY, timestamp: at('10:40'), closeTime: at('11:00'), ...extra });
    const trades = [doc('a', RISKY), doc('b', RISKY), doc('c', RISKY), doc('d', RISKY)];
    const violations = evaluateRules(
      trades,
      { maxTradesPerDay: { enabled: true, value: 3 }, maxRiskPercent: { enabled: true, value: 1 }, revengeWindow: { enabled: true, value: 30 } },
      BALANCE,
    );
    expect(new Set(violations.map((entry) => entry.ruleId)))
      .toEqual(new Set(['maxTradesPerDay', 'maxRiskPercent']));
  });
});

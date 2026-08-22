import { describe, it, expect } from 'vitest';
import {
  SESSION_ENGINE_VERSION,
  SESSION_CODES,
  TRADING_SESSIONS,
  sessionCodeForHubs,
  resolveSessionAt,
  isWeekendRestAt,
  sessionUtcWindow,
} from '../lib/sessionEngine.js';

/**
 * Every instant in this file is an explicit UTC epoch. Nothing reads Date.now()
 * or a local-time constructor: the suite must give the same verdict on a CI box
 * in UTC and a developer laptop in Asia/Colombo.
 *
 * The engine's only ambient dependency is the ICU tz database, so the fixed
 * instants below encode the 2026 DST calendars: US 2026-03-08 → 2026-11-01,
 * EU 2026-03-29 → 2026-10-25, Sydney 2026-10-04 → 2027-04-04.
 */
const YEAR = 2026;
const HOUR_MS = 3600000;

/** Wednesdays, deliberately mid-week so the weekend short-circuit is never in play. */
const SUMMER_DAY = Date.UTC(YEAR, 6, 15); // 2026-07-15 — London BST, New York EDT
const WINTER_DAY = Date.UTC(YEAR, 0, 14); // 2026-01-14 — London GMT, New York EST

const at = (dayMs, utcHour) => dayMs + utcHour * HOUR_MS;

describe('sessionEngine constants', () => {
  it('exports the stored sessionCode enum without Unknown', () => {
    expect(SESSION_CODES).toEqual([
      'Sydney', 'Tokyo', 'London', 'NY',
      'SydneyTokyo', 'TokyoLondon', 'LondonNY',
      'Off',
    ]);
    // 'Unknown' is an analytics bucket, never a tag — firestore.rules mirrors this list.
    expect(SESSION_CODES).not.toContain('Unknown');
    expect(Object.isFrozen(SESSION_CODES)).toBe(true);
  });

  it('defines four hubs in IANA zones, never fixed UTC offsets', () => {
    expect(TRADING_SESSIONS.map((desk) => desk.id)).toEqual(['Sydney', 'Tokyo', 'London', 'NewYork']);
    // One desk, one hub: the four-session split has no grouping left to do.
    expect(TRADING_SESSIONS.map((desk) => desk.hub)).toEqual(['Sydney', 'Tokyo', 'London', 'NY']);
    for (const desk of TRADING_SESSIONS) {
      expect(desk.tz).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$/);
      expect(Number.isInteger(desk.openHour)).toBe(true);
      expect(Number.isInteger(desk.closeHour)).toBe(true);
    }
  });

  it('exports a numeric engine version', () => {
    expect(SESSION_ENGINE_VERSION).toBe(2);
  });
});

/**
 * THE MANDATORY FULL-YEAR TEST (spec §3.1, a review requirement).
 *
 * Walks all 8760 hours of 2026 — both DST regimes in both hemispheres, including
 * the six transition weekends where the four zones' offsets disagree — and asserts
 * the hub-set mapping is TOTAL: a defined enum code for every single instant.
 */
describe('resolveSessionAt — full-year totality (spec §3.1)', () => {
  const start = Date.UTC(YEAR, 0, 1, 0, 0, 0, 0);
  const end = Date.UTC(YEAR + 1, 0, 1, 0, 0, 0, 0);
  const enumCodes = new Set(SESSION_CODES);

  it('returns a defined enum code for every hour of the year', () => {
    const seen = new Set();
    let instants = 0;
    const failures = [];

    for (let ms = start; ms < end; ms += HOUR_MS) {
      instants += 1;
      const result = resolveSessionAt(ms);
      if (
        result === null
        || result === undefined
        || result.code === undefined
        || result.code === null
        || !enumCodes.has(result.code)
        || result.engineVersion !== SESSION_ENGINE_VERSION
      ) {
        // Collect rather than throw: a systematic hole should report its first
        // instants, not just the earliest one.
        if (failures.length < 10) failures.push(`${new Date(ms).toISOString()} → ${JSON.stringify(result)}`);
        continue;
      }
      seen.add(result.code);
    }

    expect(failures).toEqual([]);
    expect(instants).toBe(8760);
    // Not merely "nothing crashed": one calendar year exercises every branch of
    // the mapping, so a code missing here means a branch went unreachable.
    expect([...seen].sort()).toEqual([...SESSION_CODES].sort());
  });

  it('never diverges from sessionCodeForHubs across the year', () => {
    const mismatches = [];
    for (let ms = start; ms < end; ms += HOUR_MS) {
      const { code, hubs, desks } = resolveSessionAt(ms);
      if (sessionCodeForHubs(hubs) !== code) {
        if (mismatches.length < 10) mismatches.push(`${new Date(ms).toISOString()} ${JSON.stringify(hubs)} → ${code}`);
      }
      // hubs is folded from desks, so a hub can never appear without an open desk behind it.
      if (hubs.length > desks.length && mismatches.length < 10) {
        mismatches.push(`${new Date(ms).toISOString()} hubs ${JSON.stringify(hubs)} > desks ${JSON.stringify(desks)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('emits hubs in fixed east-to-west order, never iteration order', () => {
    const order = ['Sydney', 'Tokyo', 'London', 'NY'];
    const bad = [];
    for (let ms = start; ms < end; ms += HOUR_MS) {
      const { hubs } = resolveSessionAt(ms);
      const indexes = hubs.map((hub) => order.indexOf(hub));
      const sorted = [...indexes].sort((a, b) => a - b);
      if (indexes.join() !== sorted.join() && bad.length < 5) bad.push(new Date(ms).toISOString());
    }
    expect(bad).toEqual([]);
  });

  it('resolves Off exactly on the weekend rest, and only there', () => {
    const offOnWeekday = [];
    const openOnWeekend = [];
    for (let ms = start; ms < end; ms += HOUR_MS) {
      const { code, hubs, desks } = resolveSessionAt(ms);
      const resting = isWeekendRestAt(ms);
      if (resting && (code !== 'Off' || hubs.length || desks.length) && openOnWeekend.length < 5) {
        openOnWeekend.push(new Date(ms).toISOString());
      }
      // The four desk days union to continuous 24h cover under every offset pair
      // either hemisphere can take. A failure here is a real coverage gap opening
      // (a weekday hour with no desk), not a broken assertion.
      if (!resting && code === 'Off' && offOnWeekday.length < 5) offOnWeekday.push(new Date(ms).toISOString());
    }
    expect(openOnWeekend).toEqual([]);
    expect(offOnWeekday).toEqual([]);
  });
});

/**
 * DST correctness: the boundary must move with the LOCAL WALL CLOCK, so the same
 * session edge lands on a different UTC hour in July than in January. A fixed UTC
 * hour table would pass one of each pair below and fail the other.
 */
describe('resolveSessionAt — DST correctness', () => {
  it('opens London at 08:00 local — 07:00 UTC on BST, 08:00 UTC on GMT', () => {
    expect(resolveSessionAt(at(SUMMER_DAY, 6)).hubs).not.toContain('London');
    expect(resolveSessionAt(at(SUMMER_DAY, 7)).hubs).toContain('London');

    expect(resolveSessionAt(at(WINTER_DAY, 7)).hubs).not.toContain('London');
    expect(resolveSessionAt(at(WINTER_DAY, 8)).hubs).toContain('London');
  });

  it('closes London at 17:00 local — 16:00 UTC on BST, 17:00 UTC on GMT', () => {
    expect(resolveSessionAt(at(SUMMER_DAY, 15)).hubs).toContain('London');
    expect(resolveSessionAt(at(SUMMER_DAY, 16)).hubs).not.toContain('London');

    expect(resolveSessionAt(at(WINTER_DAY, 16)).hubs).toContain('London');
    expect(resolveSessionAt(at(WINTER_DAY, 17)).hubs).not.toContain('London');
  });

  it('opens New York at 08:00 local — 12:00 UTC on EDT, 13:00 UTC on EST', () => {
    expect(resolveSessionAt(at(SUMMER_DAY, 11)).hubs).not.toContain('NY');
    expect(resolveSessionAt(at(SUMMER_DAY, 12)).hubs).toContain('NY');

    expect(resolveSessionAt(at(WINTER_DAY, 12)).hubs).not.toContain('NY');
    expect(resolveSessionAt(at(WINTER_DAY, 13)).hubs).toContain('NY');
  });

  it('shifts the whole code sequence by one UTC hour between regimes', () => {
    // 11:00 UTC is London-only in July but 12:00 UTC is London-only in January:
    // the same wall-clock minute of the London desk day, one UTC hour apart.
    expect(resolveSessionAt(at(SUMMER_DAY, 11)).code).toBe('London');
    expect(resolveSessionAt(at(SUMMER_DAY, 12)).code).toBe('LondonNY');
    expect(resolveSessionAt(at(WINTER_DAY, 12)).code).toBe('London');
    expect(resolveSessionAt(at(WINTER_DAY, 13)).code).toBe('LondonNY');
  });

  it('tracks the southern hemisphere DST calendar independently', () => {
    // Sydney opens 07:00 local: 21:00 UTC on AEST (July), 20:00 UTC on AEDT (January).
    expect(resolveSessionAt(at(SUMMER_DAY, 20)).desks).not.toContain('Sydney');
    expect(resolveSessionAt(at(SUMMER_DAY, 21)).desks).toContain('Sydney');

    expect(resolveSessionAt(at(WINTER_DAY, 19)).desks).not.toContain('Sydney');
    expect(resolveSessionAt(at(WINTER_DAY, 20)).desks).toContain('Sydney');
  });
});

describe('resolveSessionAt — the named overlaps', () => {
  it('maps {Tokyo, London} to TokyoLondon in both regimes', () => {
    const summer = resolveSessionAt(at(SUMMER_DAY, 8)); // Tokyo open to 18:00 JST, London open from 08:00 BST
    expect(summer.hubs).toEqual(['Tokyo', 'London']);
    expect(summer.desks).toEqual(['Tokyo', 'London']);
    expect(summer.code).toBe('TokyoLondon');

    const winter = resolveSessionAt(at(WINTER_DAY, 8));
    expect(winter.hubs).toEqual(['Tokyo', 'London']);
    expect(winter.code).toBe('TokyoLondon');
  });

  it('maps {Sydney, Tokyo} to SydneyTokyo — the pair the old Asia hub hid', () => {
    // 02:00 UTC: Sydney is mid-desk and Tokyo has been open since 00:00 UTC.
    const summer = resolveSessionAt(at(SUMMER_DAY, 2));
    expect(summer.hubs).toEqual(['Sydney', 'Tokyo']);
    expect(summer.desks).toEqual(['Sydney', 'Tokyo']);
    expect(summer.code).toBe('SydneyTokyo');

    const winter = resolveSessionAt(at(WINTER_DAY, 2));
    expect(winter.hubs).toEqual(['Sydney', 'Tokyo']);
    expect(winter.code).toBe('SydneyTokyo');
  });

  it('maps {London, NY} to LondonNY in both regimes', () => {
    const summer = resolveSessionAt(at(SUMMER_DAY, 13));
    expect(summer.hubs).toEqual(['London', 'NY']);
    expect(summer.desks).toEqual(['London', 'NewYork']);
    expect(summer.code).toBe('LondonNY');

    const winter = resolveSessionAt(at(WINTER_DAY, 14));
    expect(winter.hubs).toEqual(['London', 'NY']);
    expect(winter.code).toBe('LondonNY');
  });
});

/**
 * The priority fallback. {Sydney, NY} is a real seasonal set, not a hypothetical:
 * with New York on EST (17:00 close = 22:00 UTC) and Sydney on AEDT (07:00 open =
 * 20:00 UTC) it occurs for two hours every trading day, ~Nov–Mar. It resolves to
 * 'NY' rather than another enum value, which is what keeps firestore.rules stable.
 */
describe('resolveSessionAt — priority fallback (London > NY > Tokyo > Sydney)', () => {
  it('resolves the natural winter {Sydney, NY} window to NY', () => {
    for (const utcHour of [20, 21]) {
      const result = resolveSessionAt(at(WINTER_DAY, utcHour));
      expect(result.hubs).toEqual(['Sydney', 'NY']);
      expect(result.desks).toEqual(['Sydney', 'NewYork']);
      expect(result.code).toBe('NY');
    }
    // The hour either side is a single hub, proving the window is a real 2h overlap.
    expect(resolveSessionAt(at(WINTER_DAY, 19)).code).toBe('NY');
    expect(resolveSessionAt(at(WINTER_DAY, 19)).hubs).toEqual(['NY']);
    expect(resolveSessionAt(at(WINTER_DAY, 22)).hubs).toEqual(['Sydney']);
  });

  it('also resolves the October {Sydney, NY} window (NY on EDT, Sydney on AEDT)', () => {
    // Between the Sydney (Oct 4) and US (Nov 1) transitions the overlap narrows to 1h.
    const result = resolveSessionAt(Date.UTC(YEAR, 9, 14, 20));
    expect(result.hubs).toEqual(['Sydney', 'NY']);
    expect(result.code).toBe('NY');
  });

  it('applies the priority scan directly for every non-exact set', () => {
    expect(sessionCodeForHubs(['Sydney', 'NY'])).toBe('NY');
    expect(sessionCodeForHubs(['NY', 'Sydney'])).toBe('NY');
    expect(sessionCodeForHubs(['Tokyo', 'NY'])).toBe('NY');
    expect(sessionCodeForHubs(['Sydney', 'London', 'NY'])).toBe('London');
    expect(sessionCodeForHubs(['Sydney', 'Tokyo', 'London'])).toBe('London');
    expect(sessionCodeForHubs(['Sydney'])).toBe('Sydney');
    expect(sessionCodeForHubs(['Tokyo'])).toBe('Tokyo');
    expect(sessionCodeForHubs(['London'])).toBe('London');
    expect(sessionCodeForHubs(['NY'])).toBe('NY');
  });

  it('treats the retired v1 hub names as unrecognised rather than coercing them', () => {
    // 'Asia' is no longer a hub. It is ignored like any other unknown member,
    // which is what keeps the function total across the version change.
    expect(sessionCodeForHubs(['Asia'])).toBe('Off');
    expect(sessionCodeForHubs(['Asia', 'London'])).toBe('London');
  });

  it('is total — never undefined for any input shape', () => {
    expect(sessionCodeForHubs([])).toBe('Off');
    expect(sessionCodeForHubs(null)).toBe('Off');
    expect(sessionCodeForHubs(undefined)).toBe('Off');
    expect(sessionCodeForHubs(['Mars'])).toBe('Off');
    expect(sessionCodeForHubs(['Mars', 'Tokyo'])).toBe('Tokyo');
    expect(sessionCodeForHubs(new Set(['London', 'NY']))).toBe('LondonNY');
    expect(sessionCodeForHubs(new Set(['Tokyo', 'Tokyo']))).toBe('Tokyo');

    // Exhaustive over the powerset of the four hubs.
    const hubs = ['Sydney', 'Tokyo', 'London', 'NY'];
    for (let mask = 0; mask < 16; mask += 1) {
      const set = hubs.filter((_, index) => mask & (1 << index));
      expect(SESSION_CODES).toContain(sessionCodeForHubs(set));
    }
  });
});

describe('resolveSessionAt — Off', () => {
  it('short-circuits the weekend rest to Off with no open hubs', () => {
    // Saturday 07:00 New York: London's wall clock says 12:00 on a Saturday, which
    // without the weekend gate would tag a weekend-gap fill 'London'.
    const saturday = Date.UTC(YEAR, 0, 17, 12);
    expect(isWeekendRestAt(saturday)).toBe(true);
    const result = resolveSessionAt(saturday);
    expect(result.code).toBe('Off');
    expect(result.hubs).toEqual([]);
    expect(result.desks).toEqual([]);
    expect(result.engineVersion).toBe(SESSION_ENGINE_VERSION);
  });

  it('stays Off across the whole rest window and reopens as Sydney', () => {
    expect(resolveSessionAt(Date.UTC(YEAR, 0, 16, 22)).code).toBe('Off'); // Fri 17:00 EST
    expect(resolveSessionAt(Date.UTC(YEAR, 0, 17, 3)).code).toBe('Off');
    expect(resolveSessionAt(Date.UTC(YEAR, 0, 18, 21)).code).toBe('Off'); // Sun 16:00 EST
    const reopen = resolveSessionAt(Date.UTC(YEAR, 0, 18, 22)); // Sun 17:00 EST
    expect(reopen.code).toBe('Sydney');
    expect(reopen.desks).toEqual(['Sydney']);
  });
});

describe('isWeekendRestAt', () => {
  it('is true all Saturday', () => {
    for (const utcHour of [0, 6, 12, 18, 23]) {
      expect(isWeekendRestAt(Date.UTC(YEAR, 0, 17, utcHour))).toBe(true);
      expect(isWeekendRestAt(Date.UTC(YEAR, 6, 18, utcHour))).toBe(true);
    }
  });

  it('is true from Friday 18:00 New York and false at Friday 15:00 New York', () => {
    // Winter Friday, EST (UTC−5).
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 16, 23))).toBe(true); // Fri 18:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 16, 20))).toBe(false); // Fri 15:00 EST
    // Summer Friday, EDT (UTC−4).
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 17, 22))).toBe(true); // Fri 18:00 EDT
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 17, 19))).toBe(false); // Fri 15:00 EDT
  });

  it('is false at Sunday 19:00 New York', () => {
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 19, 0))).toBe(false); // Sun 19:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 19, 23))).toBe(false); // Sun 19:00 EDT
  });

  it('flips exactly at 17:00 New York wall clock, not at a fixed UTC hour', () => {
    // Friday close. Same wall-clock minute; one UTC hour apart across the regimes.
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 16, 21))).toBe(false); // Fri 16:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 16, 22))).toBe(true); //  Fri 17:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 17, 20))).toBe(false); // Fri 16:00 EDT
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 17, 21))).toBe(true); //  Fri 17:00 EDT

    // 21:00 UTC on a Friday is the proof: resting in July, still trading in January.
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 17, 21))).toBe(true);
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 16, 21))).toBe(false);

    // Sunday reopen, same shape.
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 18, 21))).toBe(true); //  Sun 16:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 0, 18, 22))).toBe(false); // Sun 17:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 19, 20))).toBe(true); //  Sun 16:00 EDT
    expect(isWeekendRestAt(Date.UTC(YEAR, 6, 19, 21))).toBe(false); // Sun 17:00 EDT
  });

  it('holds on the US DST transition Sundays themselves', () => {
    // 2026-03-08 spring forward and 2026-11-01 fall back both land on a Sunday,
    // so the reopen boundary is computed on a day whose offset changed that morning.
    expect(isWeekendRestAt(Date.UTC(YEAR, 2, 8, 20))).toBe(true); //  Sun 16:00 EST→EDT day
    expect(isWeekendRestAt(Date.UTC(YEAR, 2, 8, 21))).toBe(false); // Sun 17:00 EDT
    expect(isWeekendRestAt(Date.UTC(YEAR, 10, 1, 21))).toBe(true); //  Sun 16:00 EST
    expect(isWeekendRestAt(Date.UTC(YEAR, 10, 1, 22))).toBe(false); // Sun 17:00 EST
  });

  it('is false midweek', () => {
    for (const day of [12, 13, 14, 15]) {
      expect(isWeekendRestAt(Date.UTC(YEAR, 0, day, 12))).toBe(false);
    }
  });

  it('fails open on unusable input rather than pausing every caller', () => {
    for (const bad of [null, undefined, NaN, Infinity, -Infinity, '', '   ', 'not-a-date', new Date('nope'), {}, [], true, 8.64e15 + 1]) {
      expect(isWeekendRestAt(bad)).toBe(false);
    }
  });
});

describe('resolveSessionAt — input handling', () => {
  it('accepts epoch ms, Date and ISO string interchangeably', () => {
    const ms = at(WINTER_DAY, 14);
    const expected = {
      code: 'LondonNY',
      hubs: ['London', 'NY'],
      desks: ['London', 'NewYork'],
      engineVersion: SESSION_ENGINE_VERSION,
    };
    expect(resolveSessionAt(ms)).toEqual(expected);
    expect(resolveSessionAt(new Date(ms))).toEqual(expected);
    expect(resolveSessionAt(new Date(ms).toISOString())).toEqual(expected);
  });

  it('returns null for invalid input without throwing', () => {
    for (const bad of [null, undefined, NaN, Infinity, -Infinity, '', '   ', 'not-a-date', new Date('nope'), {}, [], true, 8.64e15 + 1, -8.64e15 - 1]) {
      expect(() => resolveSessionAt(bad)).not.toThrow();
      expect(resolveSessionAt(bad)).toBeNull();
    }
  });

  it('never returns null for a valid instant, including the extremes of the range', () => {
    for (const ms of [0, 8.64e15, -8.64e15, Date.UTC(1971, 0, 4, 12), Date.UTC(2038, 0, 19, 3)]) {
      const result = resolveSessionAt(ms);
      expect(result).not.toBeNull();
      expect(SESSION_CODES).toContain(result.code);
    }
  });
});

describe('sessionUtcWindow', () => {
  it('projects the London desk day onto the UTC hours of the given date', () => {
    expect(sessionUtcWindow('London', '2026-08-19')).toEqual({ startUtcHour: 7, endUtcHour: 16 });
    expect(sessionUtcWindow('London', '2026-01-14')).toEqual({ startUtcHour: 8, endUtcHour: 17 });
  });

  it('moves the projection with DST, which is why nothing derived from it may be stored', () => {
    expect(sessionUtcWindow('NY', '2026-07-15')).toEqual({ startUtcHour: 12, endUtcHour: 21 });
    expect(sessionUtcWindow('NY', '2026-01-14')).toEqual({ startUtcHour: 13, endUtcHour: 22 });
    // Sydney wraps midnight; start > end is expected, not a bug. Tokyo does not
    // wrap, and never moves: JST has no DST. Splitting the old Asia hub is what
    // makes that difference visible at all.
    expect(sessionUtcWindow('Sydney', '2026-07-15')).toEqual({ startUtcHour: 21, endUtcHour: 6 });
    expect(sessionUtcWindow('Sydney', '2026-01-14')).toEqual({ startUtcHour: 20, endUtcHour: 5 });
    expect(sessionUtcWindow('Tokyo', '2026-07-15')).toEqual({ startUtcHour: 0, endUtcHour: 9 });
    expect(sessionUtcWindow('Tokyo', '2026-01-14')).toEqual({ startUtcHour: 0, endUtcHour: 9 });
  });

  it('intersects the two hubs for an overlap code', () => {
    // Tokyo was always the binding side of the old AsiaLondon window, so these
    // two carry the same hours the retired code did.
    expect(sessionUtcWindow('TokyoLondon', '2026-07-15')).toEqual({ startUtcHour: 7, endUtcHour: 9 });
    expect(sessionUtcWindow('TokyoLondon', '2026-01-14')).toEqual({ startUtcHour: 8, endUtcHour: 9 });
    expect(sessionUtcWindow('SydneyTokyo', '2026-07-15')).toEqual({ startUtcHour: 0, endUtcHour: 6 });
    expect(sessionUtcWindow('SydneyTokyo', '2026-01-14')).toEqual({ startUtcHour: 0, endUtcHour: 5 });
    expect(sessionUtcWindow('LondonNY', '2026-07-15')).toEqual({ startUtcHour: 12, endUtcHour: 16 });
    expect(sessionUtcWindow('LondonNY', '2026-01-14')).toEqual({ startUtcHour: 13, endUtcHour: 17 });
  });

  it('reads a day string literally and accepts Date and epoch ms', () => {
    const expected = { startUtcHour: 8, endUtcHour: 17 };
    expect(sessionUtcWindow('London', '2026-01-14')).toEqual(expected);
    expect(sessionUtcWindow('London', new Date(Date.UTC(YEAR, 0, 14, 23, 59)))).toEqual(expected);
    expect(sessionUtcWindow('London', Date.UTC(YEAR, 0, 14, 0, 1))).toEqual(expected);
  });

  it('has no hours for codes without hours, and never throws on bad input', () => {
    for (const code of ['Off', 'Unknown', '', null, undefined, 'Asia', 'AsiaLondon', 'asia']) {
      expect(sessionUtcWindow(code, '2026-01-14')).toBeNull();
    }
    for (const date of [null, undefined, NaN, '', 'nope', new Date('nope'), {}]) {
      expect(() => sessionUtcWindow('London', date)).not.toThrow();
      expect(sessionUtcWindow('London', date)).toBeNull();
    }
  });

  it('stays defined for every code on every day of the year it has hours for', () => {
    const withHours = ['Sydney', 'Tokyo', 'London', 'NY', 'SydneyTokyo', 'TokyoLondon', 'LondonNY'];
    const holes = [];
    for (let ms = Date.UTC(YEAR, 0, 1); ms < Date.UTC(YEAR + 1, 0, 1); ms += 24 * HOUR_MS) {
      for (const code of withHours) {
        const window = sessionUtcWindow(code, ms);
        if (!window || !Number.isInteger(window.startUtcHour) || !Number.isInteger(window.endUtcHour)) {
          if (holes.length < 10) holes.push(`${code} @ ${new Date(ms).toISOString().slice(0, 10)}`);
        }
      }
    }
    expect(holes).toEqual([]);
  });
});

/**
 * Regression: the three lookups below were bare property indexes into object
 * literals, so any Object.prototype key resolved truthy and escaped the guard
 * that was supposed to reject it. `sessionAnalytics.buckets` is deliberately
 * not schema-validated in firestore.rules, so a UI that iterates stored bucket
 * keys can hand `sessionUtcWindow` a 'constructor' and crash the render.
 */
describe('prototype-key totality', () => {
  const PROTO_KEYS = ['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString'];

  it('sessionUtcWindow returns null for every Object.prototype key, as it does for any unknown code', () => {
    for (const code of PROTO_KEYS) {
      expect(() => sessionUtcWindow(code, '2026-01-14')).not.toThrow();
      expect(sessionUtcWindow(code, '2026-01-14')).toBeNull();
    }
  });

  it('sessionUtcWindow still answers for the seven codes that have hours', () => {
    for (const code of ['Sydney', 'Tokyo', 'London', 'NY', 'SydneyTokyo', 'TokyoLondon', 'LondonNY']) {
      expect(sessionUtcWindow(code, '2026-01-14')).not.toBeNull();
    }
  });

  it('sessionUtcWindow ignores non-string codes rather than coercing them', () => {
    for (const code of [42, true, {}, [], ['Asia'], new Date(0), Symbol.iterator]) {
      expect(() => sessionUtcWindow(code, '2026-01-14')).not.toThrow();
      expect(sessionUtcWindow(code, '2026-01-14')).toBeNull();
    }
  });

  it('sessionCodeForHubs is total for a non-iterable argument, not just a nullish one', () => {
    for (const hubs of [{}, 42, true, { Asia: true }, Symbol.iterator, () => {}, new Date(0)]) {
      expect(() => sessionCodeForHubs(hubs)).not.toThrow();
      expect(sessionCodeForHubs(hubs)).toBe('Off');
    }
  });

  it('sessionCodeForHubs keeps answering for the iterable shapes it documents', () => {
    expect(sessionCodeForHubs(['Tokyo'])).toBe('Tokyo');
    expect(sessionCodeForHubs(new Set(['London', 'NY']))).toBe('LondonNY');
    expect(sessionCodeForHubs(['Sydney', 'NY'])).toBe('NY');
    expect(sessionCodeForHubs([])).toBe('Off');
    expect(sessionCodeForHubs(null)).toBe('Off');
  });
});

/**
 * Regression: toEpochMs accepted only Date | number | string, so a Firestore
 * Timestamp resolved to null and tagged nothing. api/ imports this module
 * directly and there `doc.data().openTime` IS a Timestamp, so the failure would
 * have been silent and total on the server side.
 */
describe('Firestore Timestamp input', () => {
  const ms = at(WINTER_DAY, 14);
  const seconds = ms / 1000;
  const expected = { code: 'LondonNY', hubs: ['London', 'NY'], desks: ['London', 'NewYork'], engineVersion: SESSION_ENGINE_VERSION };

  it('resolveSessionAt reads all three stored Timestamp shapes', () => {
    expect(resolveSessionAt({ toDate: () => new Date(ms), seconds, nanoseconds: 0 })).toEqual(expected);
    expect(resolveSessionAt({ seconds, nanoseconds: 0 })).toEqual(expected);
    expect(resolveSessionAt({ _seconds: seconds, _nanoseconds: 0 })).toEqual(expected);
  });

  it('isWeekendRestAt reads them too, so polling and tagging cannot disagree', () => {
    const saturday = Date.UTC(YEAR, 0, 17, 12); // 2026-01-17
    expect(isWeekendRestAt({ seconds: saturday / 1000 })).toBe(true);
    expect(isWeekendRestAt({ _seconds: saturday / 1000 })).toBe(true);
    expect(isWeekendRestAt({ toDate: () => new Date(saturday) })).toBe(true);
    expect(isWeekendRestAt({ seconds: ms / 1000 })).toBe(false);
  });

  it('still rejects Timestamp-shaped objects that carry no usable instant', () => {
    for (const bad of [{ seconds: NaN }, { seconds: '123' }, { _seconds: Infinity }, { toDate: () => null }, { toDate: () => new Date('nope') }, { seconds: 1e15 }]) {
      expect(() => resolveSessionAt(bad)).not.toThrow();
      expect(resolveSessionAt(bad)).toBeNull();
    }
  });
});

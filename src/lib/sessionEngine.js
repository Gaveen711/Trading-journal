/**
 * The gold trading session engine, defined once.
 *
 * Lives apart from goldSessions.js because goldSessions.js imports React for its
 * clock/reveal hooks, and the server (api/_metaapi-broker.js, api/_tradeService.ts)
 * must resolve session tags at ingest through the same api → src/lib import lane
 * goldContract.js established. goldSessions.js re-exports every public name here,
 * so the public Vitrine site keeps its legacy UTC-hour model unchanged.
 *
 * goldContract.js discipline: no React, no Firestore, no localStorage, no ambient
 * Date.now(), no ambient locale. Every instant arrives as a parameter.
 *
 * firestore.rules cannot import JS — its sessionCode enum check mirrors
 * SESSION_CODES; if you add a code here, update the rules enum in the same commit.
 */

/**
 * Boundary definitions version. Bumping it invalidates every stored
 * `sessionEngineVersion` tag, so tags and the sessionAnalytics aggregate are
 * re-derived lazily on read (mirrors the ANALYTICS_VERSION gate).
 */
export const SESSION_ENGINE_VERSION = 1;

/** The stored `sessionCode` enum. Mirrored by firestore.rules; 'Unknown' is not one — that is an analytics bucket, never a tag. */
export const SESSION_CODES = Object.freeze(['Asia', 'London', 'NY', 'AsiaLondon', 'LondonNY', 'Off']);

/**
 * The four hubs in EXCHANGE-LOCAL WALL-CLOCK hours with IANA zones — never fixed
 * UTC offsets. All four zones observe DST on their own calendars (Sydney on the
 * opposite hemisphere's), so any UTC hour table is wrong for roughly eight months
 * of the year and wrong in a different direction in each half.
 *
 * The hours are the bullion/cash desk day of each centre rather than a venue's
 * electronic session: Sydney 07:00–16:00, Tokyo 09:00–18:00, London 08:00–17:00
 * (the LBMA desk day, spanning both fixes), New York 08:00–17:00 (the COMEX floor
 * day). That is what a discretionary gold trader means by "the London session";
 * 23-hour electronic hours would collapse every session into one bucket. These are
 * boundary definitions — changing one is a SESSION_ENGINE_VERSION bump.
 *
 * `id` deliberately reuses the legacy `session` field vocabulary
 * (Sydney/Tokyo/London/NewYork) so the log-form prefill maps without a lookup.
 * Sydney and Tokyo share `hub: 'Asia'`: Asia is one edge to a trader, and two
 * buckets would halve every Asian sample.
 */
export const TRADING_SESSIONS = Object.freeze([
  Object.freeze({ id: 'Sydney', city: 'Sydney', tz: 'Australia/Sydney', hub: 'Asia', openHour: 7, closeHour: 16 }),
  Object.freeze({ id: 'Tokyo', city: 'Tokyo', tz: 'Asia/Tokyo', hub: 'Asia', openHour: 9, closeHour: 18 }),
  Object.freeze({ id: 'London', city: 'London', tz: 'Europe/London', hub: 'London', openHour: 8, closeHour: 17 }),
  Object.freeze({ id: 'NewYork', city: 'New York', tz: 'America/New_York', hub: 'NY', openHour: 8, closeHour: 17 }),
]);

/**
 * Overlap wins over any single hub, and London outranks NY outranks Asia when the
 * open set is not one of the two named overlaps. Order is load-bearing: it is the
 * priority scan in sessionCodeForHubs.
 */
const HUB_PRIORITY = Object.freeze(['London', 'NY', 'Asia']);

/** Deterministic output order for `hubs` — east to west by opening order, independent of priority. */
const HUB_ORDER = Object.freeze(['Asia', 'London', 'NY']);

/** Weekend rest is anchored to the New York desk close/reopen; see isWeekendRestAt. */
const WEEKEND_TZ = 'America/New_York';
const WEEKEND_BOUNDARY_HOUR = 17;

/**
 * Which hub groups each code projects onto. Off/Unknown are absent on purpose —
 * they have no hours. Read through hasOwnProperty in sessionUtcWindow, never as
 * a bare index: `sessionAnalytics.buckets` is deliberately not schema-validated
 * in the deployed rules, so a UI iterating stored bucket keys can reach here
 * with 'constructor' or '__proto__' and a bare index would hand back a function
 * for the `for…of` to choke on.
 */
const CODE_HUBS = Object.freeze({
  Asia: Object.freeze(['Asia']),
  London: Object.freeze(['London']),
  NY: Object.freeze(['NY']),
  AsiaLondon: Object.freeze(['Asia', 'London']),
  LondonNY: Object.freeze(['London', 'NY']),
});

const EMPTY = Object.freeze([]);
const DAY_MS = 86400000;
/** Beyond ±8.64e15 a Date is invalid and Intl.formatToParts throws RangeError rather than returning NaN. */
const MAX_TIME_MS = 8.64e15;
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * One Intl.DateTimeFormat per zone, forever. The lazy backfill walks thousands of
 * trades × four zones, and constructing a formatter costs ~100× a format call —
 * this Map is the difference between a backfill that runs and one that hangs.
 */
const ZONE_FORMATTERS = new Map();

function zoneFormatter(timeZone) {
  let formatter = ZONE_FORMATTERS.get(timeZone);
  if (!formatter) {
    // 'en-US' is passed explicitly so the ambient locale can never shift the parts;
    // hourCycle 'h23' (not hour12: false) is what keeps midnight as 00 instead of 24.
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    ZONE_FORMATTERS.set(timeZone, formatter);
  }
  return formatter;
}

/** Wall-clock fields of `ms` in `timeZone`. The only DST-aware primitive in this file. */
function zoneParts(timeZone, ms) {
  const parts = zoneFormatter(timeZone).formatToParts(new Date(ms));
  const out = { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
  for (const part of parts) {
    if (part.type in out) out[part.type] = Number(part.value);
  }
  return out;
}

/** Day-of-week (0=Sun) of a zone's wall-clock date, without touching weekday name strings. */
function zoneWeekday(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

/** Zone offset at an instant, in ms. Truncates `ms` to whole seconds because the parts carry no sub-second field. */
function zoneOffsetMs(timeZone, ms) {
  const parts = zoneParts(timeZone, ms);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/**
 * A wall-clock hour in a zone → the UTC instant. Two passes: the first offset is
 * read at the wrong instant by up to one offset, the second at an instant already
 * within an offset of the answer, which converges for every real transition.
 */
function wallClockToUtc(timeZone, year, month, day, hour) {
  const guess = Date.UTC(year, month - 1, day, hour);
  const first = guess - zoneOffsetMs(timeZone, guess);
  return guess - zoneOffsetMs(timeZone, first);
}

/**
 * Firestore Timestamp | Date | epoch ms | parseable date string → epoch ms, or
 * null. Cross-realm safe (instanceof Date is not).
 *
 * The Timestamp tiers are not decoration. api/ imports this module directly, and
 * there `doc.data().openTime` IS a Timestamp — rejecting it would make
 * resolveSessionAt return null on every server-side trade and tag nothing, in
 * silence. The tiers deliberately mirror momentMs in tradeAnalytics.js
 * (client Timestamp via toDate, Admin SDK via _seconds, and the {seconds} form
 * that survives a JSON round-trip); that module imports this one, so the ladder
 * cannot be shared without a cycle — if you add a shape there, add it here.
 */
function toEpochMs(instant) {
  let ms = null;
  if (typeof instant === 'number') ms = instant;
  else if (Object.prototype.toString.call(instant) === '[object Date]') ms = instant.getTime();
  else if (typeof instant === 'string' && instant.trim()) ms = Date.parse(instant);
  else if (typeof instant?.toDate === 'function') ms = instant.toDate()?.getTime?.() ?? null;
  else if (typeof instant?.seconds === 'number') ms = instant.seconds * 1000;
  else if (typeof instant?._seconds === 'number') ms = instant._seconds * 1000;
  if (ms === null || !Number.isFinite(ms) || Math.abs(ms) > MAX_TIME_MS) return null;
  return ms;
}

/** Date | epoch ms | 'YYYY-MM-DD' → the UTC calendar date, or null. Day strings are read literally, never through a local-time parse. */
function utcCalendarDate(date) {
  if (typeof date === 'string') {
    const match = ISO_DAY.exec(date.trim());
    if (match) return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }
  const ms = toEpochMs(date);
  if (ms === null) return null;
  const value = new Date(ms);
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
}

/** Whole-hour boundaries, so comparing the wall-clock hour alone is exact: 16:59 is open, 17:00 is not. */
function isDeskOpenAt(desk, ms) {
  const { hour } = zoneParts(desk.tz, ms);
  return desk.openHour < desk.closeHour
    ? hour >= desk.openHour && hour < desk.closeHour
    : hour >= desk.openHour || hour < desk.closeHour;
}

/**
 * Total over arbitrary hub sets — this is the contract, not a convenience.
 * Exact {Asia,London} and {London,NY} are the two named overlaps; every other
 * non-empty set collapses to its highest-priority member, which is what makes the
 * seasonal {Asia,NY} set resolvable (with the US on EST and Sydney on AEDT, roughly
 * November–March, NY's 17:00 close falls ~2h after Sydney's 07:00 open) without a
 * seventh enum value or a rules change. Unrecognised members are ignored, so this
 * never returns undefined.
 *
 * Total for any argument, not just for any hub set: a non-iterable value yields
 * 'Off' rather than a TypeError, because the totality this function sells is
 * what resolveSessionAt's priority scan and every caller downstream rely on.
 *
 * @param {string[]|Set<string>|null|undefined} hubs
 * @returns {'Asia'|'London'|'NY'|'AsiaLondon'|'LondonNY'|'Off'}
 */
export function sessionCodeForHubs(hubs) {
  const open = new Set();
  if (hubs && typeof hubs[Symbol.iterator] === 'function') {
    for (const hub of hubs) {
      if (HUB_PRIORITY.includes(hub)) open.add(hub);
    }
  }
  if (open.size === 0) return 'Off';
  if (open.size === 2) {
    if (open.has('Asia') && open.has('London')) return 'AsiaLondon';
    if (open.has('London') && open.has('NY')) return 'LondonNY';
  }
  return HUB_PRIORITY.find((hub) => open.has(hub));
}

/**
 * The session in force at an instant.
 *
 * Weekend rest short-circuits to Off with no open hubs: gold is shut from the NY
 * Friday close to the NY Sunday reopen, and without this a Saturday-morning London
 * wall clock would tag a weekend-gap fill 'London'.
 *
 * @param {Date|number|string|{toDate:Function}|{seconds:number}|{_seconds:number}} instant
 * @returns {{code: string, hubs: string[], desks: string[], engineVersion: number}|null}
 *   null only for missing/invalid input.
 */
export function resolveSessionAt(instant) {
  const ms = toEpochMs(instant);
  if (ms === null) return null;
  if (isWeekendRestAt(ms)) {
    return { code: 'Off', hubs: EMPTY, desks: EMPTY, engineVersion: SESSION_ENGINE_VERSION };
  }
  const desks = [];
  const open = new Set();
  for (const desk of TRADING_SESSIONS) {
    if (!isDeskOpenAt(desk, ms)) continue;
    desks.push(desk.id);
    open.add(desk.hub);
  }
  // HUB_ORDER, not iteration order: `hubs` is compared and rendered, so it must be stable.
  const hubs = HUB_ORDER.filter((hub) => open.has(hub));
  return {
    code: sessionCodeForHubs(hubs),
    hubs,
    desks,
    engineVersion: SESSION_ENGINE_VERSION,
  };
}

/**
 * Friday ≥17:00 through Sunday <17:00, America/New_York wall clock. The single
 * weekend truth for all new code — the NY anchor is DST-safe on both hemispheres
 * and covers every desk's local weekend, so no per-desk weekday check is needed.
 *
 * Returns false (not paused, not resting) for unusable input: callers gate polling
 * and tagging on this, and failing open keeps them working rather than silent.
 *
 * @param {Date|number|string|{toDate:Function}|{seconds:number}|{_seconds:number}} instant
 * @returns {boolean}
 */
export function isWeekendRestAt(instant) {
  const ms = toEpochMs(instant);
  if (ms === null) return false;
  const parts = zoneParts(WEEKEND_TZ, ms);
  const weekday = zoneWeekday(parts);
  if (weekday === 6) return true;
  if (weekday === 5) return parts.hour >= WEEKEND_BOUNDARY_HOUR;
  if (weekday === 0) return parts.hour < WEEKEND_BOUNDARY_HOUR;
  return false;
}

/** Union of a hub group's desks on one UTC calendar date, as absolute instants. */
function hubWindowMs(hub, day) {
  let start = null;
  let end = null;
  for (const desk of TRADING_SESSIONS) {
    if (desk.hub !== hub) continue;
    // Anchored at 12:00 UTC: every one of the four zones shares the given calendar date at midday UTC.
    const local = zoneParts(desk.tz, Date.UTC(day.year, day.month - 1, day.day, 12));
    const open = wallClockToUtc(desk.tz, local.year, local.month, local.day, desk.openHour);
    let close = wallClockToUtc(desk.tz, local.year, local.month, local.day, desk.closeHour);
    if (close <= open) close += DAY_MS;
    start = start === null ? open : Math.min(start, open);
    end = end === null ? close : Math.max(end, close);
  }
  // Sydney and Tokyo overlap at every offset pair either zone can take, so min/max is a true union, not a hull.
  return start === null ? null : { start, end };
}

/**
 * The UTC projection of a code's hours on a given date — a display annotation only.
 * DST moves it twice a year on each side, which is exactly why it takes a date and
 * why nothing derived from it may be stored.
 *
 * Single-hub codes give that hub's span; overlap codes give the intersection of
 * their two hubs. Hours may wrap (Asia is ~21→09 UTC).
 *
 * @param {string} code A sessionCode. 'Off', 'Unknown', null and unknown codes have no hours.
 * @param {Date|number|string} date UTC calendar date; a 'YYYY-MM-DD' day string is read literally.
 * @returns {{startUtcHour: number, endUtcHour: number}|null}
 */
export function sessionUtcWindow(code, date) {
  const hubs = typeof code === 'string' && Object.prototype.hasOwnProperty.call(CODE_HUBS, code)
    ? CODE_HUBS[code]
    : null;
  if (!hubs) return null;
  const day = utcCalendarDate(date);
  if (!day) return null;
  let start = null;
  let end = null;
  for (const hub of hubs) {
    const window = hubWindowMs(hub, day);
    if (!window) return null;
    start = start === null ? window.start : Math.max(start, window.start);
    end = end === null ? window.end : Math.min(end, window.end);
  }
  if (start === null || start >= end) return null;
  return {
    startUtcHour: new Date(start).getUTCHours(),
    endUtcHour: new Date(end).getUTCHours(),
  };
}

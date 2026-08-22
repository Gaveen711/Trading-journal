import { XAUUSD_OZ_PER_LOT, outcomeForPnl } from './goldContract.js';
// sessionEngine.js, not goldSessions.js: goldSessions.js imports React for its
// clock/reveal hooks and this module is imported by api/ (_tradeService.ts,
// _brokerTradePersistence.ts) through the goldContract import lane.
import { SESSION_CODES, SESSION_ENGINE_VERSION, resolveSessionAt } from './sessionEngine.js';

export const ANALYTICS_VERSION = 2;

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Returns canonical strategy tags across current and legacy trade schemas. */
export function getTradeStrategyTags(trade) {
  if (!trade) return [];
  const source = Array.isArray(trade.strategies) && trade.strategies.length
    ? trade.strategies
    : trade.strategy
      ? [trade.strategy]
      : trade.setup
        ? [trade.setup]
        : [];
  return [...new Set(source.map((tag) => String(tag).trim()).filter(Boolean))];
}

/** Net P&L is preferred for broker trades; manual trades fall back to P&L. */
export function tradePnlValue(trade) {
  return number(trade?.netPnl ?? trade?.pnl);
}

/** Uses stored outcome when present and derives it for older broker records. */
export function getTradeOutcome(trade) {
  const provided = String(trade?.outcome || '').toUpperCase();
  if (['WIN', 'LOSS', 'BE'].includes(provided)) return provided;
  return outcomeForPnl(tradePnlValue(trade));
}
/** Owns the LONG/SHORT/BUY/SELL vocabulary across current and legacy trades. */
export function isLongDirection(direction) {
  const normalized = String(direction || '').toUpperCase();
  return normalized === 'BUY' || normalized === 'LONG';
}

/**
 * The other half of the pair. Callers that only tested `=== 'SELL'` silently
 * dropped every trade recorded as 'SHORT' from their counts.
 */
export function isShortDirection(direction) {
  const normalized = String(direction || '').toUpperCase();
  return normalized === 'SELL' || normalized === 'SHORT';
}

const emptyDelta = () => ({
  tradeCount: 0, totalPnl: 0, totalPips: 0, wins: 0, losses: 0,
  breakEven: 0, longs: 0, shorts: 0, grossProfit: 0, grossLoss: 0,
});

export function emptyTradeAnalytics() {
  return { version: ANALYTICS_VERSION, ...emptyDelta() };
}

export function isTradeAnalyticsEligible(trade) {
  if (!trade) return false;
  return String(trade.status || '').toLowerCase() !== 'open';
}

export function tradeAnalyticsDelta(trade, multiplier = 1) {
  const delta = emptyDelta();
  if (!isTradeAnalyticsEligible(trade)) return delta;
  const pnl = tradePnlValue(trade);
  const outcome = getTradeOutcome(trade);
  const direction = String(trade.direction || trade.type || '').toUpperCase();
  const isLong = isLongDirection(direction);
  const isShort = isShortDirection(direction);
  delta.tradeCount = multiplier;
  delta.totalPnl = pnl * multiplier;
  delta.totalPips = number(trade.pips) * multiplier;
  delta.wins = (outcome === 'WIN' ? 1 : 0) * multiplier;
  delta.losses = (outcome === 'LOSS' ? 1 : 0) * multiplier;
  delta.breakEven = (outcome === 'BE' ? 1 : 0) * multiplier;
  delta.longs = (isLong ? 1 : 0) * multiplier;
  delta.shorts = (isShort ? 1 : 0) * multiplier;
  delta.grossProfit = (pnl > 0 ? pnl : 0) * multiplier;
  delta.grossLoss = (pnl < 0 ? Math.abs(pnl) : 0) * multiplier;
  return delta;
}

/**
 * Firestore update payload for an analytics delta — the write-shaping that
 * used to be hand-copied by every aggregate writer (client repository, trade
 * webhook, broker persistence). `incrementFactory` is the SDK's increment:
 * FieldValue.increment server-side, firestore/lite increment client-side.
 */
export function analyticsUpdate(delta, incrementFactory) {
  return {
    totalTradesLogged: incrementFactory(delta.tradeCount),
    ...Object.fromEntries(
      Object.entries(delta).map(([key, value]) => ['analytics.' + key, incrementFactory(value)]),
    ),
  };
}

export function subtractTradeAnalytics(previous, next) {
  const before = tradeAnalyticsDelta(previous);
  const after = tradeAnalyticsDelta(next);
  return Object.fromEntries(Object.keys(after).map((key) => [key, after[key] - before[key]]));
}

export function analyticsDeltaForTrades(trades) {
  return trades.reduce((total, trade) => {
    const delta = tradeAnalyticsDelta(trade);
    Object.keys(total).forEach((key) => { total[key] += delta[key]; });
    return total;
  }, emptyDelta());
}

/* ─────────────────────────── shared normalizers ───────────────────────────
 * One definition each of "when did this trade happen" and "what did it risk",
 * because sessions and discipline rules would otherwise ship two answers to
 * the same question about the same document.
 */

/** Beyond ±8.64e15 a Date is invalid; letting such a value through would poison hold-time sums. */
const MAX_TIME_MS = 8.64e15;

/**
 * The coercion ladder for every timestamp shape this app stores: Firestore
 * Timestamp (client and Admin SDK), Date, ISO string, epoch ms, and the
 * serialized {seconds}/{_seconds} forms that survive a JSON round-trip.
 * tradeUtils.js carries the same ladder but also locale formatters and an
 * ambient todayStr(), so the api → src/lib lane cannot import it.
 */
function momentMs(value) {
  if (value === null || value === undefined || value === '') return null;
  let ms = null;
  if (typeof value === 'number') ms = value;
  // Cross-realm safe; instanceof Date is not, and broker payloads cross realms.
  else if (Object.prototype.toString.call(value) === '[object Date]') ms = value.getTime();
  else if (typeof value === 'string') ms = Date.parse(value);
  else if (typeof value?.toDate === 'function') ms = value.toDate()?.getTime?.() ?? null;
  else if (typeof value?.seconds === 'number') ms = value.seconds * 1000;
  else if (typeof value?._seconds === 'number') ms = value._seconds * 1000;
  return Number.isFinite(ms) && Math.abs(ms) <= MAX_TIME_MS ? ms : null;
}

/** Ordered by precision, not by convenience: `timestamp` is log time, a proxy only. */
const ENTRY_FIELDS = Object.freeze(['entryTimestampUtc', 'openTime', 'timestamp']);
const CLOSE_FIELDS = Object.freeze(['closeTime', 'timestamp']);

/** Which field answered, not just the answer — getTradeSessionCode distrusts the log-time tier. */
function firstMoment(trade, fields) {
  for (const field of fields) {
    const ms = momentMs(trade?.[field]);
    if (ms !== null) return { ms, field };
  }
  return { ms: null, field: null };
}

/** The canonical entry instant, epoch ms or null. */
export function entryMoment(trade) {
  return firstMoment(trade, ENTRY_FIELDS).ms;
}

/** The canonical close instant, epoch ms or null. */
export function closeMoment(trade) {
  return firstMoment(trade, CLOSE_FIELDS).ms;
}

const finiteOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Dollar risk at entry: |entry − sl| × lots × ounces-per-lot. The one risk
 * formula — realized R and the discipline risk rule both call it, so they can
 * never disagree about a trade's exposure.
 *
 * Null, never 0, when the inputs cannot express a risk (no stop, no size, a
 * zero-distance stop): every consumer divides by this, and a 0 would turn R
 * into Infinity and the risk rule into a silent no-op.
 *
 * `openPrice` backs `entry` for broker/webhook documents, which store the
 * open price under that name; they carry no `sl` today and resolve to null.
 */
export function resolveTradeRiskUsd(trade) {
  const entry = finiteOrNull(trade?.entry ?? trade?.openPrice);
  const sl = finiteOrNull(trade?.sl);
  const lots = finiteOrNull(trade?.lots);
  if (entry === null || !sl || !lots) return null;
  const risk = Math.abs(entry - sl) * lots * XAUUSD_OZ_PER_LOT;
  return risk > 0 ? risk : null;
}

const SLUG_SEPARATORS = /[^a-z0-9]+/g;
const SLUG_EDGES = /^-+|-+$/g;

/**
 * Setup name → slug. The result contains only [a-z0-9-], which is what makes
 * `default_<slug>` seed ids Firestore-legal — the legacy value 'S/R' would
 * otherwise produce the illegal id `default_s/r`.
 *
 * The same function normalizes both sides of the legacy match in
 * getTradeSetupKey; a second slugging rule anywhere reopens that bug.
 */
export function slugifySetupName(value) {
  return String(value ?? '').toLowerCase().replace(SLUG_SEPARATORS, '-').replace(SLUG_EDGES, '');
}

/* ────────────────────────────── sessions (A) ────────────────────────────── */

/** Governs the `sessionAnalytics` map shape only; ANALYTICS_VERSION stays 2 this release. */
export const SESSION_ANALYTICS_VERSION = 1;

/** Below this a bucket is excluded from the deterministic insight line. */
export const MIN_SESSION_INSIGHT_SAMPLE = 10;

/** Below this a setup row shows a low-sample chip and a muted expectancy. */
export const MIN_SETUP_SAMPLE = 20;

const UNKNOWN_BUCKET = 'Unknown';

/**
 * The seven aggregate buckets, in render order — the stored tag enum plus
 * Unknown, derived from SESSION_CODES so the bucket set can never drift from
 * firestore.rules. Every enum value is a first-class bucket, `Off` included:
 * an unhandled bucket inside an Admin-SDK broker batch fails the whole sync,
 * and Off trades are routine (weekend-gap fills, off-hours instants).
 *
 * Three catch-alls exist across this release and none of them are the same
 * thing: `Off` is timed but outside every session, `Unknown` is untimed, and
 * the setups table's `untagged` is untagged. Do not fold them together.
 */
export const SESSION_BUCKETS = Object.freeze([...SESSION_CODES, UNKNOWN_BUCKET]);

/**
 * The legacy user-picked `session` vocabulary, folded onto session codes. Since
 * the four-session split each city maps to itself; the bare 'asia' pick — which
 * predates the split and names no desk — resolves to Tokyo, the Asian gold desk
 * with by far the deeper book.
 *
 * Read through hasOwnProperty at the one call site, never as a bare index:
 * `session` is in firestore.rules' trade allowlist with no type and no enum
 * check, so a client can store `session: 'constructor'`. A bare index would
 * resolve that to Object itself, return a function where the contract promises
 * a SESSION_BUCKETS member, and hand a Phase-2 Admin-SDK writer an illegal
 * `sessionAnalytics.buckets.<function source>` field path that fails the whole
 * batch. This is a JS-side fix; the deployed rules need no change for it.
 */
const LEGACY_SESSION_CODES = Object.freeze({
  sydney: 'Sydney',
  tokyo: 'Tokyo',
  asia: 'Tokyo',
  london: 'London',
  newyork: 'NY',
  'new york': 'NY',
  ny: 'NY',
});

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a stored `date` day string contradicts an instant. No comparable day string contradicts nothing. */
function dayMatchesInstant(date, ms) {
  const day = typeof date === 'string' ? date.trim() : '';
  if (!ISO_DAY.test(day)) return true;
  return day === new Date(ms).toISOString().slice(0, 10);
}

/**
 * The session a trade belongs to — the only sanctioned analytics reader of
 * session identity. Returns a SESSION_BUCKETS member, always.
 *
 * A stored tag is trusted only at the current engine version, which is what
 * makes a SESSION_ENGINE_VERSION bump self-heal on read with no migration.
 *
 * Derivation trusts a precise instant unconditionally — a broker position
 * opened before midnight UTC legitimately carries the next day's `date` — but
 * distrusts the log-time tier when `date` disagrees with it. A backdated or
 * date-edited manual trade carries today's `timestamp` against another day's
 * `date`; deriving from it would fabricate a session, so the user's own
 * `session` pick answers instead, and 'Unknown' when there is none.
 */
export function getTradeSessionCode(trade) {
  if (!trade) return UNKNOWN_BUCKET;
  if (trade.sessionEngineVersion === SESSION_ENGINE_VERSION && SESSION_CODES.includes(trade.sessionCode)) {
    return trade.sessionCode;
  }
  const { ms, field } = firstMoment(trade, ENTRY_FIELDS);
  if (ms !== null && (field !== 'timestamp' || dayMatchesInstant(trade.date, ms))) {
    const resolved = resolveSessionAt(ms);
    if (resolved) return resolved.code;
  }
  const legacy = String(trade.session || '').trim().toLowerCase();
  return (Object.prototype.hasOwnProperty.call(LEGACY_SESSION_CODES, legacy)
    ? LEGACY_SESSION_CODES[legacy]
    : null) || UNKNOWN_BUCKET;
}

/**
 * grossProfit/grossLoss are carried so deriveSessionStats can reproduce the
 * AnalyticsPage expectancy formula verbatim rather than the netPnl/count
 * shortcut, which differs whenever a break-even trade has a non-zero P&L
 * inside OUTCOME_EPSILON. rCount and holdMsCount are the denominators that
 * keep every derived ratio null instead of NaN.
 */
const emptySessionBucket = () => ({
  tradeCount: 0, totalPnl: 0, wins: 0, losses: 0, breakEven: 0,
  grossProfit: 0, grossLoss: 0, totalR: 0, rCount: 0,
  holdMsTotal: 0, holdMsCount: 0,
});

/** Every bucket present and zeroed, so accumulation and subtraction never branch on absence. */
const emptySessionDelta = () => Object.fromEntries(SESSION_BUCKETS.map((bucket) => [bucket, emptySessionBucket()]));

/** The stored map: sibling of `analytics`, carrying its own two version gates. */
export function emptySessionAnalytics() {
  return {
    version: SESSION_ANALYTICS_VERSION,
    engineVersion: SESSION_ENGINE_VERSION,
    buckets: emptySessionDelta(),
  };
}

export function sessionAnalyticsDelta(trade, multiplier = 1) {
  const delta = emptySessionDelta();
  if (!isTradeAnalyticsEligible(trade)) return delta;
  // Falls back rather than indexing undefined: a throw here fails an entire
  // Admin-SDK sync batch, and every trade must land somewhere.
  const bucket = delta[getTradeSessionCode(trade)] || delta[UNKNOWN_BUCKET];
  const pnl = tradePnlValue(trade);
  const outcome = getTradeOutcome(trade);
  bucket.tradeCount = multiplier;
  bucket.totalPnl = pnl * multiplier;
  bucket.wins = (outcome === 'WIN' ? 1 : 0) * multiplier;
  bucket.losses = (outcome === 'LOSS' ? 1 : 0) * multiplier;
  bucket.breakEven = (outcome === 'BE' ? 1 : 0) * multiplier;
  bucket.grossProfit = (pnl > 0 ? pnl : 0) * multiplier;
  bucket.grossLoss = (pnl < 0 ? Math.abs(pnl) : 0) * multiplier;
  const risk = resolveTradeRiskUsd(trade);
  if (risk !== null) {
    bucket.totalR = (pnl / risk) * multiplier;
    bucket.rCount = multiplier;
  }
  const entry = entryMoment(trade);
  const close = closeMoment(trade);
  // Strictly positive: a manual trade's entry and close both fall through to
  // log time, and a 0 ms hold would drag every average toward zero.
  if (entry !== null && close !== null && close > entry) {
    bucket.holdMsTotal = (close - entry) * multiplier;
    bucket.holdMsCount = multiplier;
  }
  return delta;
}

/** Correction for an edit: an edit that moves a trade between sessions writes both buckets. */
export function subtractSessionAnalytics(previous, next) {
  const before = sessionAnalyticsDelta(previous);
  const after = sessionAnalyticsDelta(next);
  return Object.fromEntries(SESSION_BUCKETS.map((bucket) => [
    bucket,
    Object.fromEntries(
      Object.keys(after[bucket]).map((key) => [key, after[bucket][key] - before[bucket][key]]),
    ),
  ]));
}

/** Bulk accumulator for the broker batch and the lazy AnalyticsPage rebuild. */
export function sessionAnalyticsDeltaForTrades(trades) {
  return (trades || []).reduce((total, trade) => {
    const delta = sessionAnalyticsDelta(trade);
    SESSION_BUCKETS.forEach((bucket) => {
      Object.keys(total[bucket]).forEach((key) => { total[bucket][key] += delta[bucket][key]; });
    });
    return total;
  }, emptySessionDelta());
}

/**
 * Firestore update payload for a session delta, mirroring analyticsUpdate.
 * `incrementFactory` is the SDK's increment: FieldValue.increment server-side,
 * firestore/lite increment client-side.
 *
 * Deliberately stamps neither `version` nor `engineVersion`. An incremental
 * writer stamping the current engine version onto counters accumulated under
 * an older one would produce version-matched drift that the lazy gate can
 * never detect — only the full rebuild, which recomputes every bucket, is
 * entitled to claim a version. Zero and non-finite counters are dropped so a
 * single-session sync writes one bucket's fields rather than all 77; an
 * all-zero delta yields {} and callers can skip the write.
 */
export function sessionAnalyticsUpdate(delta, incrementFactory) {
  const update = {};
  SESSION_BUCKETS.forEach((bucket) => {
    const counters = delta?.[bucket];
    if (!counters) return;
    Object.entries(counters).forEach(([key, value]) => {
      if (Number.isFinite(value) && value !== 0) {
        update['sessionAnalytics.buckets.' + bucket + '.' + key] = incrementFactory(value);
      }
    });
  });
  return update;
}

/**
 * Read-time ratios for one bucket, using the AnalyticsPage formulas verbatim.
 * Every ratio is null when its denominator is zero — never NaN, never
 * Infinity, because these render straight into table cells. Tolerates a
 * missing bucket: an incremental writer only creates the buckets it touches.
 *
 * `winRate` is a fraction (0–1); presentation owns the percent rounding.
 */
export function deriveSessionStats(bucket) {
  const tradeCount = number(bucket?.tradeCount);
  const wins = number(bucket?.wins);
  const losses = number(bucket?.losses);
  const rCount = number(bucket?.rCount);
  const holdMsCount = number(bucket?.holdMsCount);
  const avgWin = wins ? number(bucket?.grossProfit) / wins : 0;
  const avgLoss = losses ? -(number(bucket?.grossLoss) / losses) : 0;
  const winRate = tradeCount ? wins / tradeCount : null;
  return {
    tradeCount,
    netPnl: number(bucket?.totalPnl),
    winRate,
    expectancy: winRate === null ? null : (winRate * avgWin) + ((1 - winRate) * avgLoss),
    netR: rCount ? number(bucket?.totalR) : null,
    rCount,
    avgHoldMs: holdMsCount ? number(bucket?.holdMsTotal) / holdMsCount : null,
    holdMsCount,
  };
}

/* ─────────────────────────────── setups (B) ─────────────────────────────── */

/** The setups catch-all. Distinct from the sessions Unknown/Off buckets by design (see SESSION_BUCKETS). */
const UNTAGGED_SETUP = 'untagged';

const trimmedOrNull = (value) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
};

/** Accepts the hook's plain-object map or a Map; own properties only, so 'constructor' cannot resolve. */
function setupDoc(setupsById, id) {
  if (!setupsById || !id) return null;
  const found = typeof setupsById.get === 'function'
    ? setupsById.get(id)
    : (Object.prototype.hasOwnProperty.call(setupsById, id) ? setupsById[id] : null);
  return found && typeof found === 'object' ? found : null;
}

function setupEntries(setupsById) {
  if (!setupsById) return [];
  if (typeof setupsById.entries === 'function' && typeof setupsById.get === 'function') {
    return [...setupsById.entries()];
  }
  return Object.entries(setupsById);
}

/**
 * Exactly one hop. Merge pointers are user-authored across devices, so a chain
 * can loop; one hop is total and terminates, and the Manage dialog is where
 * multi-level merges get flattened.
 */
function followMerge(id, setupsById) {
  const doc = setupDoc(setupsById, id);
  return (doc && trimmedOrNull(doc.mergedInto)) || id;
}

/**
 * Source selection mirrors getTradeStrategyTags exactly — a non-empty
 * `strategies` array wins outright over `strategy` and `setup` — so the Setups
 * table and the adjacent Strategy chart can never bucket one trade differently.
 */
function legacySetupName(trade) {
  const source = Array.isArray(trade.strategies) && trade.strategies.length
    ? trade.strategies
    : trade.strategy
      ? [trade.strategy]
      : trade.setup
        ? [trade.setup]
        : [];
  return source.map((tag) => String(tag)).find((tag) => slugifySetupName(tag)) || null;
}

/**
 * Cross-device create races can leave two live docs on one slug — rules cannot
 * enforce uniqueness across a subcollection — so the winner is pinned: oldest
 * createdAt, ties by lexicographic id. Undated docs sort last, never first.
 */
function matchSetupIdBySlug(slug, setupsById) {
  if (!slug) return null;
  let bestId = null;
  let bestRank = Infinity;
  setupEntries(setupsById).forEach(([key, doc]) => {
    if (!doc || typeof doc !== 'object' || doc.archived) return;
    if (slugifySetupName(trimmedOrNull(doc.slug) || doc.name) !== slug) return;
    const id = trimmedOrNull(doc.id) || String(key);
    const created = momentMs(doc.createdAt);
    const rank = created === null ? Infinity : created;
    if (bestId === null || rank < bestRank || (rank === bestRank && id < bestId)) {
      bestId = id;
      bestRank = rank;
    }
  });
  return bestId;
}

/**
 * The single bucket a trade reports under. Returns a catalog id or 'untagged'.
 *
 * A stored `setupId` is the trade's identity and survives renames, so it is
 * returned even when the catalog has not loaded or no longer holds it —
 * folding an unresolvable id into 'untagged' would merge it with genuinely
 * untagged trades and make the count wrong rather than merely unlabelled.
 *
 * Legacy trades match by slug against the seeded catalog, which is what lets
 * pre-release history bucket with zero document rewrites.
 *
 * @param {object} trade
 * @param {Record<string, object>|Map<string, object>} [setupsById]
 */
export function getTradeSetupKey(trade, setupsById) {
  if (!trade) return UNTAGGED_SETUP;
  const setupId = trimmedOrNull(trade.setupId);
  if (setupId) return followMerge(setupId, setupsById);
  const legacy = legacySetupName(trade);
  if (!legacy) return UNTAGGED_SETUP;
  const matched = matchSetupIdBySlug(slugifySetupName(legacy), setupsById);
  return matched ? followMerge(matched, setupsById) : UNTAGGED_SETUP;
}

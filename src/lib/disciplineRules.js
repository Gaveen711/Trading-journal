/**
 * Discipline rules — three hardcoded rules, evaluated on read, never stored.
 *
 * Storing violations would be wrong three ways: broker backfill arrives out of
 * order while every rule here is order-dependent, a threshold edit has to apply
 * retroactively to history, and a stored flag is spoofable by a client write.
 * The settings map is therefore the only persisted state; flags are derived.
 *
 * goldContract.js discipline: no React, no Firestore, no localStorage, no
 * ambient Date.now(), no ambient locale. Account balance and `now` are params.
 *
 * The timing and risk primitives are imported, never redefined (R1/R2): a
 * second entry-instant ladder or risk formula in this file is exactly the drift
 * tradeAnalytics.js was extended to prevent.
 *
 * Advisory only. Nothing in this module blocks, gates, or writes anything.
 */
import {
  closeMoment,
  entryMoment,
  getTradeOutcome,
  isTradeAnalyticsEligible,
  resolveTradeRiskUsd,
  tradePnlValue,
} from './tradeAnalytics.js';

/** Governs the stored `disciplineRules` map shape only. */
export const DISCIPLINE_RULES_VERSION = 1;

/**
 * The three rules, in evaluation and display order. Also the key set of the
 * stored map — ids and stored keys are the same strings so no lookup table can
 * fall out of sync with the enum.
 */
export const RULE_IDS = Object.freeze(['maxTradesPerDay', 'maxRiskPercent', 'revengeWindow']);

/**
 * Bounds live here, not in the stored map: writing policy into every user doc
 * freezes it at save time, and the §4.4 clamp-on-save would otherwise be a
 * second copy of these numbers. `decimals` is the rounding the clamp applies —
 * a count of trades and a cooldown in minutes are integers, risk is one decimal.
 */
export const RULE_BOUNDS = Object.freeze({
  maxTradesPerDay: Object.freeze({ min: 1, max: 20, decimals: 0, unit: 'trades', defaultValue: 3 }),
  maxRiskPercent: Object.freeze({ min: 0.1, max: 10, decimals: 1, unit: '%', defaultValue: 1 }),
  revengeWindow: Object.freeze({ min: 5, max: 240, decimals: 0, unit: 'min', defaultValue: 30 }),
});

/**
 * The seed written to a new user doc. Every rule ships disabled: a rule the
 * trader did not choose is not their rule, and flagging history on defaults
 * would make the feature read as judgement rather than as a mirror.
 */
export const DEFAULT_DISCIPLINE_RULES = Object.freeze({
  version: DISCIPLINE_RULES_VERSION,
  maxTradesPerDay: Object.freeze({ enabled: false, value: RULE_BOUNDS.maxTradesPerDay.defaultValue }),
  maxRiskPercent: Object.freeze({ enabled: false, value: RULE_BOUNDS.maxRiskPercent.defaultValue }),
  revengeWindow: Object.freeze({ enabled: false, value: RULE_BOUNDS.revengeWindow.defaultValue }),
});

/**
 * StatusSquare's state vocabulary, so a chip renders `state={violation.severity}`
 * with no mapping table. One value because there is no blocking tier — an
 * advisory feature has nothing more severe than "look at this".
 */
export const VIOLATION_SEVERITY = 'attn';

const MINUTE_MS = 60000;

/** A trade risking exactly the limit is not a breach; float dust must not make it one. */
const RISK_EPSILON = 1e-9;

/** Day strings are read literally — a local-time parse would shift the key by a day. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const trimmedOrNull = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
};

const positiveOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/** Locale-free and trailing-zero-free: 2.40 → '2.4', 1 → '1'. toLocaleString is banned here. */
const formatNumber = (value, decimals) => String(Number(value.toFixed(decimals)));

const ORDINAL_SUFFIXES = Object.freeze(['th', 'st', 'nd', 'rd']);

function ordinalLabel(count) {
  const teens = count % 100;
  if (teens >= 11 && teens <= 13) return `${count}th`;
  return `${count}${ORDINAL_SUFFIXES[count % 10] || 'th'}`;
}

/** Floor, not round: "1 minute after a loss" must never describe a 30-second gap. */
function elapsedLabel(ms) {
  const minutes = Math.floor(ms / MINUTE_MS);
  if (minutes < 1) return 'less than a minute';
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/* ───────────────────────────────── settings ───────────────────────────────── */

/**
 * Clamps to the rule's bounds and rounds to its precision. Exported because the
 * settings card clamps the same values on save; two clamps would drift.
 * Missing/blank/unparseable falls back to the default rather than to a bound,
 * which would silently arm a rule at its strictest setting.
 */
export function clampRuleValue(ruleId, value) {
  // hasOwnProperty, not a bare index: RULE_BOUNDS is exported for the settings
  // card to reuse, and `RULE_BOUNDS['constructor']` is truthy — its undefined
  // min/max would return NaN from a function that documents null.
  const bounds = Object.prototype.hasOwnProperty.call(RULE_BOUNDS, ruleId) ? RULE_BOUNDS[ruleId] : null;
  if (!bounds) return null;
  if (value === null || value === undefined || value === '') return bounds.defaultValue;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return bounds.defaultValue;
  const clamped = Math.min(bounds.max, Math.max(bounds.min, parsed));
  return Number(clamped.toFixed(bounds.decimals));
}

/**
 * Stored map → the shape the rules run on. Read field by field and re-stamped
 * at the current version deliberately: a version mismatch that disabled the
 * trader's own rules is a worse failure than reading an older shape leniently,
 * and nothing here gates an entitlement.
 *
 * `enabled` is strict `=== true` — a truthy string from a hand-edited doc must
 * not arm a rule. Called with nothing, it returns a mutable copy of the defaults.
 */
export function normalizeDisciplineRules(settings) {
  const normalized = { version: DISCIPLINE_RULES_VERSION };
  for (const ruleId of RULE_IDS) {
    const stored = settings?.[ruleId];
    normalized[ruleId] = {
      enabled: stored?.enabled === true,
      value: clampRuleValue(ruleId, stored?.value),
    };
  }
  return normalized;
}

/* ──────────────────────────────── trade keys ──────────────────────────────── */

/**
 * The trader's calendar day, from the stored `date` string.
 *
 * Calendar consistency over astronomy: `date` is the day the trader assigned to
 * the trade in their own wall clock, and the same string the History and
 * Calendar views group by. Re-deriving a day from the entry instant in UTC
 * would move trades between days for everyone not on UTC, so a limit of three
 * would break against a day boundary the trader never sees.
 *
 * Falls back to the UTC calendar date of the entry (then close) instant only
 * when `date` is absent, and to null when the trade is undatable — the
 * per-day rule then skips it rather than pooling every dateless trade together.
 */
export function tradeDayKey(trade) {
  const stored = typeof trade?.date === 'string' ? trade.date.trim() : '';
  if (stored) return stored;
  const ms = entryMoment(trade) ?? closeMoment(trade);
  return ms === null ? null : new Date(ms).toISOString().slice(0, 10);
}

/**
 * What counts as one trade for the per-day limit: `positionId ?? id`.
 *
 * Partial fills and scale-outs write one doc per fill (`broker_*` per deal,
 * `pos_*` per position) all sharing a `positionId`. Counting docs would tell a
 * trader who scaled out of two positions in three clips that they took five
 * trades. Null when the doc carries neither key.
 */
export function positionKey(trade) {
  return trimmedOrNull(trade?.positionId) ?? trimmedOrNull(trade?.id);
}

/* ─────────────────────────────── preparation ─────────────────────────────── */

function dayKeyMidnightMs(dayKey) {
  if (!dayKey || !ISO_DAY.test(dayKey)) return null;
  const ms = Date.parse(`${dayKey}T00:00:00Z`);
  return Number.isFinite(ms) ? ms : null;
}

/** The single ordering instant for this module — the determinism contract's sort key. */
function tradeMoment(trade, dayKey) {
  return entryMoment(trade) ?? closeMoment(trade) ?? dayKeyMidnightMs(dayKey);
}

/**
 * The trade's entry and close instants, but only when something better than log
 * time answers for them. Null on either side means "log time only" for that role.
 *
 * For a manually logged trade `entryTimestampUtc`, the entry `timestamp`
 * fallback and the close `timestamp` fallback are all the same instant: when
 * the row was typed. A trader logging their day in one sitting would then have
 * every trade after a losing one land inside any cooldown, flagging revenge on
 * typing cadence rather than trading cadence.
 *
 * The two roles are kept separate on purpose. A single "is this trade log-time
 * only" flag ANDs them, so one precise field clears the trade for BOTH roles —
 * and a doc with a real `closeTime` but a log-time entry (what a webhook write
 * or a close-time field on the manual form produces) gets flagged on the instant
 * its row was written. Triggering a cooldown needs a precise CLOSE; receiving a
 * flag needs a precise ENTRY; neither substitutes for the other.
 *
 * The narrowed views are not a second coercion ladder: they ask the exported
 * ladders "did any tier above `timestamp` resolve?" so tradeAnalytics.js stays
 * the only place that knows how a stored instant is shaped (R1).
 */
function preciseMoments(trade) {
  if (trade?.sessionSource === 'manual-logtime') return { entry: null, close: null };
  return {
    entry: entryMoment({ entryTimestampUtc: trade?.entryTimestampUtc, openTime: trade?.openTime }),
    close: closeMoment({ closeTime: trade?.closeTime }),
  };
}

function compareRows(a, b) {
  if (a.moment !== b.moment) {
    if (a.moment === null) return 1;
    if (b.moment === null) return -1;
    return a.moment - b.moment;
  }
  const idA = a.tradeId ?? '';
  const idB = b.tradeId ?? '';
  if (idA < idB) return -1;
  if (idA > idB) return 1;
  return 0;
}

/**
 * An id-less trade is still evaluated: the §4.4 pre-submit check runs the rules
 * over a synthetic draft that has no doc id yet, and silently dropping it would
 * make the warn toast never fire. Its violations carry `tradeId: null`, and its
 * grouping key is its row position, space-prefixed so it can never collide with
 * a real key (those are trimmed, so none starts with a space). Never exposed.
 */
function prepareRows(trades) {
  const rows = (Array.isArray(trades) ? trades : []).map((trade, index) => {
    const dayKey = tradeDayKey(trade);
    const precise = preciseMoments(trade);
    return {
      trade,
      tradeId: trimmedOrNull(trade?.id),
      dayKey,
      position: positionKey(trade) ?? ` row:${index}`,
      moment: tradeMoment(trade, dayKey),
      preciseEntryMs: precise.entry,
      preciseCloseMs: precise.close,
    };
  });
  rows.sort(compareRows);
  return rows;
}

const violation = (row, ruleId, message) => ({
  tradeId: row.tradeId,
  ruleId,
  message,
  severity: VIOLATION_SEVERITY,
});

/* ───────────────────────────────── the rules ──────────────────────────────── */

/**
 * Every trade past the limit is flagged, and every doc of an over-limit
 * position is flagged with that position's ordinal — a scale-out of the fourth
 * trade of the day is still the fourth trade of the day, on every row it wrote.
 * Open positions count: taking a fourth trade breaks the limit whether or not
 * it has closed yet.
 */
function applyMaxTradesPerDay(rows, limit, perRow) {
  const ordinalsByDay = new Map();
  rows.forEach((row, index) => {
    if (!row.dayKey) return;
    let day = ordinalsByDay.get(row.dayKey);
    if (!day) {
      day = new Map();
      ordinalsByDay.set(row.dayKey, day);
    }
    let ordinal = day.get(row.position);
    if (ordinal === undefined) {
      ordinal = day.size + 1;
      day.set(row.position, ordinal);
    }
    if (ordinal <= limit) return;
    perRow[index].push(violation(row, 'maxTradesPerDay', `${ordinalLabel(ordinal)} trade of ${limit} allowed`));
  });
}

/**
 * Fails open at both ends: no balance (wallet unset, balance permission off) and
 * no resolvable risk (no stop loss — every broker-synced trade today) produce no
 * violation at all. A discipline flag the trader cannot act on is worse than a
 * missing one, and a guessed denominator would flag their whole history.
 */
function applyMaxRiskPercent(rows, limit, context, perRow) {
  const balance = positiveOrNull(context?.accountBalance);
  if (balance === null) return;
  rows.forEach((row, index) => {
    const risk = resolveTradeRiskUsd(row.trade);
    if (risk === null) return;
    const percent = (risk / balance) * 100;
    if (percent <= limit + RISK_EPSILON) return;
    perRow[index].push(violation(
      row,
      'maxRiskPercent',
      `Risked ${formatNumber(percent, 2)}% of balance, ${formatNumber(limit, 2)}% allowed`,
    ));
  });
}

/** Index of the last close at or before `ms`, or -1. */
function lastIndexAtOrBefore(closes, ms) {
  let low = 0;
  let high = closes.length - 1;
  let found = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (closes[mid].ms <= ms) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}

/**
 * An entry inside the cooldown after a realized loss.
 *
 * Each role is gated on its own precise instant (see preciseMoments) — one
 * skipped rule beats a page of false accusations. A log-time close cannot open a
 * cooldown and a log-time entry cannot fall inside one, independently, so a doc
 * that is precise on one side and log-time on the other is only used for the
 * side it can answer for.
 *
 * The trigger must be realized, so an open position (ineligible) never starts a
 * cooldown; its floating P&L is not a loss yet. A position never triggers
 * against itself either: scaling out of a loser at 10:00 and having the same
 * position's earlier fill flagged would report the trader for the trade they
 * were already in.
 */
function applyRevengeWindow(rows, minutes, perRow) {
  const windowMs = minutes * MINUTE_MS;
  const closes = [];
  for (const row of rows) {
    if (row.preciseCloseMs === null || !isTradeAnalyticsEligible(row.trade)) continue;
    if (getTradeOutcome(row.trade) !== 'LOSS') continue;
    closes.push({ ms: row.preciseCloseMs, position: row.position });
  }
  if (!closes.length) return;
  closes.sort((a, b) => a.ms - b.ms);
  rows.forEach((row, index) => {
    const entered = row.preciseEntryMs;
    if (entered === null) return;
    let at = lastIndexAtOrBefore(closes, entered);
    while (at >= 0 && closes[at].position === row.position) at -= 1;
    if (at < 0) return;
    const gap = entered - closes[at].ms;
    if (gap > windowMs) return;
    perRow[index].push(violation(
      row,
      'revengeWindow',
      `Entered ${elapsedLabel(gap)} after a loss, inside your ${minutes} minute cooldown`,
    ));
  });
}

/* ──────────────────────────────── public API ─────────────────────────────── */

/**
 * `trades` → violations, in trade order then rule order. Disabled rules produce
 * nothing, so the common all-disabled case walks the list once and returns [].
 *
 * `context.accountBalance` is the only ambient input and it arrives as a param;
 * there is no `now` because no rule here compares a trade against the present.
 *
 * Judges exactly the trades it is handed — completeness is the caller's call.
 * A day split across a pagination boundary is indeterminate and must not be
 * passed in expecting a chip (§3.6).
 */
export function evaluateRules(trades, settings, context) {
  const rules = normalizeDisciplineRules(settings);
  const enabled = RULE_IDS.filter((ruleId) => rules[ruleId].enabled);
  if (!enabled.length) return [];
  const rows = prepareRows(trades);
  if (!rows.length) return [];
  const perRow = rows.map(() => []);
  // In RULE_IDS order, so each row's violations come out in that order too.
  if (rules.maxTradesPerDay.enabled) applyMaxTradesPerDay(rows, rules.maxTradesPerDay.value, perRow);
  if (rules.maxRiskPercent.enabled) applyMaxRiskPercent(rows, rules.maxRiskPercent.value, context, perRow);
  if (rules.revengeWindow.enabled) applyRevengeWindow(rows, rules.revengeWindow.value, perRow);
  return perRow.flat();
}

/**
 * Violations grouped for row rendering. A Map, not an object: trade ids are
 * document ids and `__proto__` as an object key is a footgun no History row
 * should be able to reach. Insertion order is preserved, so a row's chips read
 * in rule order. Violations with no `tradeId` (the pre-submit draft) are
 * excluded — they have nothing to key on.
 */
export function violationsByTradeId(violations) {
  const grouped = new Map();
  for (const entry of Array.isArray(violations) ? violations : []) {
    const tradeId = trimmedOrNull(entry?.tradeId);
    if (!tradeId) continue;
    const existing = grouped.get(tradeId);
    if (existing) existing.push(entry);
    else grouped.set(tradeId, [entry]);
  }
  return grouped;
}

/**
 * Net P&L of the distinct trades flagged inside the window — signed, so a
 * flagged winner offsets a flagged loser and the figure stays an honest "what
 * my rule breaks did to the account", not a rhetorical one. A trade flagged by
 * two rules is counted once.
 *
 * `now` is a param (goldContract discipline). There is no upper bound on the
 * window: `now` is a render-time snapshot that goes stale as the subscription
 * pushes fresher trades in, and an upper bound would drop exactly those.
 *
 * Ineligible trades — broker positions still open — are skipped: floating P&L
 * is not a realized cost and would repaint the card on every tick.
 */
export function costOfBrokenRules(violations, trades, options) {
  const now = Number(options?.now);
  const windowMs = Number(options?.windowMs);
  if (!Number.isFinite(now) || !Number.isFinite(windowMs) || windowMs <= 0) return 0;
  const flagged = new Set();
  for (const entry of Array.isArray(violations) ? violations : []) {
    const tradeId = trimmedOrNull(entry?.tradeId);
    if (tradeId) flagged.add(tradeId);
  }
  if (!flagged.size) return 0;
  const since = now - windowMs;
  const counted = new Set();
  let total = 0;
  for (const trade of Array.isArray(trades) ? trades : []) {
    const tradeId = trimmedOrNull(trade?.id);
    if (!tradeId || !flagged.has(tradeId) || counted.has(tradeId)) continue;
    counted.add(tradeId);
    if (!isTradeAnalyticsEligible(trade)) continue;
    const moment = tradeMoment(trade, tradeDayKey(trade));
    if (moment === null || moment <= since) continue;
    total += tradePnlValue(trade);
  }
  return total;
}

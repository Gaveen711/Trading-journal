import {
  collection, doc, getDocs, increment, limit, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp, startAfter, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { TradeRepository } from '../../core/domain/repositories/TradeRepository.js';
import {
  analyticsUpdate, entryMoment, getTradeSessionCode, sessionAnalyticsDelta,
  sessionAnalyticsUpdate, subtractSessionAnalytics, subtractTradeAnalytics, tradeAnalyticsDelta,
} from '../../lib/tradeAnalytics.js';
import { SESSION_CODES, SESSION_ENGINE_VERSION, resolveSessionAt } from '../../lib/sessionEngine.js';

const DEFAULT_PAGE_SIZE = 100;

/** An edit to any of these can move a trade between session buckets (§2.2). */
const SESSION_EDIT_FIELDS = Object.freeze(['date', 'timestamp', 'session']);

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether an edited `date` day string contradicts an instant. Anything that is
 * not a day string contradicts nothing — there is no comparison to make.
 */
function dateContradicts(date, ms) {
  const day = typeof date === 'string' ? date.trim() : '';
  if (!ISO_DAY.test(day)) return false;
  return day !== new Date(ms).toISOString().slice(0, 10);
}

/**
 * The entry tiers in precedence order, mirroring the private ENTRY_FIELDS of
 * tradeAnalytics.js: two precise instants, then log time. Restated here only
 * because entryMoment answers *what* the instant is and not which field said
 * so, and the answering field is what decides the `sessionSource` label.
 */
const ENTRY_TIERS = Object.freeze(['entryTimestampUtc', 'openTime', 'timestamp']);

/**
 * The instant an edited trade resolves from, and the field that answered — read
 * one field at a time through the same sanctioned coercion ladder, so a stored
 * value that cannot be coerced falls through instead of being trusted.
 */
function entryInstant(trade) {
  for (const field of ENTRY_TIERS) {
    const ms = entryMoment({ [field]: trade[field] });
    if (ms !== null) return { ms, field };
  }
  return null;
}

/**
 * Re-resolves the session tag of an edited trade (§2.2), or null when the edit
 * cannot have moved it.
 *
 * A day string carries no instant, so an edited `date` that no longer matches
 * the stored instant retires that instant — `entryTimestampUtc` goes null and
 * the tag falls back to the user's own `session` pick with `sessionSource:
 * 'user'` (§2.1). A code is never "recomputed" from a bare date.
 *
 * Every branch returns an explicit value for every field: Firestore rejects
 * `undefined`, and `sessionCode` must be one of the six enum members or null —
 * 'Unknown' is an analytics bucket, and firestore.rules would reject it, which
 * fails the whole transaction rather than just this field.
 */
function resolveEditedSession(previous, patch) {
  if (!SESSION_EDIT_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(patch, field))) return null;
  const merged = { ...previous, ...patch };
  const instant = entryInstant(merged);
  const resolved = instant !== null && !dateContradicts(merged.date, instant.ms)
    ? resolveSessionAt(instant.ms)
    : null;
  const stamp = { sessionEngineVersion: SESSION_ENGINE_VERSION, sessionResolvedAt: serverTimestamp() };

  if (resolved) {
    return {
      ...stamp,
      // Left verbatim when the stored field is what answered; otherwise
      // backfilled on a legacy document from the tier that did — which for log
      // time is exactly LogTrade's own derivation.
      entryTimestampUtc: instant.field === 'entryTimestampUtc'
        ? merged.entryTimestampUtc
        : new Date(instant.ms).toISOString(),
      sessionCode: resolved.code,
      // A precise instant keeps its provenance (null when a legacy document
      // never recorded one); log time is by definition the manual tier.
      sessionSource: instant.field === 'timestamp' ? 'manual-logtime' : (merged.sessionSource ?? null),
    };
  }

  // getTradeSessionCode owns the legacy `session` vocabulary map, so it is
  // asked here rather than duplicated — with the instants withheld so it takes
  // the user-pick branch, and its 'Unknown' answer folded back to null.
  const userCode = getTradeSessionCode({ session: merged.session });
  return {
    ...stamp,
    entryTimestampUtc: null,
    sessionCode: SESSION_CODES.includes(userCode) ? userCode : null,
    sessionSource: 'user',
  };
}

export class FirebaseTradeRepository extends TradeRepository {
  subscribeToTrades(userId, onUpdate, onError, pageSize = DEFAULT_PAGE_SIZE) {
    const tradesQuery = query(collection(db, 'users', userId, 'trades'), orderBy('date', 'desc'), limit(pageSize));
    return onSnapshot(tradesQuery, (snapshot) => {
      const loaded = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const triggerSync = snapshot.docChanges().some((change) => (
        change.type === 'added' && change.doc.data().source === 'MT5_AUTO'
      ));
      onUpdate(loaded, triggerSync, {
        cursor: snapshot.docs.at(-1) || null,
        hasMore: snapshot.size === pageSize,
      });
    }, onError);
  }

  async getTradesPage(userId, cursor, pageSize = DEFAULT_PAGE_SIZE) {
    const constraints = [orderBy('date', 'desc')];
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(pageSize));
    const snapshot = await getDocs(query(collection(db, 'users', userId, 'trades'), ...constraints));
    return {
      trades: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
      cursor: snapshot.docs.at(-1) || null,
      hasMore: snapshot.size === pageSize,
    };
  }

  /**
   * Live window over a single date range, for views that render one period
   * rather than the whole history. The range field is the sort field, so this
   * needs no composite index.
   */
  subscribeToTradesInRange(userId, startDate, endDate, onUpdate, onError) {
    const rangeQuery = query(
      collection(db, 'users', userId, 'trades'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
    );
    return onSnapshot(rangeQuery, (snapshot) => {
      onUpdate(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, onError);
  }

  async addTrade(userId, tradeData) {
    const batch = writeBatch(db);
    const tradeRef = doc(collection(db, 'users', userId, 'trades'));
    const delta = tradeAnalyticsDelta(tradeData);
    // The use case arrives with entryTimestampUtc/sessionCode/sessionSource/
    // sessionEngineVersion and setupId already resolved; they ride through the
    // spread. sessionResolvedAt is the one session field it cannot supply —
    // serverTimestamp() is a Firestore sentinel and the use case is storage-
    // agnostic — so the audit stamp is applied here.
    batch.set(tradeRef, { ...tradeData, id: tradeRef.id, sessionResolvedAt: serverTimestamp() });
    batch.update(doc(db, 'users', userId), {
      // firestore.rules' 5-second cooldown requires lastTradeTime in the
      // same batch as the trade write.
      lastTradeTime: serverTimestamp(),
      ...analyticsUpdate(delta, increment),
      // Same user-doc write as the v2 analytics increments: one aggregate can
      // never land without the other.
      ...sessionAnalyticsUpdate(sessionAnalyticsDelta(tradeData), increment),
    });
    await batch.commit();
    return tradeRef;
  }

  async removeTrade(userId, tradeId) {
    await runTransaction(db, async (transaction) => {
      const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
      const snapshot = await transaction.get(tradeRef);
      if (!snapshot.exists()) return;
      const trade = snapshot.data();
      const delta = tradeAnalyticsDelta(trade, -1);
      transaction.delete(tradeRef);
      transaction.update(doc(db, 'users', userId), {
        ...analyticsUpdate(delta, increment),
        // Without this every History-row deletion drifts sessionAnalytics
        // permanently and invisibly: the stored version still matches, so the
        // lazy rebuild gate never fires to repair it.
        ...sessionAnalyticsUpdate(sessionAnalyticsDelta(trade, -1), increment),
      });
    });
  }

  /**
   * Returns the patch that was actually written, minus the `sessionResolvedAt`
   * sentinel — which is a Firestore FieldValue, not a value any reader can use.
   *
   * The caller needs it: this method re-derives the session tag inside the
   * transaction, so the applied patch is WIDER than the form's payload. A local
   * cache that merges only what the form sent keeps a stale `sessionCode`, and
   * getTradeSessionCode trusts a version-matched stored code over the instant —
   * so an edited trade would keep reporting under its pre-edit session bucket.
   */
  async editTrade(userId, tradeId, updatedData) {
    const { id: _drop, ...safeData } = updatedData;
    let applied = safeData;
    await runTransaction(db, async (transaction) => {
      const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
      const snapshot = await transaction.get(tradeRef);
      if (!snapshot.exists()) throw new Error('Trade not found');
      const previous = snapshot.data();
      const patch = { ...safeData, ...resolveEditedSession(previous, safeData) };
      const { sessionResolvedAt: _sentinel, ...localPatch } = patch;
      applied = localPatch;
      const nextTrade = { ...previous, ...patch };
      transaction.update(tradeRef, patch);
      const delta = subtractTradeAnalytics(previous, nextTrade);
      transaction.update(doc(db, 'users', userId), {
        ...analyticsUpdate(delta, increment),
        // An edit that moves a trade between sessions writes both buckets; the
        // correction rides the same transaction as the v2 one so a partial
        // failure cannot leave the two aggregates disagreeing.
        ...sessionAnalyticsUpdate(subtractSessionAnalytics(previous, nextTrade), increment),
      });
    });
    return applied;
  }

  async resetTrades(userId, idToken) {
    const response = await fetch('/api/reset-trades', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + idToken },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to reset trades via API');
    }
  }
}
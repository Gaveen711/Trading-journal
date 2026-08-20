// The stored `disciplineRules` map on users/{uid} — read live, saved merged.
//
// The read reuses the injected subscription repository's user-doc listener
// rather than opening a second one: the Firestore SDK dedupes identical listen
// targets, so this shares the stream useSubscription is already on and costs no
// extra reads. Publishing the map from useSubscription itself would be one
// fewer moving part, but that hook belongs to another slice and its return
// shape does not carry `disciplineRules` today; when it does, this hook can
// drop its own subscription without any consumer noticing.
//
// The save goes to Firestore directly for the same reason useSetups does: no
// repository method exposes a generic user-doc merge, and adding one is a
// repository-layer change outside this slice.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useAppServices } from '../app/di/AppServicesContext.jsx';
import { db } from '../firebase.js';
import { RULE_IDS, normalizeDisciplineRules } from '../lib/disciplineRules.js';

/**
 * Rule-by-rule equality. Snapshot identity is not usable as a change signal —
 * the user doc changes on every logged trade (lastTradeTime, analytics), and a
 * fresh rules object on each of those would re-run every violation memo
 * downstream for a map that did not change.
 */
function sameRules(a, b) {
  if (a === b) return true;
  if (!a || !b || a.version !== b.version) return false;
  return RULE_IDS.every((ruleId) => (
    a[ruleId]?.enabled === b[ruleId]?.enabled && a[ruleId]?.value === b[ruleId]?.value
  ));
}

/**
 * The user's discipline settings, normalized: always a complete map with every
 * rule present, every rule disabled until the trader turns it on.
 *
 * The pre-load state is the all-disabled default, so a slow snapshot renders as
 * "no rules" rather than flashing flags the user never armed.
 *
 * `saveRules` merges — it writes the `disciplineRules` field and nothing else,
 * so it cannot disturb the counters and analytics living on the same document —
 * and it normalizes on the way in, which is where §4.4's clamp happens.
 * `normalizeDisciplineRules` fills every key, so no `undefined` reaches
 * Firestore.
 *
 * @param {{uid: string}|null} user
 */
export function useDisciplineSettings(user) {
  const [rules, setRules] = useState(() => normalizeDisciplineRules());
  const [loading, setLoading] = useState(() => Boolean(user));
  const [isSaving, setIsSaving] = useState(false);
  const { subscriptionRepository: repository } = useAppServices();
  const userId = user?.uid || null;

  useEffect(() => {
    if (!userId) {
      setRules(normalizeDisciplineRules());
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    return repository.subscribeToUserDoc(userId, (docSnap) => {
      const next = normalizeDisciplineRules(docSnap.exists() ? docSnap.data()?.disciplineRules : null);
      setRules((current) => (sameRules(current, next) ? current : next));
      setLoading(false);
    }, (error) => {
      // An unreadable settings map leaves every rule disabled, which flags
      // nothing — the advisory feature simply stays quiet.
      console.error('[useDisciplineSettings] snapshot error:', error);
      setLoading(false);
    });
  }, [repository, userId]);

  const saveRules = useCallback(async (nextRules) => {
    if (!userId) throw new Error('You must be signed in to save rules.');
    const normalized = normalizeDisciplineRules(nextRules);
    setIsSaving(true);
    try {
      // merge, not update: a user doc that has not been created yet (the
      // /api/init-user race) would fail an update outright.
      await setDoc(doc(db, 'users', userId), { disciplineRules: normalized }, { merge: true });
      return normalized;
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  /** In RULE_IDS order — the same order the settings card and the chips render in. */
  const enabledRuleIds = useMemo(() => RULE_IDS.filter((ruleId) => rules[ruleId]?.enabled), [rules]);

  return { rules, enabledRuleIds, saveRules, isSaving, loading };
}

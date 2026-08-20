// The setup catalog: the trader's own taxonomy, owned entirely by the client.
//
// Firestore is reached directly here rather than through a repository in
// src/data/repositories. The repository layer is outside this slice's scope,
// so a FirebaseSetupRepository + a createAppServices entry is the natural
// follow-up; nothing in this file assumes the direct import beyond the five
// call sites below.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { slugifySetupName } from '../lib/tradeAnalytics.js';

/** firestore.rules bounds `name` at 1–64 characters; reject before the write, not after. */
const MAX_NAME_LENGTH = 64;

/**
 * The eight seeds, as [display name, legacy `strategy` value it must match].
 *
 * The slug — not the name — is what legacy history matches on, so the six
 * migrating seeds slug the STORED value: 'S/R Bounce' is displayed but its slug
 * is slugifySetupName('S/R') = 's-r', because that is the string sitting in
 * pre-release trade docs. Slugging the display name instead would give
 * 's-r-bounce' and silently orphan every S/R trade ever logged.
 *
 * The two net-new seeds have no legacy counterpart and slug their own name; no
 * legacy value slugifies to 'liquidity-sweep' or 'news-fade', so they cannot
 * shadow existing history.
 */
const SEED_DEFINITIONS = Object.freeze([
  ['Breakout', 'Breakout'],
  ['SMC', 'SMC'],
  ['ICT', 'ICT'],
  ['Scalp', 'Scalp'],
  ['Swing', 'Swing'],
  ['S/R Bounce', 'S/R'],
  ['Liquidity sweep', null],
  ['News fade', null],
]);

/**
 * Deterministic seed ids. `default_<slug>` is derived, never hand-written: the
 * slugifier is the only thing that guarantees a Firestore-legal id (the legacy
 * value 'S/R' would otherwise produce `default_s/r`, a two-segment path).
 *
 * Exported because the seed catalog is a contract — the ids appear in trade
 * docs as `setupId` and in tests — not because anything else may write them.
 */
export const SETUP_SEEDS = Object.freeze(SEED_DEFINITIONS.map(([name, legacy], index) => {
  const slug = slugifySetupName(legacy ?? name);
  return Object.freeze({ id: `default_${slug}`, name, slug, sortOrder: index });
}));

const trimmedOrNull = (value) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
};

/**
 * Own properties only. `setupId` is a free-form string on the trade document,
 * so a bare `setupsById['constructor']` would resolve to a function and render
 * as a setup with no name — the same footgun setupDoc() guards in
 * tradeAnalytics.js.
 */
function lookup(setupsById, setupId) {
  const id = trimmedOrNull(setupId);
  if (!id || !Object.prototype.hasOwnProperty.call(setupsById, id)) return null;
  return setupsById[id];
}

/**
 * Catalog order: sortOrder, then name, then id. The last two are not decoration
 * — cross-device creates hand out the same sortOrder to different docs, and a
 * list that reorders itself between renders is a list the user cannot click.
 */
function compareSetups(a, b) {
  const orderA = Number.isFinite(a.sortOrder) ? a.sortOrder : Number.MAX_SAFE_INTEGER;
  const orderB = Number.isFinite(b.sortOrder) ? b.sortOrder : Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  const nameA = a.name || '';
  const nameB = b.name || '';
  if (nameA !== nameB) return nameA < nameB ? -1 : 1;
  return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
}

/** The slug a doc answers to — stored slug first, name only as a fallback, exactly as matchSetupIdBySlug reads it. */
const effectiveSlug = (setup) => slugifySetupName(trimmedOrNull(setup?.slug) || setup?.name);

/**
 * Slug uniqueness is a catalog-wide property that rules cannot express, so it
 * is enforced here. Archived setups are excluded: a slug freed by archiving is
 * reusable, and blocking a name because of a row the user cannot see reads as
 * a bug. Merged setups still hold their slug — that pointer is the only thing
 * routing legacy trades to the merge target.
 */
function findSlugOwner(setups, slug, exceptId) {
  return setups.find((setup) => (
    setup.id !== exceptId && !setup.archived && effectiveSlug(setup) === slug
  )) || null;
}

function nextSortOrder(setups) {
  return setups.reduce(
    (highest, setup) => (Number.isFinite(setup.sortOrder) ? Math.max(highest, setup.sortOrder) : highest),
    SETUP_SEEDS.length - 1,
  ) + 1;
}

function validateName(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) throw new Error('Setup name is required.');
  if (trimmed.length > MAX_NAME_LENGTH) throw new Error(`Setup name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  const slug = slugifySetupName(trimmed);
  // slugifySetupName('///') is '', which firestore.rules rejects and
  // matchSetupIdBySlug can never match — catch it as a name problem here
  // rather than as a PERMISSION_DENIED the user reads as "save failed".
  if (!slug) throw new Error('Setup name needs at least one letter or number.');
  return { name: trimmed, slug };
}

/**
 * The setup catalog for the signed-in user.
 *
 * `setups` is EVERY doc in catalog order, archived and merged ones included —
 * the Manage dialog needs them to offer Restore, and a trade tagged with an
 * archived setup still has to render its name. Pickers want
 * `setups.filter((setup) => !setup.archived && !setup.mergedInto)`.
 *
 * `setupsById` is the plain-object map `getTradeSetupKey(trade, setupsById)`
 * takes; it must stay complete for the same reason.
 *
 * Rename, merge and archive never touch a trade document. A merge writes a
 * `mergedInto` pointer and getTradeSetupKey follows it on read, so history
 * re-buckets with zero writes and un-merging stays possible.
 *
 * @param {{uid: string}|null} user
 */
export function useSetups(user) {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(user));
  const userId = user?.uid || null;
  // Seeding is guarded per uid and the guard is set BEFORE the batch commits:
  // the write loop this prevents is not hypothetical, since the batch's own
  // local snapshot arrives before the server ack.
  const seededForRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setSetups([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const catalog = collection(db, 'users', userId, 'setups');
    return onSnapshot(catalog, (snapshot) => {
      setSetups(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })).sort(compareSetups));
      setLoading(false);

      // Seed only on a SERVER-CONFIRMED empty catalog. A cached empty snapshot
      // says nothing about the server, and seeding on it would overwrite a
      // renamed seed with its factory name the moment the user came back on a
      // cold cache. The cost is that a first run started offline seeds on the
      // next load instead of this one — the safe direction.
      if (!snapshot.empty || snapshot.metadata.fromCache) return;
      if (seededForRef.current === userId) return;
      seededForRef.current = userId;
      seedDefaults(userId).catch((error) => {
        // Deliberately not retried: an empty catalog degrades to legacy
        // `strategy` strings and an empty picker, while a retry loop against a
        // failing write is a billing event.
        console.error('[useSetups] default catalog seed failed:', error);
      });
    }, (error) => {
      console.error('[useSetups] catalog listener error:', error);
      setLoading(false);
    });
  }, [userId]);

  const setupsById = useMemo(() => {
    const map = {};
    setups.forEach((setup) => { map[setup.id] = setup; });
    return map;
  }, [setups]);

  /**
   * Id → doc, following a `mergedInto` pointer exactly one hop, which is the
   * same depth getTradeSetupKey follows. Composes with it:
   * `resolveSetup(getTradeSetupKey(trade, setupsById))`. Null when the id is
   * unknown — an id kept on a trade whose setup was hard-deleted resolves to
   * nothing rather than to a wrong name.
   */
  const resolveSetup = useCallback((setupId) => {
    const found = lookup(setupsById, setupId);
    if (!found) return null;
    return lookup(setupsById, found.mergedInto) || found;
  }, [setupsById]);

  const requireUser = useCallback(() => {
    if (!userId) throw new Error('You must be signed in to change setups.');
    return userId;
  }, [userId]);

  const requireSetup = useCallback((setupId) => {
    const found = lookup(setupsById, setupId);
    if (!found) throw new Error('That setup no longer exists.');
    return found;
  }, [setupsById]);

  const createSetup = useCallback(async (rawName) => {
    const uid = requireUser();
    const { name, slug } = validateName(rawName);
    const owner = findSlugOwner(setups, slug, null);
    if (owner) throw new Error(`"${owner.name}" already uses that name.`);
    const ref = doc(collection(db, 'users', uid, 'setups'));
    await setDoc(ref, {
      id: ref.id,
      name,
      slug,
      isDefault: false,
      archived: false,
      mergedInto: null,
      sortOrder: nextSortOrder(setups),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // The written timestamps are server sentinels, so only the fields the
    // caller can act on come back — enough to select the new setup in the
    // combobox before the snapshot lands.
    return { id: ref.id, name, slug };
  }, [requireUser, setups]);

  /**
   * Renames the display name only. The slug is immutable by design: it is the
   * key legacy trades match on, so renaming 'Breakout' to 'Momentum breakout'
   * must not strand every trade that stored the string 'Breakout'. Uniqueness
   * is still checked against the new name, so two setups cannot present as one.
   */
  const renameSetup = useCallback(async (setupId, rawName) => {
    const uid = requireUser();
    const setup = requireSetup(setupId);
    const { name, slug } = validateName(rawName);
    if (name === setup.name) return;
    const owner = findSlugOwner(setups, slug, setup.id);
    if (owner) throw new Error(`"${owner.name}" already uses that name.`);
    await updateDoc(doc(db, 'users', uid, 'setups', setup.id), { name, updatedAt: serverTimestamp() });
  }, [requireSetup, requireUser, setups]);

  /**
   * Points `sourceId` at `targetId`. No trade document is touched — every
   * reader resolves the pointer through getTradeSetupKey, so the merge is
   * reversible by clearing the field.
   *
   * The source is NOT archived. Archiving it would take it out of
   * matchSetupIdBySlug, and legacy trades that reach it by slug would fall to
   * 'untagged' instead of reporting under the target — the opposite of what
   * merging promises. Pickers already hide it via `mergedInto`.
   *
   * A target that is itself merged is flattened to its own target, so the
   * one-hop resolution in tradeAnalytics.js is always enough.
   */
  const mergeSetups = useCallback(async (sourceId, targetId) => {
    const uid = requireUser();
    const source = requireSetup(sourceId);
    const target = requireSetup(targetId);
    const finalTargetId = trimmedOrNull(target.mergedInto) || target.id;
    if (finalTargetId === source.id) throw new Error('A setup cannot be merged into itself.');
    const finalTarget = lookup(setupsById, finalTargetId);
    if (finalTarget?.archived) throw new Error('Restore that setup before merging into it.');
    await updateDoc(doc(db, 'users', uid, 'setups', source.id), {
      mergedInto: finalTargetId,
      updatedAt: serverTimestamp(),
    });
  }, [requireSetup, requireUser, setupsById]);

  /** Archive, or restore with `archived: false`. Trades keep their `setupId` either way. */
  const archiveSetup = useCallback(async (setupId, archived = true) => {
    const uid = requireUser();
    const setup = requireSetup(setupId);
    await updateDoc(doc(db, 'users', uid, 'setups', setup.id), {
      archived: Boolean(archived),
      updatedAt: serverTimestamp(),
    });
  }, [requireSetup, requireUser]);

  /**
   * Hard delete, for custom setups only — a deleted seed would re-seed as a
   * factory-named duplicate on the next empty catalog, and legacy trades that
   * matched it by slug would go untagged.
   *
   * The zero-reference check stays with the caller: it needs the fully
   * hydrated trade list (§4.3), which this hook does not have.
   */
  const deleteSetup = useCallback(async (setupId) => {
    const uid = requireUser();
    const setup = requireSetup(setupId);
    if (setup.isDefault) throw new Error('Default setups can be archived, not deleted.');
    await deleteDoc(doc(db, 'users', uid, 'setups', setup.id));
  }, [requireSetup, requireUser]);

  return {
    setups,
    setupsById,
    resolveSetup,
    createSetup,
    renameSetup,
    mergeSetups,
    archiveSetup,
    deleteSetup,
    loading,
  };
}

/**
 * One batch, deterministic ids, every field the rules allowlist names and
 * nothing else. Idempotent by construction: the ids are fixed, so a double
 * commit writes the same eight documents rather than sixteen.
 */
async function seedDefaults(userId) {
  const batch = writeBatch(db);
  SETUP_SEEDS.forEach((seed) => {
    batch.set(doc(db, 'users', userId, 'setups', seed.id), {
      id: seed.id,
      name: seed.name,
      slug: seed.slug,
      isDefault: true,
      archived: false,
      mergedInto: null,
      sortOrder: seed.sortOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

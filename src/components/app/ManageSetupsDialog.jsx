import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppDialog } from './AppDialog';
import { DataTable } from './DataTable';
import { EmptyState } from './EmptyState';
import { SectionCard } from './SectionCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '../ToastContext';
import { getTradeSetupKey, slugifySetupName } from '../../lib/tradeAnalytics.js';

const EMPTY_LIST = Object.freeze([]);
const EMPTY_MAP = Object.freeze({});

/** firestore.rules bounds `name` at 1–64 characters; reject before the write, not after. */
const MAX_NAME_LENGTH = 64;

const trimmed = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * The slug a doc answers to — stored slug first, name only as a fallback.
 * Identical to the recipe in useSetups and matchSetupIdBySlug on purpose: a
 * second slugging rule is how a rename that should have been rejected slips
 * through and two setups start presenting as one.
 */
const effectiveSlug = (setup) => slugifySetupName(trimmed(setup?.slug) || setup?.name);

/**
 * Slug uniqueness is a catalog-wide property Firestore rules cannot express,
 * so it is checked here BEFORE the write — the same predicate useSetups applies
 * server-side. Archived docs are excluded: a slug freed by archiving is
 * reusable, and blocking a name because of a row the user cannot see reads as
 * a bug.
 */
function findSlugOwner(setups, slug, exceptId) {
  return setups.find((setup) => (
    setup.id !== exceptId && !setup.archived && effectiveSlug(setup) === slug
  )) || null;
}

/**
 * Mirrors `legacySetupName` in tradeAnalytics.js: the FIRST tag that slugifies
 * is the one a pre-catalog trade buckets under, so it is the only one that
 * counts as a reference. Widening this to every tag would over-block deletes;
 * narrowing it would under-block them, which is the direction that loses data.
 */
function legacyTag(trade) {
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
 * ManageSetupsDialog — the deferred catalog editor (§4.3).
 *
 * Two numbers live in this dialog and they are deliberately NOT the same one:
 *
 *  - the displayed trade count is a BUCKET count, `getTradeSetupKey`, which
 *    follows a `mergedInto` pointer — a merged source reports 0 because its
 *    trades now report under the target, which is exactly what merging means;
 *  - the hard-delete gate is a RAW reference count, which does not follow the
 *    pointer, because a trade still storing `setupId: <source>` is stranded the
 *    moment that document is deleted. Gating on the bucket count would let a
 *    merged setup with live references be deleted and silently un-name every
 *    trade pointing at it.
 *
 * Both run over the FULL trade history, never the 100-doc paged window: opening
 * the dialog fires `onHydrate` (the `loadAllTrades` path) and until
 * `tradesHydrated` is true the counts render a loading state and every Delete
 * stays disabled.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {object[]} [props.setups]              FULL catalog — archived and merged docs included.
 * @param {Record<string, object>} [props.setupsById]
 * @param {object[]} [props.trades]              Live trade list from the outlet context.
 * @param {boolean} [props.tradesHydrated=false] True once the complete history is in `trades`.
 * @param {() => Promise<any>} [props.onHydrate] The existing `loadAllTrades` path; called on open.
 * @param {(setupId: string, name: string) => Promise<void>} [props.renameSetup]
 * @param {(sourceId: string, targetId: string) => Promise<void>} [props.mergeSetups]
 * @param {(setupId: string, archived: boolean) => Promise<void>} [props.archiveSetup]
 * @param {(setupId: string) => Promise<void>} [props.deleteSetup]
 */
export function ManageSetupsDialog({
  open,
  onOpenChange,
  setups = EMPTY_LIST,
  setupsById = EMPTY_MAP,
  trades = EMPTY_LIST,
  tradesHydrated = false,
  onHydrate,
  renameSetup,
  mergeSetups,
  archiveSetup,
  deleteSetup,
}) {
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [mergeSourceId, setMergeSourceId] = useState(null);
  const [mergeTargetId, setMergeTargetId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [hydrationFailed, setHydrationFailed] = useState(false);
  // One hydration attempt per opening. A retry loop against a failing read is a
  // billing event, and the user can close and reopen to try again.
  const hydrateAttemptedRef = useRef(false);

  const fail = useCallback((message) => {
    toast?.(message, 'error');
  }, [toast]);

  useEffect(() => {
    if (!open) {
      hydrateAttemptedRef.current = false;
      setEditingId(null);
      setDraftName('');
      setMergeSourceId(null);
      setMergeTargetId(null);
      setDeleteTargetId(null);
      setBusyId(null);
      setHydrationFailed(false);
      return;
    }
    if (tradesHydrated || hydrateAttemptedRef.current || typeof onHydrate !== 'function') return;
    hydrateAttemptedRef.current = true;
    setHydrationFailed(false);
    const onFailure = (error) => {
      console.error('[ManageSetupsDialog] full trade hydration failed:', error);
      setHydrationFailed(true);
      fail('Could not load your complete trade history. Counts may be incomplete.');
    };
    // Called synchronously with the open, not deferred to a microtask: the
    // request must be in flight before the first paint of the loading state.
    try {
      Promise.resolve(onHydrate()).catch(onFailure);
    } catch (error) {
      onFailure(error);
    }
  }, [open, tradesHydrated, onHydrate, fail]);

  /** Bucket counts — what each setup REPORTS, merge pointers followed. */
  const bucketCounts = useMemo(() => {
    const counts = new Map();
    if (!open) return counts;
    (trades || []).forEach((trade) => {
      const key = getTradeSetupKey(trade, setupsById);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [open, trades, setupsById]);

  /**
   * Raw references — what each setup document still OWNS. Two passes over the
   * trades, not one per setup: stored ids keyed by id, legacy tags keyed by
   * slug (a legacy trade only reaches a non-archived doc, exactly as
   * matchSetupIdBySlug resolves it).
   */
  const rawReferences = useMemo(() => {
    const byId = new Map();
    const bySlug = new Map();
    if (!open) return { byId, bySlug };
    (trades || []).forEach((trade) => {
      if (!trade) return;
      const stored = trimmed(trade.setupId);
      if (stored) {
        byId.set(stored, (byId.get(stored) || 0) + 1);
        return;
      }
      const legacy = legacyTag(trade);
      const slug = legacy ? slugifySetupName(legacy) : '';
      if (slug) bySlug.set(slug, (bySlug.get(slug) || 0) + 1);
    });
    return { byId, bySlug };
  }, [open, trades]);

  const referenceCount = useCallback((setup) => {
    const stored = rawReferences.byId.get(setup.id) || 0;
    if (setup.archived) return stored;
    const slug = effectiveSlug(setup);
    return stored + (slug ? rawReferences.bySlug.get(slug) || 0 : 0);
  }, [rawReferences]);

  const mergeSourcePointingAt = useCallback((setupId) => (
    setups.find((setup) => setup.id !== setupId && trimmed(setup.mergedInto) === setupId) || null
  ), [setups]);

  /** Null when Delete is allowed; otherwise the sentence explaining why it is not. */
  const deleteBlockedReason = useCallback((setup) => {
    if (setup.isDefault) return 'Default setups can be archived, not deleted.';
    if (!tradesHydrated) {
      return hydrationFailed
        ? 'Your complete trade history could not be loaded.'
        : 'Loading your complete trade history…';
    }
    const pointer = mergeSourcePointingAt(setup.id);
    if (pointer) return `"${pointer.name}" is merged into this setup.`;
    const count = referenceCount(setup);
    if (count > 0) {
      return `${count} ${count === 1 ? 'trade' : 'trades'} still ${count === 1 ? 'uses' : 'use'} this setup.`;
    }
    return null;
  }, [tradesHydrated, hydrationFailed, mergeSourcePointingAt, referenceCount]);

  const activeSetups = useMemo(() => setups.filter((setup) => !setup.archived), [setups]);
  const archivedSetups = useMemo(() => setups.filter((setup) => setup.archived), [setups]);
  const mergeSource = useMemo(
    () => setups.find((setup) => setup.id === mergeSourceId) || null,
    [setups, mergeSourceId],
  );
  const deleteTarget = useMemo(
    () => setups.find((setup) => setup.id === deleteTargetId) || null,
    [setups, deleteTargetId],
  );
  const mergeTargets = useMemo(() => {
    if (!mergeSource) return EMPTY_LIST;
    return setups.filter((setup) => (
      setup.id !== mergeSource.id && !setup.archived && !trimmed(setup.mergedInto)
    ));
  }, [setups, mergeSource]);
  const mergeTargetItems = useMemo(
    () => mergeTargets.map((setup) => ({ value: setup.id, label: setup.name })),
    [mergeTargets],
  );
  const mergeTargetName = useMemo(
    () => mergeTargets.find((setup) => setup.id === mergeTargetId)?.name || null,
    [mergeTargets, mergeTargetId],
  );

  const startRename = (setup) => {
    setEditingId(setup.id);
    setDraftName(setup.name || '');
  };

  const cancelRename = () => {
    setEditingId(null);
    setDraftName('');
  };

  const commitRename = async (setup) => {
    const name = draftName.trim();
    if (!name) return fail('Setup name is required.');
    if (name.length > MAX_NAME_LENGTH) {
      return fail(`Setup name must be ${MAX_NAME_LENGTH} characters or fewer.`);
    }
    const slug = slugifySetupName(name);
    // slugifySetupName('///') is '' — a name the rules reject and no legacy
    // trade can ever match. Caught here as a name problem rather than as a
    // PERMISSION_DENIED the user reads as "save failed".
    if (!slug) return fail('Setup name needs at least one letter or number.');
    if (name === setup.name) return cancelRename();
    const owner = findSlugOwner(setups, slug, setup.id);
    if (owner) return fail(`"${owner.name}" already uses that name.`);

    setBusyId(setup.id);
    try {
      await renameSetup?.(setup.id, name);
      cancelRename();
    } catch (error) {
      fail(error?.message || 'Could not rename that setup.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmMerge = async () => {
    if (!mergeSource || !mergeTargetId) return;
    setBusyId(mergeSource.id);
    try {
      await mergeSetups?.(mergeSource.id, mergeTargetId);
      setMergeSourceId(null);
      setMergeTargetId(null);
    } catch (error) {
      fail(error?.message || 'Could not merge those setups.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleArchive = async (setup, archived) => {
    setBusyId(setup.id);
    try {
      await archiveSetup?.(setup.id, archived);
    } catch (error) {
      fail(error?.message || 'Could not update that setup.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    // Re-checked at the moment of the write: the dialog stays open across
    // catalog and trade snapshots, so the gate that was true when the
    // AlertDialog opened is not necessarily true now.
    const blocked = deleteBlockedReason(deleteTarget);
    if (blocked) {
      setDeleteTargetId(null);
      return fail(blocked);
    }
    setBusyId(deleteTarget.id);
    try {
      await deleteSetup?.(deleteTarget.id);
      setDeleteTargetId(null);
    } catch (error) {
      fail(error?.message || 'Could not delete that setup.');
    } finally {
      setBusyId(null);
    }
  };

  const nameCell = (setup) => {
    if (editingId === setup.id) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={draftName}
            autoFocus
            aria-label={`Rename ${setup.name}`}
            className="h-7 max-w-44"
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void commitRename(setup);
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                cancelRename();
              }
            }}
          />
          <Button
            size="xs"
            variant="secondary"
            disabled={busyId === setup.id}
            onClick={() => void commitRename(setup)}
          >
            Save
          </Button>
          <Button size="xs" variant="ghost" onClick={cancelRename}>
            Cancel
          </Button>
        </div>
      );
    }
    const target = trimmed(setup.mergedInto)
      ? setups.find((item) => item.id === trimmed(setup.mergedInto))
      : null;
    return (
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-foreground">{setup.name}</span>
        {target && (
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            merged into {target.name}
          </span>
        )}
      </span>
    );
  };

  const countCell = (setup) => {
    if (!tradesHydrated) {
      return hydrationFailed
        ? <span className="text-muted-foreground">—</span>
        : <Skeleton aria-hidden="true" className="ml-auto h-3 w-8" />;
    }
    return bucketCounts.get(setup.id) || 0;
  };

  const actionsCell = (setup) => {
    const busy = busyId === setup.id;
    const editing = editingId === setup.id;
    const blocked = deleteBlockedReason(setup);
    return (
      <div className="flex items-center justify-end gap-1">
        {!setup.archived && (
          <>
            <Button
              size="xs"
              variant="ghost"
              disabled={busy || editing}
              onClick={() => startRename(setup)}
            >
              Rename
            </Button>
            <Button
              size="xs"
              variant="ghost"
              disabled={busy || editing || Boolean(trimmed(setup.mergedInto))}
              onClick={() => {
                setMergeSourceId(setup.id);
                setMergeTargetId(null);
              }}
            >
              Merge
            </Button>
          </>
        )}
        <Button
          size="xs"
          variant="ghost"
          disabled={busy || editing}
          onClick={() => void toggleArchive(setup, !setup.archived)}
        >
          {setup.archived ? 'Restore' : 'Archive'}
        </Button>
        {!setup.isDefault && (
          <Button
            size="xs"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={busy || editing || Boolean(blocked)}
            title={blocked || undefined}
            onClick={() => setDeleteTargetId(setup.id)}
          >
            Delete
          </Button>
        )}
      </div>
    );
  };

  // Rebuilt every render on purpose. Each cell closes over the edit draft, the
  // busy row, the hydration gate and the catalog, so a memo here would need
  // every one of them as a dependency and would still produce a new array on
  // any keystroke — DataTable reads `columns` during render and never caches it,
  // so the memo would buy nothing and be one stale-closure bug away from
  // rendering the wrong row's input.
  const columns = [
    { id: 'name', header: 'Setup', cell: nameCell },
    { id: 'count', header: 'Trades', numeric: true, width: '5rem', cell: countCell },
    { id: 'actions', header: 'Actions', align: 'end', cell: actionsCell },
  ];

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Manage setups"
      description="Rename, merge, or archive. Historical trades are never modified."
      footer={
        <Button variant="outline" size="sm" onClick={() => onOpenChange?.(false)}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {!tradesHydrated && (
          <p role="status" className="text-xs text-muted-foreground">
            {hydrationFailed
              ? 'Your complete trade history could not be loaded. Counts are unavailable and deleting is disabled.'
              : 'Counting trades across your full history…'}
          </p>
        )}

        <DataTable
          caption="Your setups"
          columns={columns}
          rows={activeSetups}
          getRowId={(row) => row.id}
          empty={
            <EmptyState
              title="No setups yet"
              description="Tag a trade with a setup and it appears here."
              className="py-8"
            />
          }
        />

        {archivedSetups.length > 0 && (
          <SectionCard
            title="Archived"
            description="Hidden from pickers. Trades keep their tag."
            meta={`${archivedSetups.length} archived`}
          >
            <DataTable
              caption="Archived setups"
              columns={columns}
              rows={archivedSetups}
              getRowId={(row) => row.id}
            />
          </SectionCard>
        )}
      </div>

      <AppDialog
        open={mergeSource != null}
        onOpenChange={(next) => {
          if (!next) {
            setMergeSourceId(null);
            setMergeTargetId(null);
          }
        }}
        size="sm"
        title="Merge setup"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMergeSourceId(null);
                setMergeTargetId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!mergeTargetId || busyId === mergeSourceId}
              onClick={() => void confirmMerge()}
            >
              Merge
            </Button>
          </>
        }
      >
        {mergeSource && (
          <div className="flex flex-col gap-3">
            <Select
              items={mergeTargetItems}
              value={mergeTargetId}
              onValueChange={(next) => setMergeTargetId(next ?? null)}
            >
              <SelectTrigger className="w-full" aria-label="Merge into">
                <SelectValue placeholder="Merge into…" />
              </SelectTrigger>
              <SelectContent>
                {mergeTargets.map((setup) => (
                  <SelectItem key={setup.id} value={setup.id}>
                    {setup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {mergeTargetName
                ? `Trades keep their history; '${mergeSource.name}' will report under '${mergeTargetName}'.`
                : `Trades keep their history; '${mergeSource.name}' will report under the setup you pick.`}
            </p>
          </div>
        )}
      </AppDialog>

      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(next) => { if (!next) setDeleteTargetId(null); }}
      >
        <AlertDialogContent overlayClassName="z-[90]" className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this setup?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be removed from your catalog. No trade references it. This cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>
              Delete setup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppDialog>
  );
}

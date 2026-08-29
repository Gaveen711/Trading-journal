import { useCallback, useMemo, useState } from 'react';
import type { AdminMutationConfirmation } from '../domain/models';
import { assertMutationReason, mutationReasonError } from '../domain/models';

type ConfirmationAction = (reason: string) => Promise<unknown>;

interface PendingConfirmation extends AdminMutationConfirmation {
  action: ConfirmationAction;
}

export interface MutationConfirmationState {
  confirmation: AdminMutationConfirmation | null;
  reason: string;
  setReason: (reason: string) => void;
  requestConfirmation: (confirmation: AdminMutationConfirmation, action: ConfirmationAction) => void;
  cancelConfirmation: () => void;
  confirm: () => Promise<void>;
  isPending: boolean;
  error: Error | null;
  canConfirm: boolean;
}

export function useMutationConfirmation(): MutationConfirmationState {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const [reason, setReason] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestConfirmation = useCallback((confirmation: AdminMutationConfirmation, action: ConfirmationAction) => {
    setPending({ ...confirmation, action });
    setReason('');
    setError(null);
  }, []);

  const cancelConfirmation = useCallback(() => {
    if (isPending) return;
    setPending(null);
    setReason('');
    setError(null);
  }, [isPending]);

  const confirm = useCallback(async () => {
    if (!pending) return;
    setIsPending(true);
    setError(null);
    try {
      await pending.action(assertMutationReason(reason));
      setPending(null);
      setReason('');
    } catch (value) {
      setError(value instanceof Error ? value : new Error('The administrative action failed.'));
      throw value;
    } finally {
      setIsPending(false);
    }
  }, [pending, reason]);

  return useMemo(() => ({
    confirmation: pending ? {
      title: pending.title,
      description: pending.description,
      confirmLabel: pending.confirmLabel,
      destructive: pending.destructive,
    } : null,
    reason,
    setReason,
    requestConfirmation,
    cancelConfirmation,
    confirm,
    isPending,
    error,
    canConfirm: mutationReasonError(reason) === null && !isPending,
  }), [cancelConfirmation, confirm, error, isPending, pending, reason, requestConfirmation]);
}


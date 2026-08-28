import { useCallback } from 'react';
import type { PaymentListParams } from '../domain/models';
import { PaymentRepository } from '../data';
import { useAdminCollection } from './useAdminCollection';
import { useAdminMutation } from './useAdminMutation';

export interface DeletePaymentInput { paymentId: string; reason: string }

export function usePayments(params: PaymentListParams = {}) {
  const { status, userId, from, to, pageSize } = params;
  const key = JSON.stringify({ status: status ?? '', userId: userId ?? '', from: from ?? '', to: to ?? '', pageSize: pageSize ?? null });
  const fetchPage = useCallback((pageToken: string | undefined, signal: AbortSignal) => (
    PaymentRepository.list({ status, userId, from, to, pageSize, pageToken }, signal)
  ), [from, pageSize, status, to, userId]);
  const collection = useAdminCollection(key, fetchPage);
  const { refresh } = collection;
  const afterMutation = useCallback(() => refresh(), [refresh]);
  const deleteAction = useCallback((input: DeletePaymentInput, signal: AbortSignal) => (
    PaymentRepository.delete(input.paymentId, input.reason, signal)
  ), []);
  const remove = useAdminMutation(deleteAction, afterMutation);
  return {
    ...collection,
    payments: collection.data,
    deletePayment: remove.mutate,
    isPending: remove.isPending,
    mutationError: remove.error,
    resetMutation: remove.reset,
  };
}

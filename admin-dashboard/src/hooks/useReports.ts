import { useCallback } from 'react';
import type { ReportListParams, ReportUpdate } from '../domain/models';
import { ReportRepository } from '../data';
import { useAdminCollection } from './useAdminCollection';
import { useAdminMutation } from './useAdminMutation';

export interface UpdateReportInput { reportId: string; updates: ReportUpdate; reason: string }
export interface DeleteReportInput { reportId: string; reason: string }

export function useReports(params: ReportListParams = {}) {
  const { type, status, userId, pageSize } = params;
  const key = JSON.stringify({ type: type ?? '', status: status ?? '', userId: userId ?? '', pageSize: pageSize ?? null });
  const fetchPage = useCallback((pageToken: string | undefined, signal: AbortSignal) => (
    ReportRepository.list({ type, status, userId, pageSize, pageToken }, signal)
  ), [pageSize, status, type, userId]);
  const collection = useAdminCollection(key, fetchPage);
  const { refresh } = collection;
  const afterMutation = useCallback(() => refresh(), [refresh]);
  const updateAction = useCallback((input: UpdateReportInput, signal: AbortSignal) => (
    ReportRepository.update(input.reportId, input.updates, input.reason, signal)
  ), []);
  const deleteAction = useCallback((input: DeleteReportInput, signal: AbortSignal) => (
    ReportRepository.delete(input.reportId, input.reason, signal)
  ), []);
  const update = useAdminMutation(updateAction, afterMutation);
  const remove = useAdminMutation(deleteAction, afterMutation);
  return {
    ...collection,
    reports: collection.data,
    updateReport: update.mutate,
    updateStatus: ({ reportId, status: nextStatus, reason }: { reportId: string; status: ReportUpdate['status']; reason: string }) => (
      update.mutate({ reportId, updates: { status: nextStatus }, reason })
    ),
    deleteReport: remove.mutate,
    isPending: update.isPending || remove.isPending,
    mutationError: update.error ?? remove.error,
    resetMutation: () => { update.reset(); remove.reset(); },
  };
}

import type { Paginated, Report, ReportListParams, ReportUpdate } from '../../domain/models';
import { decodeReport, reasonedBody, requestCollection, requestData } from '../api';

function reportStatus(status: ReportListParams['status'] | ReportUpdate['status']): string | undefined {
  if (status === 'IN_PROGRESS') return 'in_review';
  return status?.toLowerCase();
}

function reportPatch(updates: ReportUpdate): Record<string, unknown> {
  return {
    ...updates,
    ...(updates.status ? { status: reportStatus(updates.status) } : {}),
    ...(updates.priority ? { priority: updates.priority.toLowerCase() } : {}),
  };
}

export const ReportRepository = {
  list(params: ReportListParams = {}, signal?: AbortSignal): Promise<Paginated<Report>> {
    return requestCollection('/reports', decodeReport, { ...params, status: reportStatus(params.status) }, signal);
  },

  update(reportId: string, updates: ReportUpdate, reason: string, signal?: AbortSignal): Promise<Report> {
    return requestData(`/reports/${encodeURIComponent(reportId)}`, decodeReport, {
      method: 'PATCH',
      body: reasonedBody(reportPatch(updates), reason),
      signal,
    });
  },

  async delete(reportId: string, reason: string, signal?: AbortSignal): Promise<void> {
    await requestData(`/reports/${encodeURIComponent(reportId)}`, () => undefined, {
      method: 'DELETE',
      body: reasonedBody({}, reason),
      signal,
    });
  },
};

import type { Analytics, AnalyticsParams } from '../../domain/models';
import { buildAdminQuery, decodeAnalytics, requestData } from '../api';

export type { AnalyticsParams } from '../../domain/models';

export const AnalyticsRepository = {
  get(params: AnalyticsParams = {}, signal?: AbortSignal): Promise<Analytics> {
    return requestData(`/analytics${buildAdminQuery({ from: params.from, to: params.to })}`, decodeAnalytics, { signal });
  },
};

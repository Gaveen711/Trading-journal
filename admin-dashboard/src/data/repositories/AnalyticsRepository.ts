import type { Analytics } from '../../domain/models';
import { buildAdminQuery, decodeAnalytics, requestData } from '../api';

export interface AnalyticsParams {
  from?: string;
  to?: string;
}

export const AnalyticsRepository = {
  get(params: AnalyticsParams = {}, signal?: AbortSignal): Promise<Analytics> {
    return requestData(`/analytics${buildAdminQuery({ from: params.from, to: params.to })}`, decodeAnalytics, { signal });
  },
};

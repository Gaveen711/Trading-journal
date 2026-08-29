import type { UserAnalytics, UserAnalyticsParams } from '../../domain/models';
import { buildAdminQuery, decodeUserAnalytics, requestDataWithMetadata } from '../api';

export const UserAnalyticsRepository = {
  async get(
    userId: string,
    params: UserAnalyticsParams = {},
    signal?: AbortSignal,
  ): Promise<UserAnalytics> {
    const response = await requestDataWithMetadata(
      `/users/${encodeURIComponent(userId)}/analytics${buildAdminQuery({
        from: params.from,
        to: params.to,
        limit: params.pageSize,
        pageToken: params.pageToken,
      })}`,
      decodeUserAnalytics,
      { signal },
    );
    return {
      ...response.data,
      nextPageToken: response.nextPageToken ?? response.data.nextPageToken,
    };
  },
};

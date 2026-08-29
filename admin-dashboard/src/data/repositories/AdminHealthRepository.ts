import type { AdminHealth } from '../../domain/models';
import { decodeAdminHealth, requestDataWithMetadata } from '../api';

export const AdminHealthRepository = {
  async get(signal?: AbortSignal): Promise<AdminHealth> {
    const response = await requestDataWithMetadata('/health', decodeAdminHealth, { signal });
    return {
      ...response.data,
      ...(response.requestId ? { requestId: response.requestId } : {}),
    };
  },
};

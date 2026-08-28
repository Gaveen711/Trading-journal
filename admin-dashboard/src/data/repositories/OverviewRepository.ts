import type { Overview } from '../../domain/models';
import { decodeOverview, requestData } from '../api';

export const OverviewRepository = {
  get(signal?: AbortSignal): Promise<Overview> {
    return requestData('/overview', decodeOverview, { signal });
  },
};


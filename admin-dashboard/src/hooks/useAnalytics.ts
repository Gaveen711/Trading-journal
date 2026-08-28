import { useCallback } from 'react';
import { AnalyticsRepository, type AnalyticsParams } from '../data';
import { useAdminQuery } from './useAdminQuery';

export function useAnalytics(params: AnalyticsParams = {}) {
  const { from, to } = params;
  const loader = useCallback((signal: AbortSignal) => AnalyticsRepository.get({ from, to }, signal), [from, to]);
  return useAdminQuery(loader);
}


import { useCallback } from 'react';
import { OverviewRepository } from '../data';
import { useAdminQuery } from './useAdminQuery';

export function useOverview() {
  const loader = useCallback((signal: AbortSignal) => OverviewRepository.get(signal), []);
  return useAdminQuery(loader);
}

export const useDashboardStats = useOverview;


import { useCallback, useMemo } from 'react';
import type { AdminApiAvailability } from '../domain/models';
import { AdminHealthRepository } from '../data';
import { useAdminQuery } from './useAdminQuery';

export function useAdminHealth() {
  const loader = useCallback((signal: AbortSignal) => AdminHealthRepository.get(signal), []);
  const query = useAdminQuery(loader);
  const availability: AdminApiAvailability = query.data?.availability
    ?? (query.error ? 'UNAVAILABLE' : 'CHECKING');

  return useMemo(() => ({
    ...query,
    availability,
    isAvailable: availability === 'AVAILABLE',
    isDegraded: availability === 'DEGRADED',
    canMutate: availability === 'AVAILABLE',
  }), [availability, query]);
}

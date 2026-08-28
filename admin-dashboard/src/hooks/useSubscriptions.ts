import { useCallback } from 'react';
import type { SubscriptionListParams } from '../domain/models';
import { SubscriptionRepository } from '../data';
import { useAdminCollection } from './useAdminCollection';

export function useSubscriptions(params: SubscriptionListParams = {}) {
  const { plan, pageSize } = params;
  const key = JSON.stringify({ plan: plan ?? '', pageSize: pageSize ?? null });
  const fetchPage = useCallback((pageToken: string | undefined, signal: AbortSignal) => (
    SubscriptionRepository.list({ plan, pageSize, pageToken }, signal)
  ), [pageSize, plan]);
  const collection = useAdminCollection(key, fetchPage);
  return { ...collection, subscriptions: collection.data };
}

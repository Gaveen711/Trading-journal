import type { Paginated, Subscription, SubscriptionListParams } from '../../domain/models';
import { decodeSubscription, requestCollection } from '../api';

export const SubscriptionRepository = {
  list(params: SubscriptionListParams = {}, signal?: AbortSignal): Promise<Paginated<Subscription>> {
    return requestCollection('/subscriptions', decodeSubscription, {
      pageSize: params.pageSize,
      pageToken: params.pageToken,
      plan: params.plan?.toLowerCase(),
    }, signal);
  },
};

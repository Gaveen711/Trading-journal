import type { IsoDateString, PaginationParams } from './common';
import type { UserPlan } from './User';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'PAUSED'
  | 'UNKNOWN';

export interface Subscription {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  autoRenew: boolean;
  customerId?: string;
  providerSubscriptionId?: string;
  currentPeriodStart?: IsoDateString;
  currentPeriodEnd?: IsoDateString;
  canceledAt?: IsoDateString;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
}

export interface SubscriptionListParams extends PaginationParams {
  plan?: UserPlan;
}

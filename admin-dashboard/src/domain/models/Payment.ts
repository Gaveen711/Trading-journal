import type { IsoDateString, PaginationParams } from './common';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PENDING';

export interface Payment {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: IsoDateString;
  stripeInvoiceId?: string;
  providerPaymentId?: string;
  provider?: string;
  subscriptionId?: string;
  orderId?: string;
  refundedAmount?: number;
  type?: string;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
  paidAt?: IsoDateString;
  refundedAt?: IsoDateString;
  description?: string;
}

export interface PaymentListParams extends PaginationParams {
  status?: PaymentStatus;
  userId?: string;
  from?: IsoDateString;
  to?: IsoDateString;
}

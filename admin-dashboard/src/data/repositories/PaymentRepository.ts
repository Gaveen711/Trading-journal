import type { Paginated, Payment, PaymentListParams } from '../../domain/models';
import { decodePayment, reasonedBody, requestCollection, requestData } from '../api';

function paymentStatus(status: PaymentListParams['status']): string | undefined {
  if (status === 'SUCCESS') return 'succeeded';
  return status?.toLowerCase();
}

export const PaymentRepository = {
  list(params: PaymentListParams = {}, signal?: AbortSignal): Promise<Paginated<Payment>> {
    return requestCollection('/payments', decodePayment, { ...params, status: paymentStatus(params.status) }, signal);
  },

  async delete(paymentId: string, reason: string, signal?: AbortSignal): Promise<void> {
    await requestData(`/payments/${encodeURIComponent(paymentId)}`, () => undefined, {
      method: 'DELETE',
      body: reasonedBody({}, reason),
      signal,
    });
  },
};

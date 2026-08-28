import type { Coupon, CouponCreate, CouponListParams, CouponUpdate, Paginated } from '../../domain/models';
import { decodeCoupon, reasonedBody, requestCollection, requestData } from '../api';

function couponPayload(value: CouponCreate | CouponUpdate): Record<string, unknown> {
  const { discount, type, expiry, ...rest } = value;
  return {
    ...rest,
    ...(discount !== undefined ? { discountValue: discount } : {}),
    ...(type !== undefined ? { discountType: type.toLowerCase() } : {}),
    ...(expiry !== undefined ? { expiresAt: expiry } : {}),
  };
}

export const CouponRepository = {
  list(params: CouponListParams = {}, signal?: AbortSignal): Promise<Paginated<Coupon>> {
    return requestCollection('/coupons', decodeCoupon, { ...params }, signal);
  },

  create(value: CouponCreate, reason: string, signal?: AbortSignal): Promise<Coupon> {
    return requestData('/coupons', decodeCoupon, {
      method: 'POST',
      body: reasonedBody(couponPayload(value), reason),
      signal,
    });
  },

  update(couponId: string, updates: CouponUpdate, reason: string, signal?: AbortSignal): Promise<Coupon> {
    return requestData(`/coupons/${encodeURIComponent(couponId)}`, decodeCoupon, {
      method: 'PATCH',
      body: reasonedBody(couponPayload(updates), reason),
      signal,
    });
  },

  async delete(couponId: string, reason: string, signal?: AbortSignal): Promise<void> {
    await requestData(`/coupons/${encodeURIComponent(couponId)}`, () => undefined, {
      method: 'DELETE',
      body: reasonedBody({}, reason),
      signal,
    });
  },
};

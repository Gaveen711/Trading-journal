import type { IsoDateString, PaginationParams } from './common';

export type CouponType = 'PERCENT' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: CouponType;
  expiry?: IsoDateString;
  active: boolean;
  description?: string;
  currency?: string;
  maxRedemptions?: number;
  redeemedCount: number;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
}

export interface CouponListParams extends PaginationParams {
  active?: boolean;
  search?: string;
}

export type CouponCreate = Pick<Coupon, 'code' | 'discount' | 'type' | 'active'>
  & Partial<Pick<Coupon, 'expiry' | 'description' | 'currency' | 'maxRedemptions'>>;
export type CouponUpdate = Partial<Pick<Coupon,
  'discount' | 'type' | 'active' | 'description' | 'currency' | 'maxRedemptions'
>> & { expiry?: IsoDateString | null };

import { useCallback } from 'react';
import type { CouponCreate, CouponListParams, CouponUpdate } from '../domain/models';
import { CouponRepository } from '../data';
import { useAdminCollection } from './useAdminCollection';
import { useAdminMutation } from './useAdminMutation';

export interface CreateCouponInput { value: CouponCreate; reason: string }
export interface UpdateCouponInput { couponId: string; updates: CouponUpdate; reason: string }
export interface DeleteCouponInput { couponId: string; reason: string }

export function useCoupons(params: CouponListParams = {}) {
  const { active, search, pageSize } = params;
  const key = JSON.stringify({ active: active ?? null, search: search ?? '', pageSize: pageSize ?? null });
  const fetchPage = useCallback((pageToken: string | undefined, signal: AbortSignal) => (
    CouponRepository.list({ active, search, pageSize, pageToken }, signal)
  ), [active, pageSize, search]);
  const collection = useAdminCollection(key, fetchPage);
  const { refresh } = collection;
  const afterMutation = useCallback(() => refresh(), [refresh]);
  const createAction = useCallback((input: CreateCouponInput, signal: AbortSignal) => (
    CouponRepository.create(input.value, input.reason, signal)
  ), []);
  const updateAction = useCallback((input: UpdateCouponInput, signal: AbortSignal) => (
    CouponRepository.update(input.couponId, input.updates, input.reason, signal)
  ), []);
  const deleteAction = useCallback((input: DeleteCouponInput, signal: AbortSignal) => (
    CouponRepository.delete(input.couponId, input.reason, signal)
  ), []);
  const create = useAdminMutation(createAction, afterMutation);
  const update = useAdminMutation(updateAction, afterMutation);
  const remove = useAdminMutation(deleteAction, afterMutation);
  return {
    ...collection,
    coupons: collection.data,
    createCoupon: create.mutate,
    updateCoupon: update.mutate,
    deleteCoupon: remove.mutate,
    isPending: create.isPending || update.isPending || remove.isPending,
    mutationError: create.error ?? update.error ?? remove.error,
    resetMutation: () => { create.reset(); update.reset(); remove.reset(); },
  };
}

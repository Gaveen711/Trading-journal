import { useCallback } from 'react';
import type { UserListParams, UserUpdate } from '../domain/models';
import { UserRepository } from '../data';
import { useAdminCollection } from './useAdminCollection';
import { useAdminMutation } from './useAdminMutation';
import { useAdminQuery } from './useAdminQuery';

export interface UpdateUserInput {
  userId: string;
  updates: UserUpdate;
  reason: string;
}

export interface DeleteUserInput {
  userId: string;
  reason: string;
}

export function useUserActions(onSuccess?: () => void | Promise<void>) {
  const updateAction = useCallback((input: UpdateUserInput, signal: AbortSignal) => (
    UserRepository.update(input.userId, input.updates, input.reason, signal)
  ), []);
  const deleteAction = useCallback((input: DeleteUserInput, signal: AbortSignal) => (
    UserRepository.delete(input.userId, input.reason, signal)
  ), []);
  const update = useAdminMutation(updateAction, onSuccess);
  const remove = useAdminMutation(deleteAction, onSuccess);

  return {
    updateUser: update.mutate,
    deleteUser: remove.mutate,
    isPending: update.isPending || remove.isPending,
    mutationError: update.error ?? remove.error,
    resetMutation: () => { update.reset(); remove.reset(); },
  };
}

export function useUsers(params: UserListParams = {}) {
  const { search, plan, status, pageSize } = params;
  const key = JSON.stringify({ search: search ?? '', plan: plan ?? '', status: status ?? '', pageSize: pageSize ?? null });
  const fetchPage = useCallback((pageToken: string | undefined, signal: AbortSignal) => (
    UserRepository.list({ search, plan, status, pageSize, pageToken }, signal)
  ), [pageSize, plan, search, status]);
  const collection = useAdminCollection(key, fetchPage);
  const { refresh } = collection;
  const afterMutation = useCallback(() => refresh(), [refresh]);
  const actions = useUserActions(afterMutation);

  return {
    ...collection,
    users: collection.data,
    ...actions,
  };
}

export function useUser(userId: string) {
  const loader = useCallback(async (signal: AbortSignal) => {
    if (!userId) return null;
    return UserRepository.getById(userId, signal);
  }, [userId]);
  const query = useAdminQuery(loader);
  const data = query.data && query.data.uid === userId ? query.data : undefined;
  return {
    ...query,
    data,
    isLoading: Boolean(userId) && (query.isLoading || Boolean(query.data && !data)),
  };
}

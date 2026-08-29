import type { Paginated, User, UserListParams, UserUpdate } from '../../domain/models';
import { decodeUser, reasonedBody, requestCollection, requestData } from '../api';

function userPatch(updates: UserUpdate): Record<string, unknown> {
  const { plan, status, ...rest } = updates;
  return {
    ...rest,
    ...(plan ? { plan: plan.toLowerCase() } : {}),
    ...(status ? { disabled: status === 'SUSPENDED' } : {}),
  };
}

export const UserRepository = {
  list(params: UserListParams = {}, signal?: AbortSignal): Promise<Paginated<User>> {
    return requestCollection('/users', decodeUser, {
      ...params,
      search: params.search?.trim() || undefined,
    }, signal);
  },

  getById(userId: string, signal?: AbortSignal): Promise<User> {
    return requestData(`/users/${encodeURIComponent(userId)}`, decodeUser, { signal });
  },

  update(userId: string, updates: UserUpdate, reason: string, signal?: AbortSignal): Promise<User> {
    return requestData(`/users/${encodeURIComponent(userId)}`, decodeUser, {
      method: 'PATCH',
      body: reasonedBody(userPatch(updates), reason),
      signal,
    });
  },

  async delete(userId: string, reason: string, signal?: AbortSignal): Promise<void> {
    await requestData(`/users/${encodeURIComponent(userId)}`, () => undefined, {
      method: 'DELETE',
      body: reasonedBody({}, reason),
      signal,
    });
  },
};

import { useCallback } from 'react';
import type { AnnouncementCreate, AnnouncementListParams, AnnouncementUpdate } from '../domain/models';
import { AnnouncementRepository } from '../data';
import { useAdminCollection } from './useAdminCollection';
import { useAdminMutation } from './useAdminMutation';

export interface CreateAnnouncementInput { value: AnnouncementCreate; reason: string }
export interface UpdateAnnouncementInput { announcementId: string; updates: AnnouncementUpdate; reason: string }
export interface DeleteAnnouncementInput { announcementId: string; reason: string }

export function useAnnouncements(params: AnnouncementListParams = {}) {
  const { active, target, pageSize } = params;
  const key = JSON.stringify({ active: active ?? null, target: target ?? '', pageSize: pageSize ?? null });
  const fetchPage = useCallback((pageToken: string | undefined, signal: AbortSignal) => (
    AnnouncementRepository.list({ active, target, pageSize, pageToken }, signal)
  ), [active, pageSize, target]);
  const collection = useAdminCollection(key, fetchPage);
  const { refresh } = collection;
  const afterMutation = useCallback(() => refresh(), [refresh]);
  const createAction = useCallback((input: CreateAnnouncementInput, signal: AbortSignal) => (
    AnnouncementRepository.create(input.value, input.reason, signal)
  ), []);
  const updateAction = useCallback((input: UpdateAnnouncementInput, signal: AbortSignal) => (
    AnnouncementRepository.update(input.announcementId, input.updates, input.reason, signal)
  ), []);
  const deleteAction = useCallback((input: DeleteAnnouncementInput, signal: AbortSignal) => (
    AnnouncementRepository.delete(input.announcementId, input.reason, signal)
  ), []);
  const create = useAdminMutation(createAction, afterMutation);
  const update = useAdminMutation(updateAction, afterMutation);
  const remove = useAdminMutation(deleteAction, afterMutation);
  return {
    ...collection,
    announcements: collection.data,
    createAnnouncement: create.mutate,
    updateAnnouncement: update.mutate,
    deleteAnnouncement: remove.mutate,
    isPending: create.isPending || update.isPending || remove.isPending,
    mutationError: create.error ?? update.error ?? remove.error,
    resetMutation: () => { create.reset(); update.reset(); remove.reset(); },
  };
}

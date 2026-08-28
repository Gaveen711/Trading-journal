import { useCallback } from 'react';
import type { SystemSettingsUpdate } from '../domain/models';
import { SettingsRepository } from '../data';
import { useAdminMutation } from './useAdminMutation';
import { useAdminQuery } from './useAdminQuery';

export interface UpdateSettingsInput { updates: SystemSettingsUpdate; reason: string }

export function useSettings() {
  const loader = useCallback((signal: AbortSignal) => SettingsRepository.get(signal), []);
  const query = useAdminQuery(loader);
  const { refresh } = query;
  const afterMutation = useCallback(() => refresh(), [refresh]);
  const updateAction = useCallback((input: UpdateSettingsInput, signal: AbortSignal) => (
    SettingsRepository.update(input.updates, input.reason, signal)
  ), []);
  const update = useAdminMutation(updateAction, afterMutation);
  return {
    ...query,
    settings: query.data,
    updateSettings: update.mutate,
    save: update.mutate,
    isPending: update.isPending,
    mutationError: update.error,
    resetMutation: update.reset,
  };
}

export const useSystemSettings = useSettings;

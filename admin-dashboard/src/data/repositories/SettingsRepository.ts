import type { SystemSettings, SystemSettingsUpdate } from '../../domain/models';
import { decodeSettings, reasonedBody, requestData } from '../api';

function settingsPatch(updates: SystemSettingsUpdate): Record<string, unknown> {
  const { allowRegistration, ...rest } = updates;
  return {
    ...rest,
    ...(allowRegistration !== undefined ? { signupsEnabled: allowRegistration } : {}),
  };
}

export const SettingsRepository = {
  get(signal?: AbortSignal): Promise<SystemSettings> {
    return requestData('/settings', decodeSettings, { signal });
  },

  update(updates: SystemSettingsUpdate, reason: string, signal?: AbortSignal): Promise<SystemSettings> {
    return requestData('/settings', decodeSettings, {
      method: 'PATCH',
      body: reasonedBody(settingsPatch(updates), reason),
      signal,
    });
  },
};

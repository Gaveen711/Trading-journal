import type { IsoDateString } from './common';

export interface SystemSettings {
  supportEmail: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  trialDays: number;
  announcementBannerEnabled: boolean;
  reportsEnabled: boolean;
  updatedAt?: IsoDateString;
}

export type SystemSettingsUpdate = Partial<Pick<SystemSettings,
  | 'supportEmail'
  | 'allowRegistration'
  | 'maintenanceMode'
  | 'trialDays'
  | 'announcementBannerEnabled'
  | 'reportsEnabled'
>>;

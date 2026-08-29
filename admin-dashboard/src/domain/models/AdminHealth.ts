import type { IsoDateString } from './common';

export type AdminApiAvailability = 'CHECKING' | 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE';
export type AdminHealthCheckStatus = Exclude<AdminApiAvailability, 'CHECKING'>;

export interface AdminHealthCheck {
  name: string;
  status: AdminHealthCheckStatus;
  message?: string;
}

export interface AdminHealth {
  availability: Exclude<AdminApiAvailability, 'CHECKING'>;
  generatedAt: IsoDateString;
  checks: AdminHealthCheck[];
  message?: string;
  requestId?: string;
}

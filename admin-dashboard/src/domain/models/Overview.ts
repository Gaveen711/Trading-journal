import type { IsoDateString } from './common';

export interface Overview {
  totalUsers: number;
  activeSubscriptions: number;
  totalPayments: number;
  openReports: number;
  generatedAt: IsoDateString;
}

export type DashboardStats = Overview;

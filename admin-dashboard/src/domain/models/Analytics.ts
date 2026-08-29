import type { AdminDataFreshness, IsoDateString } from './common';

export interface AnalyticsDateRange {
  from?: IsoDateString;
  to?: IsoDateString;
  timezone?: string;
  field?: string;
}

export interface AnalyticsTimeSeriesPoint {
  date: IsoDateString;
  newUsers: number;
  payments: number;
  settledPayments: number;
  failedPayments: number;
  revenue: number;
  openedReports: number;
  resolvedReports: number;
}

export interface Analytics {
  users: {
    total: number;
    free: number;
    pro: number;
    grace: number;
  };
  payments: {
    total: number;
    settled: number;
    failed: number;
    revenue: number | null;
  };
  reports: {
    open: number;
    resolved: number;
  };
  range: AnalyticsDateRange;
  timeSeries: AnalyticsTimeSeriesPoint[];
  generatedAt: IsoDateString;
  freshness: AdminDataFreshness;
}

export interface AnalyticsParams extends AnalyticsDateRange {}

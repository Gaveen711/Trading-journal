import type { IsoDateString, PaginationParams } from './common';

export type ReportType = 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT';
export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  type: ReportType;
  subject: string;
  message: string;
  status: ReportStatus;
  createdAt: IsoDateString;
  updatedAt?: IsoDateString;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeUid?: string;
  resolutionNote?: string;
  tradeId?: string;
  resolvedAt?: IsoDateString;
}

export interface ReportListParams extends PaginationParams {
  type?: ReportType;
  status?: ReportStatus;
  userId?: string;
}

export interface ReportUpdate {
  status?: ReportStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeUid?: string | null;
  resolutionNote?: string | null;
}

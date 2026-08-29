export type AdminId = string;
export type IsoDateString = string;

export type AdminDataFreshnessStatus = 'FRESH' | 'PARTIAL' | 'STALE' | 'UNKNOWN';

export interface AdminDataSampleCounts {
  users: number;
  payments: number;
  reports: number;
}

export interface AdminDataFreshness {
  status: AdminDataFreshnessStatus;
  asOf?: IsoDateString;
  ageSeconds?: number;
  source?: string;
  complete?: boolean;
  scanned?: number;
  scanLimit?: number;
  sampled?: AdminDataSampleCounts;
}

export interface PaginationParams {
  pageSize?: number;
  pageToken?: string;
}

export interface Paginated<T> {
  data: T[];
  nextPageToken?: string;
}

export interface SingleResult<T> {
  data: T;
}

export interface MutationReason {
  reason: string;
}

export type Reasoned<T extends object = Record<string, never>> = T & MutationReason;

export type AdminQueryError = Error | null;

export interface AdminMutationConfirmation {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function mutationReasonError(reason: string): string | null {
  const normalized = reason.trim().replace(/[\r\n]+/g, ' ');
  const meaningfulWords = normalized.match(/[\p{L}\p{N}]{2,}/gu) ?? [];
  if (normalized.length < 10 || meaningfulWords.length < 2) {
    return 'Enter a specific reason of at least 10 characters and two meaningful words.';
  }
  if (normalized.length > 500) {
    return 'The administrative reason must not exceed 500 characters.';
  }
  return null;
}

export function assertMutationReason(reason: string): string {
  const normalized = reason.trim().replace(/[\r\n]+/g, ' ');
  const error = mutationReasonError(normalized);
  if (error) throw new Error(error);
  return normalized;
}


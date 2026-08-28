export type AdminId = string;
export type IsoDateString = string;

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

export function assertMutationReason(reason: string): string {
  const normalized = reason.trim();
  if (normalized.length < 3) {
    throw new Error('An administrative reason of at least 3 characters is required.');
  }
  if (normalized.length > 500) {
    throw new Error('The administrative reason must not exceed 500 characters.');
  }
  return normalized;
}


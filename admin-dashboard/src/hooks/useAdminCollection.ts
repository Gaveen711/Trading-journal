import { useCallback, useMemo, useState } from 'react';
import type { Paginated } from '../domain/models';
import { useAdminQuery } from './useAdminQuery';

interface PagingState {
  key: string;
  pageToken?: string;
  previousTokens: Array<string | undefined>;
}

export interface AdminCollectionState<T> {
  data: T[];
  nextPageToken?: string;
  pageToken?: string;
  page: number;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  canNextPage: boolean;
  canPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  resetPagination: () => void;
  refresh: () => Promise<void>;
}

export function useAdminCollection<T>(
  key: string,
  fetchPage: (pageToken: string | undefined, signal: AbortSignal) => Promise<Paginated<T>>,
): AdminCollectionState<T> {
  const [paging, setPaging] = useState<PagingState>({ key, previousTokens: [] });
  const activePaging = useMemo<PagingState>(
    () => paging.key === key ? paging : { key, previousTokens: [] },
    [key, paging],
  );
  const loader = useCallback(
    (signal: AbortSignal) => fetchPage(activePaging.pageToken, signal),
    [activePaging.pageToken, fetchPage],
  );
  const query = useAdminQuery(loader);

  const nextPage = useCallback(() => {
    if (!query.data?.nextPageToken) return;
    setPaging((current) => {
      const active = current.key === key ? current : { key, previousTokens: [] };
      return {
        key,
        pageToken: query.data?.nextPageToken,
        previousTokens: [...active.previousTokens, active.pageToken],
      };
    });
  }, [key, query.data?.nextPageToken]);

  const previousPage = useCallback(() => {
    setPaging((current) => {
      const active = current.key === key ? current : { key, previousTokens: [] };
      if (active.previousTokens.length === 0) return active;
      const previousTokens = active.previousTokens.slice(0, -1);
      return { key, pageToken: active.previousTokens.at(-1), previousTokens };
    });
  }, [key]);

  const resetPagination = useCallback(() => setPaging({ key, previousTokens: [] }), [key]);

  return useMemo(() => ({
    data: query.data?.data ?? [],
    nextPageToken: query.data?.nextPageToken,
    pageToken: activePaging.pageToken,
    page: activePaging.previousTokens.length + 1,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    canNextPage: Boolean(query.data?.nextPageToken),
    canPreviousPage: activePaging.previousTokens.length > 0,
    nextPage,
    previousPage,
    resetPagination,
    refresh: query.refresh,
  }), [activePaging, nextPage, previousPage, query, resetPagination]);
}

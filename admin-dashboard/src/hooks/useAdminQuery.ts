import { useCallback, useEffect, useRef, useState } from 'react';

export interface AdminQueryState<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refresh: () => Promise<void>;
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error('An unknown admin request error occurred.');
}

export function useAdminQuery<T>(loader: (signal: AbortSignal) => Promise<T>): AdminQueryState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    controllerRef.current = controller;
    setIsFetching(true);
    setError(null);

    try {
      const nextData = await loader(controller.signal);
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setData(nextData);
        setIsLoading(false);
      }
    } catch (value) {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setError(asError(value));
        setIsLoading(false);
      }
    } finally {
      if (requestId === requestIdRef.current && !controller.signal.aborted) setIsFetching(false);
    }
  }, [loader]);

  useEffect(() => {
    void refresh();
    return () => controllerRef.current?.abort();
  }, [refresh]);

  return { data, error, isLoading, isFetching, refresh };
}


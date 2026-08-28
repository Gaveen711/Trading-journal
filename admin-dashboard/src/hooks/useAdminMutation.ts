import { useCallback, useRef, useState } from 'react';

export interface AdminMutationState<TInput, TResult> {
  mutate: (input: TInput) => Promise<TResult>;
  data: TResult | undefined;
  error: Error | null;
  isPending: boolean;
  reset: () => void;
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error('An unknown admin mutation error occurred.');
}

export function useAdminMutation<TInput, TResult>(
  action: (input: TInput, signal: AbortSignal) => Promise<TResult>,
  onSuccess?: (result: TResult, input: TInput) => void | Promise<void>,
): AdminMutationState<TInput, TResult> {
  const [data, setData] = useState<TResult>();
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setData(undefined);
    setError(null);
    setIsPending(false);
  }, []);

  const mutate = useCallback(async (input: TInput): Promise<TResult> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsPending(true);
    setError(null);
    try {
      const result = await action(input, controller.signal);
      if (!controller.signal.aborted) {
        setData(result);
        await onSuccess?.(result, input);
      }
      return result;
    } catch (value) {
      const nextError = asError(value);
      if (!controller.signal.aborted) setError(nextError);
      throw nextError;
    } finally {
      if (!controller.signal.aborted) setIsPending(false);
    }
  }, [action, onSuccess]);

  return { mutate, data, error, isPending, reset };
}


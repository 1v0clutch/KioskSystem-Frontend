import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSmartPollingOptions {
  interval: number;
  enabled?: boolean;
}

export function useSmartPolling<T>(
  fetcher: () => Promise<T>,
  options: UseSmartPollingOptions
) {
  const { interval, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  const requestSeqRef = useRef(0);

  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (showSpinner: boolean) => {
    if (!mountedRef.current) return;
    const seq = ++requestSeqRef.current;
    if (showSpinner) setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current && seq === requestSeqRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current && seq === requestSeqRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current && seq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(true);

    if (!enabled) return;

    const id = setInterval(() => fetchData(false), interval);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [interval, enabled, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, isLoading, error, refetch };
}

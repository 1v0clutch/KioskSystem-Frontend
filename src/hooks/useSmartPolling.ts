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

  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (showSpinner: boolean) => {
    if (!mountedRef.current) return;
    if (showSpinner) setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (mountedRef.current) {
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

  return { data, isLoading, error, refetch: () => fetchData(true) };
}

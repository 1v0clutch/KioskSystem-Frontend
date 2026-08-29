import { useState, useEffect, useRef } from 'react';

interface UseSSEOptions {
  endpoint: string;
  enabled?: boolean;
}

export function useSSE<T>(
  options: UseSSEOptions,
  onMessage: (data: T) => void
) {
  const { endpoint, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) return;

    const connect = () => {
      try {
        const token = localStorage.getItem('token');
        const url = token ? `${endpoint}?token=${token}` : endpoint;

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          if (mountedRef.current) {
            setIsConnected(true);
            setError(null);
          }
        };

        eventSource.addEventListener('orders', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (mountedRef.current) {
              onMessage(data);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        });

        eventSource.onerror = () => {
          if (mountedRef.current) {
            setIsConnected(false);
            setError(new Error('SSE connection failed'));
          }
          eventSource.close();
        };
      } catch (e) {
        if (mountedRef.current) {
          setError(e as Error);
        }
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [endpoint, enabled, onMessage]);

  return { isConnected, error };
}

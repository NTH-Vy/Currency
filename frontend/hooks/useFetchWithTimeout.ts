import { useCallback } from 'react';

interface FetchWithTimeoutOptions {
  timeout?: number;
}

export function useFetchWithTimeout() {
  const fetchWithTimeout = useCallback(async (
    url: string,
    options: RequestInit & FetchWithTimeoutOptions = {}
  ): Promise<Response> => {
    const { timeout = 30000, ...fetchOptions } = options;
    
    // Create a timeout promise that returns an error response
    const timeoutPromise = new Promise<Response>((resolve) => {
      setTimeout(() => {
        // Return a mock error response instead of throwing
        resolve(new Response(JSON.stringify({ success: false, error: 'timeout', message: `Request timeout after ${timeout}ms` }), {
          status: 408,
          statusText: 'Request Timeout',
          headers: { 'Content-Type': 'application/json' }
        }));
      }, timeout);
    });
    
    // Create the fetch promise
    const fetchPromise = fetch(url, fetchOptions);
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return response;
  }, []);

  return { fetchWithTimeout };
}

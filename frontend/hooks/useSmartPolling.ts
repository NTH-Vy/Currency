import { useEffect, useRef, useCallback } from 'react';

interface SmartPollingOptions {
  enabled: boolean;
  interval: number;
  onPoll: () => void;
  onError?: (error: Error) => void;
  adaptiveInterval?: boolean; // Increase interval on errors
  maxInterval?: number;
}

export function useSmartPolling({
  enabled,
  interval,
  onPoll,
  onError,
  adaptiveInterval = true,
  maxInterval = 30000,
}: SmartPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIntervalRef = useRef(interval);
  const errorCountRef = useRef(0);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    clearPolling();
    
    if (!enabled) return;

    // Execute immediately
    onPoll();

    intervalRef.current = setInterval(() => {
      onPoll();
    }, currentIntervalRef.current);
  }, [enabled, onPoll, clearPolling]);

  const handlePollError = useCallback((error: Error) => {
    errorCountRef.current++;
    onError?.(error);

    if (adaptiveInterval) {
      // Increase interval on errors (exponential backoff)
      const newInterval = Math.min(
        interval * Math.pow(2, errorCountRef.current),
        maxInterval
      );
      currentIntervalRef.current = newInterval;

      // Restart polling with new interval
      if (enabled) {
        clearPolling();
        intervalRef.current = setInterval(() => {
          onPoll();
        }, currentIntervalRef.current);
      }
    }
  }, [interval, adaptiveInterval, maxInterval, enabled, onPoll, onError, clearPolling]);

  const resetErrorCount = useCallback(() => {
    errorCountRef.current = 0;
    currentIntervalRef.current = interval;
  }, [interval]);

  useEffect(() => {
    startPolling();

    return () => {
      clearPolling();
    };
  }, [startPolling, clearPolling]);

  return {
    resetErrorCount,
    handlePollError,
  };
}

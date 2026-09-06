/**
 * @fileoverview Throttle hook — limits callback frequency. @since 0.2.0
 */
import { useCallback, useRef } from 'react';

/** @brief Throttle a callback to at most once per interval. @since 0.2.0 */
export function useThrottle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  const lastRun = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastArgs.current = args;
      if (now - lastRun.current >= limit) {
        lastRun.current = now;
        fn(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(
          () => {
            lastRun.current = Date.now();
            timeoutRef.current = null;
            if (lastArgs.current) {
              fn(...lastArgs.current);
              lastArgs.current = null;
            }
          },
          limit - (now - lastRun.current),
        );
      }
    },
    [fn, limit],
  );

  return throttled as T;
}

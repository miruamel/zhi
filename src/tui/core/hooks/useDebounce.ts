/**
 * @fileoverview Debounce hook — delays value updates. @since 0.2.0
 */
import { useState, useEffect } from 'react';

/** @brief Debounce a value by delay ms. @since 0.2.0 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

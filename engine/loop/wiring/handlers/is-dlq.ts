/**
 * @brief Type guard: true bila hasil withResilience adalah DLQ (gagal definitif).
 * @param {unknown} r - hasil withResilience atau nilai tak terduga.
 * @return {boolean} true bila DLQ.
 * @since 0.1.2
 */
import type { DLQEntry } from '../../../resil';

/** @brief Type guard untuk DLQ. @param {unknown} r @return {boolean} */
export const isDLQ = (r: unknown): r is DLQEntry =>
  typeof r === 'object' && r !== null && 'error' in r;

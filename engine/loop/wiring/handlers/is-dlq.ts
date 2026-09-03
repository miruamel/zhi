/**
 * @brief Type guard: true bila hasil withResilience adalah DLQ (gagal definitif).
 * @param {string | DLQEntry} r - hasil withResilience.
 * @return {boolean} true bila DLQ.
 * @since 0.1.1
 */
import type { DLQEntry } from '../../../resil';

/** @brief Type guard untuk DLQ. @param {string | DLQEntry} r @return {boolean} */
export const isDLQ = (r: string | DLQEntry): r is DLQEntry =>
  typeof r === 'object' && r !== null && 'error' in r;

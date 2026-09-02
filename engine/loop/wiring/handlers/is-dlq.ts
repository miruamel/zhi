/**
 * @brief True bila hasil withResilience adalah DLQ (gagal definitif).
 * @param {unknown} r - hasil withResilience (string | DLQEntry).
 * @return {boolean} true bila DLQ.
 * @since 0.1.1
 */
import type { DLQEntry } from '../../../resil';

/** @brief Type guard untuk DLQ. @param {string | DLQEntry} r @return {boolean} */
export const isDLQ = (r: string | DLQEntry): r is DLQEntry =>
  typeof r === 'object' && r !== null && 'error' in r;

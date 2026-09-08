/**
 * @brief Check if a step result is dead-letter quarantined (boolean).
 * @param {unknown} res - step result to check.
 * @return {boolean} true when quarantined.
 * @since 0.1.10 */
export function isDLQ(res: unknown): boolean {
  if (res === null || res === undefined) return false;
  if (typeof res === 'string') return false;
  if (typeof res !== 'object') return false;
  const r = res as Record<string, unknown>;
  if (r.error === undefined) return false;
  const attempts = typeof r.attempts === 'number' ? r.attempts : 0;
  return attempts >= 3;
}
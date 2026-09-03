/** @brief Pure formatters: time, score, percent, token count, bar. @since 0.1.0 */

/** @brief Format ms as "1m 23s" or "456ms". @param {number} ms @return {string} */
export function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s - m * 60);
  return `${m}m ${rem}s`;
}

/** @brief Format score 0..1 as "0.84" (2 decimals) or "—" if NaN. */
export function formatScore(s: number): string {
  if (!Number.isFinite(s)) return '—';
  return s.toFixed(2);
}

/** @brief Format token count as "1.2k" / "12.4k" / "1.0M". */
export function formatTokens(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** @brief Format percent 0..1 as "84%". */
export function formatPct(s: number): string {
  if (!Number.isFinite(s)) return '—';
  return `${Math.round(s * 100)}%`;
}

/** @brief Build a horizontal bar: "████░░░░ 40%". @param {number} s @param {number} width @return {string} */
export function bar(s: number, width = 12): string {
  if (!Number.isFinite(s)) return '░'.repeat(width);
  const filled = Math.max(0, Math.min(width, Math.round(s * width)));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/** @brief Format a Date as "12:01:23". */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** @brief Truncate string with ellipsis if longer than max. */
export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

/** @brief Pad string to width (right-pad with spaces). */
export function pad(s: string, width: number): string {
  if (s.length >= width) return s;
  return s + ' '.repeat(width - s.length);
}

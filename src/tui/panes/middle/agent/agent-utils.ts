/**
 * @fileoverview Agent pane helpers — level colors, relative time, token formatting.
 * @since 0.1.11
 * @updated 0.1.11 — extracted from agent.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { colors } from '../../../core/colors';
import type { RuntimeLogEntry } from './agent-types';

/** @brief Level → color mapping. @since 0.1.11 */
export const LEVEL_COLOR: Record<string, string> = {
  info: colors.fg,
  warn: colors.warn,
  error: colors.error,
};

/** @brief Format a timestamp as relative string. @since 0.1.11 */
export function formatRelative(ts?: number): string {
  if (!ts) return 'never';
  const diff = Date.now() - ts;
  if (diff < 1000) return 'now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

/** @brief Format token count with K/M suffix. @since 0.1.11 */
export function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/** @brief Extract level from log entry for color lookup. @since 0.1.11 */
export function levelColor(entry: RuntimeLogEntry): string {
  return LEVEL_COLOR[entry.level] ?? colors.fg;
}

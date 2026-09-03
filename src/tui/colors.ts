/** @brief TUI color tokens (match assets/doc-header.svg palette). @since 0.1.0 */
import type { ForegroundColorName } from 'chalk';

export const colors = {
  bg: 'black' as const,
  fg: 'white' as const,
  fgDim: 'gray' as const,
  accent: 'green' as const,
  accentBlue: 'cyan' as const,
  warn: 'yellow' as const,
  error: 'red' as const,
  running: 'yellow' as const,
  done: 'green' as const,
  pending: 'gray' as const,
  failed: 'red' as const,
  scoring: 'magenta' as const,
  forward: 'cyan' as const,
  commit: 'cyan' as const,
  complete: 'greenBright' as const,
} as const satisfies Record<string, ForegroundColorName>;

export type ColorToken = keyof typeof colors;
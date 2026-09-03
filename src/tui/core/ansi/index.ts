/**
 * @brief ANSI escape sequence parser: strip, parse, measure, pad, truncate.
 *
 * Split from ansi.ts (257 SLOC) into:
 *   - pattern.ts  — ANSI_PATTERN, stripAnsi, AnsiStyle, parseAnsi, applySgr, pushSegment
 *   - measure.ts  — measureWidth, isWide
 *   - transform.ts — padVisible, truncateVisible, readEscape
 * @since 0.2.0
 */

export { ANSI_PATTERN, stripAnsi, parseAnsi } from './pattern';
export type { AnsiStyle } from './pattern';
export { measureWidth } from './measure';
export { padVisible, truncateVisible } from './transform';
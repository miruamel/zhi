/**
 * @brief Types, constants, and primitive helpers for the JsonView widget.
 *
 * Split from json-view.tsx (311 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.1.1
 */
import { colors } from '../../../core/style/colors';

/** @brief A single node reference passed to onPathClick. @since 0.1.1 */
export interface JsonPath {
  path: string;
  value: unknown;
  type: string;
}

/** @brief Props for JsonView. @since 0.1.1 */
export interface JsonViewProps {
  data: unknown;
  collapsed?: boolean;
  maxDepth?: number;
  onPathClick?: (node: JsonPath) => void;
}

const INDENT = '  ';

/** @brief Classify a value's JSON type. @since 0.1.1 */
export function typeOf(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'object') return 'object';
  return typeof v;
}

const TYPE_COLOR: Record<string, string> = {
  string: colors.accent,
  number: colors.warn,
  boolean: colors.done,
  null: colors.fgDim,
};

/** @brief Color for a primitive value. @since 0.1.1 */
export function primitiveColor(v: unknown): string {
  return TYPE_COLOR[typeOf(v)] ?? colors.fg;
}

/** @brief Render a primitive value as a string literal. @since 0.1.1 */
export function primitiveLabel(v: unknown): string {
  if (v === null) return 'null';
  if (typeof v === 'string') return `"${v}"`;
  return String(v);
}

export { INDENT };
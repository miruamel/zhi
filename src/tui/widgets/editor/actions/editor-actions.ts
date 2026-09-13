/**
 * @fileoverview Pure cursor and text-edit operations for the rich text editor.
 * @since 0.1.13
 * @package zhi
 */

/** @brief Cursor position. @since 0.1.13 */
export interface Cursor {
  line: number;
  col: number;
}

/** @brief Insert text at cursor, advancing cursor. @since 0.1.13 */
export function insertAt(value: string, cursor: Cursor, text: string): [string, Cursor] {
  const lines = value.split('\n');
  const line = lines[cursor.line] ?? '';
  lines[cursor.line] = line.slice(0, cursor.col) + text + line.slice(cursor.col);
  return [lines.join('\n'), { line: cursor.line, col: cursor.col + text.length }];
}

/** @brief Delete backwards at cursor. @since 0.1.13 */
export function deleteAt(value: string, cursor: Cursor): [string, Cursor] {
  const lines = value.split('\n');
  if (cursor.col === 0) {
    if (cursor.line === 0) return [value, cursor];
    const prev = lines[cursor.line - 1] ?? '';
    const cur = lines[cursor.line] ?? '';
    lines.splice(cursor.line - 1, 2, prev + cur);
    return [lines.join('\n'), { line: cursor.line - 1, col: prev.length }];
  }
  const line = lines[cursor.line] ?? '';
  lines[cursor.line] = line.slice(0, cursor.col - 1) + line.slice(cursor.col);
  return [lines.join('\n'), { line: cursor.line, col: cursor.col - 1 }];
}

/** @brief Move cursor by delta. @since 0.1.13 */
export function moveCursor(value: string, cursor: Cursor, dl: number, dc: number): Cursor {
  const lines = value.split('\n');
  let l = cursor.line + dl;
  let c = cursor.col + dc;
  if (l < 0) {
    l = 0;
    c = 0;
  }
  if (l >= lines.length) {
    l = lines.length - 1;
    c = (lines[l] ?? '').length;
  }
  const max = (lines[l] ?? '').length;
  if (c < 0) c = 0;
  if (c > max) c = max;
  return { line: l, col: c };
}

/**
 * @brief Visible-width measurement: wide-char counting (CJK, emoji, etc.).
 *
 * Split from ansi.ts (257 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.2.0
 */

import { stripAnsi } from './pattern';

/** @brief Visible width of a string (wide chars count as 2, ANSI stripped). @param {string} s @return {number} */
export function measureWidth(s: string): number {
  const stripped = stripAnsi(s);
  let w = 0;
  for (let i = 0; i < stripped.length; i++) {
    const cp = stripped.codePointAt(i);
    if (cp === undefined) continue;
    w += isWide(cp) ? 2 : 1;
    if (cp > 0xffff) i++;
  }
  return w;
}

/** @brief Whether a code point is a wide character (CJK, emoji, etc.). @param {number} cp @return {boolean} */
export function isWide(cp: number): boolean {
  if (cp < 0x1100) return false;
  if (cp === 0xad) return false;
  if (cp < 0x2500) return cp <= 0x115f;
  if (cp < 0x2580) return true;
  if (cp < 0x3000) return cp >= 0x2e80 && cp <= 0x303e;
  if (cp < 0xa000) return cp <= 0xa4cf || cp === 0x303f || cp === 0x3400 || cp === 0x4db5;
  if (cp < 0xac00) return false;
  if (cp < 0xd800) return true;
  if (cp < 0xe000) return false;
  if (cp < 0xf900) return true;
  if (cp < 0xfb00) return false;
  if (cp < 0xfe10) return true;
  if (cp < 0xfe30) return false;
  if (cp < 0xff00) return true;
  if (cp < 0xff60) return false;
  if (cp < 0xffe0) return true;
  return false;
}
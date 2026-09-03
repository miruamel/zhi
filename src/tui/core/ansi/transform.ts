/**
 * @brief Padding and truncation to visible width.
 *
 * Split from ansi.ts (257 SLOC) so each file stays under the 250 SLO ceiling.
 * @since 0.2.0
 */

import { measureWidth, isWide } from './measure';

interface EscapeRead {
  text: string;
  close: string;
  next: number;
}

function readEscape(s: string, start: number): EscapeRead | null {
  if (s[start] !== '\x1b') return null;
  const next = s[start + 1];
  if (next === '[') {
    const m = /^\x1b\[([0-9;]*)([A-Za-z])/.exec(s.slice(start));
    if (!m) return null;
    const final = m[2];
    const seqLen = 2 + m[1].length + 1;
    if (final === 'm') return { text: s.slice(start, start + seqLen), close: '\x1b[0m', next: start + seqLen };
    return { text: s.slice(start, start + seqLen), close: '', next: start + seqLen };
  }
  if (next === ']') {
    const bel = s.indexOf('\x07', start + 2);
    const end = bel < 0 ? s.length : bel + 1;
    return { text: '', close: '', next: end };
  }
  return { text: '', close: '', next: start + 2 };
}

/** @brief Pad a string to a visible width using space-fill. @param {string} s @param {string} width @param {string} [align] @return {string} */
export function padVisible(
  s: string,
  width: string,
  align: 'left' | 'right' | 'center' = 'left',
): string {
  const w = Number(width) || 0;
  const sw = measureWidth(s);
  if (sw >= w) return s;
  const fill = w - sw;
  if (align === 'right') return ' '.repeat(fill) + s;
  if (align === 'center') {
    const l = Math.floor(fill / 2);
    return ' '.repeat(l) + s + ' '.repeat(fill - l);
  }
  return s + ' '.repeat(fill);
}

/**
 * @brief Truncate to visible width (wide chars as 2); ANSI escapes preserved when shorter than cut.
 * @param {string} s
 * @param {number} width
 * @param {string} [ellipsis]
 * @return {string}
 */
export function truncateVisible(
  s: string,
  width: number,
  ellipsis: string = '…',
): string {
  const stripped = s.replace(/\x1b\][^\x07]*\x07|\x1b\[[0-9;]*[A-Za-z]/g, '');
  const strippedW = measureWidth(stripped);
  if (strippedW <= width) return s;

  const ellipsisW = measureWidth(ellipsis);
  const target = Math.max(0, width - ellipsisW);
  let out = '';
  let used = 0;
  let pendingClose = '';
  let i = 0;

  while (i < s.length && used < target) {
    const ch = s[i];
    if (ch === '\x1b') {
      const seq = readEscape(s, i);
      if (!seq) {
        i++;
        continue;
      }
      out += seq.text;
      pendingClose += seq.close;
      i = seq.next;
      continue;
    }
    const cp = s.codePointAt(i);
    if (cp === undefined) break;
    const w = isWide(cp) ? 2 : 1;
    if (used + w > target) break;
    out += String.fromCodePoint(cp);
    used += w;
    i += cp > 0xffff ? 2 : 1;
  }

  if (used < strippedW) out += ellipsis;
  out += pendingClose;
  return out;
}
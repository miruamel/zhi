/**
 * @brief ANSI colorization: map token types to terminal colors, strip escapes for width.
 *
 * Split from syntax.ts (590 SLOC) so each file stays under the 200 SLOC ceiling.
 * @since 0.2.0
 */
import { ANSI_RESET, TOKEN_COLOR } from './tokens';
import { tokenize } from './tokenizer';

/** @brief Convert an ink color name to an ANSI SGR open sequence. */
function ansiOpen(color: string): string {
  if (!color) return '';
  const map: Record<string, number> = {
    black: 30, red: 31, green: 32, yellow: 33,
    blue: 34, magenta: 35, cyan: 36, white: 37, gray: 90,
  };
  const code = map[color] ?? 37;
  return `\x1b[${code}m`;
}

/**
 * @brief Highlight source code into a string with ANSI color escapes.
 * @param code Raw source.
 * @param lang Optional language hint.
 * @return Colored string (with embedded reset codes). Pass-through
 *         safe to feed into Ink/terminal renderers.
 */
export function highlight(code: string, lang?: string): string {
  const tokens = tokenize(code, lang);
  let out = '';
  for (const tok of tokens) {
    const color = TOKEN_COLOR[tok.type];
    if (!color) {
      out += tok.value;
      continue;
    }
    out += ansiOpen(color) + tok.value + ANSI_RESET;
  }
  return out;
}

/**
 * @brief Count the visible (cell) width of a string, stripping ANSI escapes.
 *
 * Counts UTF-16 code units minus ANSI CSI sequences, treating most
 * characters as one cell. Good enough for terminal pane alignment.
 *
 * @param s String possibly containing ANSI escapes.
 * @return Approximate visible width.
 */
export function visibleLength(s: string): number {
  let n = 0;
  let i = 0;
  while (i < s.length) {
    if (s.charCodeAt(i) === 27 && s[i + 1] === '[') {
      // Skip CSI sequence: bytes in 0x30..0x3F, then a final byte in 0x40..0x7E.
      let j = i + 2;
      while (j < s.length && s.charCodeAt(j) <= 0x3f) j++;
      if (j < s.length && s.charCodeAt(j) >= 0x40 && s.charCodeAt(j) <= 0x7e) {
        i = j + 1;
        continue;
      }
      break;
    }
    n++;
    i++;
  }
  return n;
}
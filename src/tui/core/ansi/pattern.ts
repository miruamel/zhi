/**
 * @brief ANSI escape sequence parser: strip, parse SGR into style segments.
 *
 * Split from ansi.ts (257 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.2.0
 */

/**
 * @brief RegExp matching all CSI/SGR sequences plus single-char escapes.
 * Matches CSI (`ESC[...m`) and OSC (`ESC]...BEL`) sequences; the OSC body is
 * preserved-stripped (text inside the OSC is dropped, not the surrounding text).
 */
export const ANSI_PATTERN: RegExp = /\x1b\][^\x07]*\x07|\x1b\[[0-9;]*[A-Za-z]/g;

/** @brief Remove all ANSI escape sequences from a string. @param {string} s @return {string} */
export function stripAnsi(s: string): string {
  return s.replace(ANSI_PATTERN, '');
}

export interface AnsiStyle {
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  color?: string;
}

/**
 * @brief Parse a string with ANSI escapes into styled text segments.
 * Adjacent segments with identical style are merged.
 * @param {string} s
 * @return {Array<{ text: string, style: AnsiStyle }>}
 */
export function parseAnsi(s: string): Array<{ text: string; style: AnsiStyle }> {
  const out: Array<{ text: string; style: AnsiStyle }> = [];
  let style: AnsiStyle = {};
  let i = 0;
  const len = s.length;

  while (i < len) {
    const esc = s.indexOf('\x1b', i);
    if (esc < 0) {
      pushSegment(out, style, s.slice(i));
      break;
    }
    if (esc > i) pushSegment(out, style, s.slice(i, esc));

    const next = s[esc + 1];
    if (next === '[') {
      const m = /^\x1b\[([0-9;]*)([A-Za-z])/.exec(s.slice(esc));
      if (!m) {
        i = esc + 2;
        continue;
      }
      const params = m[1];
      const final = m[2];
      const seqLen = 2 + params.length + 1;
      if (final === 'm') style = applySgr(style, params);
      i = esc + seqLen;
      continue;
    }
    if (next === ']') {
      const bel = s.indexOf('\x07', esc + 2);
      i = bel < 0 ? len : bel + 1;
      continue;
    }
    i = esc + 2;
  }

  return out;
}

/** @brief Apply SGR parameter list to a style object (returns new object). */
function applySgr(prev: AnsiStyle, params: string): AnsiStyle {
  const next: AnsiStyle = { ...prev };
  const codes = (params === '' ? '0' : params).split(';').map((p) => parseInt(p, 10) || 0);
  for (let k = 0; k < codes.length; k++) {
    const c = codes[k];
    if (c === 0) {
      next.bold = undefined;
      next.dim = undefined;
      next.italic = undefined;
      next.color = undefined;
    } else if (c === 1) next.bold = true;
    else if (c === 2) next.dim = true;
    else if (c === 3) next.italic = true;
    else if (c === 22) {
      next.bold = undefined;
      next.dim = undefined;
    } else if (c === 23) next.italic = undefined;
    else if (c === 39) next.color = undefined;
    else if (c >= 30 && c <= 37) next.color = ANSI8[c - 30];
    else if (c >= 90 && c <= 97) next.color = BRIGHT_ANSI8[c - 90];
    else if (c === 38) {
      const mode = codes[k + 1];
      if (mode === 5) {
        const idx = codes[k + 2];
        if (idx !== undefined) next.color = ANSI256[idx];
        k += 2;
      } else if (mode === 2) {
        const r = codes[k + 2];
        const g = codes[k + 3];
        const b = codes[k + 4];
        if (r !== undefined && g !== undefined && b !== undefined) {
          next.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          k += 4;
        }
      }
    }
  }
  return next;
}

function pushSegment(out: Array<{ text: string; style: AnsiStyle }>, style: AnsiStyle, text: string): void {
  if (text.length === 0) return;
  const last = out[out.length - 1];
  if (last && last.style.bold === style.bold && last.style.dim === style.dim && last.style.italic === style.italic && last.style.color === style.color) {
    last.text += text;
  } else {
    out.push({ text, style: { ...style } });
  }
}

const ANSI8 = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;
const BRIGHT_ANSI8 = [
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
] as const;

const ANSI256: string[] = (() => {
  const palette: string[] = [];
  for (let i = 0; i < 16; i++) palette.push(BRIGHT_ANSI8[i] ?? 'white');
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        const h = (n: number) => n.toString(16).padStart(2, '0');
        palette.push(`#${h(r * 51)}${h(g * 51)}${h(b * 51)}`);
      }
    }
  }
  for (let i = 0; i < 24; i++) {
    const v = 8 + i * 10;
    const h = v.toString(16).padStart(2, '0');
    palette.push(`#${h}${h}${h}`);
  }
  return palette;
})();
/** @brief ANSI escape sequence parser: strip, parse, measure, pad, truncate. @since 0.2.0 */

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

function isWide(cp: number): boolean {
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

/** @brief Pad a string to a visible width using space-fill. @param {string} s @param {string} width @param {string} [align] @return {string} */
export function padVisible(s: string, width: string, align: 'left' | 'right' | 'center' = 'left'): string {
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
export function truncateVisible(s: string, width: number, ellipsis: string = '…'): string {
  const stripped = stripAnsi(s);
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
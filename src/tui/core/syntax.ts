/**
 * @brief Lightweight syntax tokenizer + ANSI highlighter for code panes.
 *
 * Supports ts, tsx, js, jsx, json, md, bash, sql. Token types are coarse
 * (keyword / string / number / comment / operator / punctuation /
 * identifier / whitespace / other) which is enough to colorize a TUI pane
 * without pulling in a full parser.
 *
 * @since 0.2.0
 */

const ANSI_RESET = '\x1b[0m';

/** @brief Color palette mapped to token types (ink color names). */
const TOKEN_COLOR: Record<TokenType, string> = {
  keyword: 'magenta',
  string: 'green',
  number: 'yellow',
  comment: 'gray',
  operator: 'cyan',
  punctuation: 'white',
  identifier: 'white',
  whitespace: '',
  other: 'white',
};

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'operator'
  | 'punctuation'
  | 'identifier'
  | 'whitespace'
  | 'other';

/** @brief A single lexical token produced by `tokenize`. */
export interface Token {
  type: TokenType;
  value: string;
}

const TS_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class',
  'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
  'enum', 'export', 'extends', 'false', 'finally', 'for', 'from',
  'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof',
  'interface', 'let', 'new', 'null', 'of', 'private', 'protected',
  'public', 'readonly', 'return', 'set', 'static', 'super', 'switch',
  'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'var',
  'void', 'while', 'with', 'yield', 'satisfies', 'keyof', 'never',
  'unknown', 'any',
]);

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'INDEX',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'AND',
  'OR', 'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'GROUP', 'BY',
  'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CHECK',
  'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'VIEW', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END',
]);

const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done',
  'case', 'esac', 'in', 'function', 'return', 'export', 'local',
  'readonly', 'declare', 'unset', 'source', 'true', 'false',
]);

const OPERATOR_CHARS = new Set([
  '+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~',
  '?', ':',
]);

const PUNCT_CHARS = new Set([
  '{', '}', '(', ')', '[', ']', ',', ';', '.',
]);

/** @brief Languages understood by `tokenize` / `highlight`. */
export type SyntaxLang =
  | 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | 'md' | 'bash' | 'sql';

function normalizeLang(lang?: string): SyntaxLang | null {
  if (!lang) return null;
  const lower = lang.toLowerCase();
  if (lower === 'ts' || lower === 'typescript') return 'ts';
  if (lower === 'tsx') return 'tsx';
  if (lower === 'js' || lower === 'javascript') return 'js';
  if (lower === 'jsx') return 'jsx';
  if (lower === 'json') return 'json';
  if (lower === 'md' || lower === 'markdown') return 'md';
  if (lower === 'bash' || lower === 'sh' || lower === 'shell') return 'bash';
  if (lower === 'sql') return 'sql';
  return null;
}

/**
 * @brief Tokenize source code into typed segments.
 * @param code Raw source.
 * @param lang Optional language hint; falls back to a generic tokenizer.
 * @return Ordered list of tokens preserving source positions.
 */
export function tokenize(code: string, lang?: string): Token[] {
  const norm = normalizeLang(lang);
  if (norm === 'json') return tokenizeJson(code);
  if (norm === 'sql') return tokenizeSql(code);
  if (norm === 'bash') return tokenizeBash(code);
  if (norm === 'md') return tokenizeMarkdown(code);
  if (norm === 'ts' || norm === 'tsx' || norm === 'js' || norm === 'jsx') {
    return tokenizeJsLike(code);
  }
  return tokenizeGeneric(code);
}


function pushWs(tokens: Token[], text: string): void {
  if (text.length === 0) return;
  tokens.push({ type: 'whitespace', value: text });
}

 function readWhile(code: string, i: number, pred: (ch: string) => boolean): { text: string; next: number } {
   let j = i;
   while (j < code.length && pred(code[j]!)) j++;
   return { text: code.slice(i, j), next: j };
 }

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentCont(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function tokenizeJsLike(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i]!;
    const rest = code.slice(i);

    // Line comment
    if (rest.startsWith('//')) {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    // Block comment
    if (rest.startsWith('/*')) {
      const end = code.indexOf('*/', i + 2);
      const stop = end === -1 ? code.length : end + 2;
      tokens.push({ type: 'comment', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    // Strings: ", ', `
    if (ch === '"' || ch === '\'' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length) {
        const c = code[j]!;
        if (c === '\\' && j + 1 < code.length) {
          j += 2;
          continue;
        }
        if (c === quote) {
          j++;
          break;
        }
        if (c === '\n' && quote !== '`') {
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // Whitespace
    if (/\s/.test(ch)) {
      const { text, next } = readWhile(code, i, (c) => /\s/.test(c));
      pushWs(tokens, text);
      i = next;
      continue;
    }

    // Numbers
    if (isDigit(ch)) {
      const { text, next } = readWhile(code, i, (c) =>
        /[0-9.xXa-fA-F_]/.test(c),
      );
      tokens.push({ type: 'number', value: text });
      i = next;
      continue;
    }

    // Identifiers / keywords
    if (isIdentStart(ch)) {
      const { text, next } = readWhile(code, i, isIdentCont);
      const type: TokenType = TS_KEYWORDS.has(text) ? 'keyword' : 'identifier';
      tokens.push({ type, value: text });
      i = next;
      continue;
    }

    // Punctuation
    if (PUNCT_CHARS.has(ch)) {
      tokens.push({ type: 'punctuation', value: ch });
      i++;
      continue;
    }

    // Operators (greedy multi-char)
    if (OPERATOR_CHARS.has(ch)) {
      const { text, next } = readWhile(code, i, (c) => OPERATOR_CHARS.has(c));
      tokens.push({ type: 'operator', value: text });
      i = next;
      continue;
    }

    tokens.push({ type: 'other', value: ch });
    i++;
  }
  return tokens;
}

function tokenizeJson(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i]!;

    if (ch === '"') {
      let j = i + 1;
      while (j < code.length) {
        const c = code[j]!;
        if (c === '\\' && j + 1 < code.length) {
          j += 2;
          continue;
        }
        if (c === '"') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    if (/\s/.test(ch)) {
      const { text, next } = readWhile(code, i, (c) => /\s/.test(c));
      pushWs(tokens, text);
      i = next;
      continue;
    }

    if (isDigit(ch) || (ch === '-' && isDigit(code[i + 1] ?? ''))) {
      const start = ch === '-' ? i + 1 : i;
      const { text, next } = readWhile(code, start, (c) =>
        /[0-9.eE+\-]/.test(c),
      );
      tokens.push({ type: 'number', value: (ch === '-' ? '-' : '') + text });
      i = next;
      continue;
    }

    if (isIdentStart(ch)) {
      const { text, next } = readWhile(code, i, isIdentCont);
      const isLiteral = text === 'true' || text === 'false' || text === 'null';
      tokens.push({
        type: isLiteral ? 'keyword' : 'identifier',
        value: text,
      });
      i = next;
      continue;
    }

    if (PUNCT_CHARS.has(ch)) {
      tokens.push({ type: 'punctuation', value: ch });
      i++;
      continue;
    }

    if (ch === ':') {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    tokens.push({ type: 'other', value: ch });
    i++;
  }
  return tokens;
}

function tokenizeSql(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i]!;
    const rest = code.slice(i);

    if (rest.startsWith('--')) {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    if (rest.startsWith('/*')) {
      const end = code.indexOf('*/', i + 2);
      const stop = end === -1 ? code.length : end + 2;
      tokens.push({ type: 'comment', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    if (ch === '\'' || ch === '"') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\' && j + 1 < code.length) j += 2;
        else j++;
      }
      const stop = j < code.length ? j + 1 : j;
      tokens.push({ type: 'string', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    if (/\s/.test(ch)) {
      const { text, next } = readWhile(code, i, (c) => /\s/.test(c));
      pushWs(tokens, text);
      i = next;
      continue;
    }

    if (isDigit(ch)) {
      const { text, next } = readWhile(code, i, (c) => /[0-9.]/.test(c));
      tokens.push({ type: 'number', value: text });
      i = next;
      continue;
    }

    if (isIdentStart(ch)) {
      const { text, next } = readWhile(code, i, isIdentCont);
      const upper = text.toUpperCase();
      const type: TokenType = SQL_KEYWORDS.has(upper) ? 'keyword' : 'identifier';
      tokens.push({ type, value: text });
      i = next;
      continue;
    }

    if (PUNCT_CHARS.has(ch)) {
      tokens.push({ type: 'punctuation', value: ch });
      i++;
      continue;
    }

    if (OPERATOR_CHARS.has(ch)) {
      const { text, next } = readWhile(code, i, (c) => OPERATOR_CHARS.has(c));
      tokens.push({ type: 'operator', value: text });
      i = next;
      continue;
    }

    tokens.push({ type: 'other', value: ch });
    i++;
  }
  return tokens;
}

function tokenizeBash(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i]!;

    if (ch === '#') {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      tokens.push({ type: 'comment', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    if (ch === '"' || ch === '\'') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\' && j + 1 < code.length) j += 2;
        else j++;
      }
      const stop = j < code.length ? j + 1 : j;
      tokens.push({ type: 'string', value: code.slice(i, stop) });
      i = stop;
      continue;
    }

    if (/\s/.test(ch)) {
      const { text, next } = readWhile(code, i, (c) => /\s/.test(c));
      pushWs(tokens, text);
      i = next;
      continue;
    }

    if (isDigit(ch)) {
      const { text, next } = readWhile(code, i, (c) => /[0-9.]/.test(c));
      tokens.push({ type: 'number', value: text });
      i = next;
      continue;
    }

    if (isIdentStart(ch)) {
      const { text, next } = readWhile(code, i, isIdentCont);
      const type: TokenType = BASH_KEYWORDS.has(text) ? 'keyword' : 'identifier';
      tokens.push({ type, value: text });
      i = next;
      continue;
    }

    if (PUNCT_CHARS.has(ch)) {
      tokens.push({ type: 'punctuation', value: ch });
      i++;
      continue;
    }

    if (OPERATOR_CHARS.has(ch) || ch === '$') {
      const { text, next } = readWhile(code, i, (c) =>
        OPERATOR_CHARS.has(c) || c === '$',
      );
      tokens.push({ type: 'operator', value: text });
      i = next;
      continue;
    }

    tokens.push({ type: 'other', value: ch });
    i++;
  }
  return tokens;
}

function tokenizeMarkdown(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]!;
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      tokens.push({ type: 'keyword', value: heading[1]! });
      pushWs(tokens, ' ');
      tokens.push({ type: 'keyword', value: heading[2]! });
    } else {
      let i = 0;
      while (i < line.length) {
        const ch = line[i]!;
        if (ch === '`') {
          const end = line.indexOf('`', i + 1);
          const stop = end === -1 ? line.length : end + 1;
          tokens.push({ type: 'string', value: line.slice(i, stop) });
          i = stop;
          continue;
        }
        if (ch === '*' || ch === '_') {
          const marker = ch;
          let j = i + 1;
          while (j < line.length && line[j] !== marker) j++;
          const stop = j < line.length ? j + 1 : line.length;
          tokens.push({ type: 'keyword', value: line.slice(i, stop) });
          i = stop;
          continue;
        }
        if (ch === '#') {
          const { text, next } = readWhile(line, i, (c) => c === '#');
          tokens.push({ type: 'other', value: text });
          i = next;
          continue;
        }
        const { text, next } = readWhile(line, i, (c) => c !== '`' && c !== '*' && c !== '_' && c !== '#');
        tokens.push({ type: 'identifier', value: text });
        i = next;
      }
    }
    if (li < lines.length - 1) pushWs(tokens, '\n');
  }
  return tokens;
}

function tokenizeGeneric(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const ch = code[i]!;
    if (/\s/.test(ch)) {
      const { text, next } = readWhile(code, i, (c) => /\s/.test(c));
      pushWs(tokens, text);
      i = next;
      continue;
    }
    if (isIdentStart(ch)) {
      const { text, next } = readWhile(code, i, isIdentCont);
      tokens.push({ type: 'identifier', value: text });
      i = next;
      continue;
    }
    if (isDigit(ch)) {
      const { text, next } = readWhile(code, i, (c) => /[0-9.]/.test(c));
      tokens.push({ type: 'number', value: text });
      i = next;
      continue;
    }
    tokens.push({ type: 'other', value: ch });
    i++;
  }
  return tokens;
}

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
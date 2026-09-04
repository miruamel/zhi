/**
 * @brief JS/TS/JSX/TSX tokenizer.
 *
 * Split from tokenizer.ts (462 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.2.0
 */
import {
  PUNCT_CHARS,
  OPERATOR_CHARS,
  TS_KEYWORDS,
  type Token,
  type TokenType,
} from '../tokens';
import { pushWs, readWhile, isIdentStart, isIdentCont, isDigit } from '../tokenizer';

/** @brief Tokenize JavaScript/TypeScript/JSX/TSX source. */
export function tokenizeJsLike(code: string): Token[] {
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

/** @brief Tokenize JSON source (strings, numbers, literals, punctuation). */
export function tokenizeJson(code: string): Token[] {
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
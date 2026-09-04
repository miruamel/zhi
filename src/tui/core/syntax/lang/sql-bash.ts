/**
 * @brief SQL and Bash tokenizers.
 *
 * Split from tokenizer.ts (462 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.2.0
 */
import {
  PUNCT_CHARS,
  OPERATOR_CHARS,
  SQL_KEYWORDS,
  BASH_KEYWORDS,
  type Token,
  type TokenType,
} from '../tokens';
import { pushWs, readWhile, isIdentStart, isIdentCont, isDigit } from '../tokenizer';

/** @brief Tokenize SQL source. */
export function tokenizeSql(code: string): Token[] {
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

/** @brief Tokenize Bash/shell source. */
export function tokenizeBash(code: string): Token[] {
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
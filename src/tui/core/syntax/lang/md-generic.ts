/**
 * @brief Markdown and generic fallback tokenizers.
 *
 * Split from tokenizer.ts (462 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.2.0
 */
import { type Token } from '../tokens';
import { pushWs, readWhile, isIdentStart, isIdentCont, isDigit } from '../tokenizer';

/** @brief Tokenize Markdown source (headings, inline code, emphasis). */
export function tokenizeMarkdown(code: string): Token[] {
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

/** @brief Tokenize arbitrary source with no language-specific rules. */
export function tokenizeGeneric(code: string): Token[] {
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
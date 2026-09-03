/**
 * @brief Shared tokenizer helpers: normalizeLang, tokenize dispatcher, character predicates.
 *
 * Split from tokenizer.ts (462 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.2.0
 */
import {
  type SyntaxLang,
  type Token,
  type TokenType,
} from './tokens.ts';
import { tokenizeJsLike, tokenizeJson } from './lang/js-json.ts';
import { tokenizeSql, tokenizeBash } from './lang/sql-bash.ts';
import { tokenizeMarkdown, tokenizeGeneric } from './lang/md-generic.ts';

/** @brief Map a free-form language hint to a known SyntaxLang. */
export function normalizeLang(lang?: string): SyntaxLang | null {
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

// Re-exported for test consumers and downstream modules
export { tokenizeJsLike } from './lang/js-json.ts';
export { tokenizeJson } from './lang/js-json.ts';
export { tokenizeSql } from './lang/sql-bash.ts';
export { tokenizeBash } from './lang/sql-bash.ts';
export { tokenizeMarkdown } from './lang/md-generic.ts';
export { tokenizeGeneric } from './lang/md-generic.ts';

/** @brief Push whitespace token if non-empty. */
export function pushWs(tokens: Token[], text: string): void {
  if (text.length === 0) return;
  tokens.push({ type: 'whitespace', value: text });
}

/** @brief Read while predicate holds. */
export function readWhile(code: string, i: number, pred: (ch: string) => boolean): { text: string; next: number } {
  let j = i;
  while (j < code.length && pred(code[j]!)) j++;
  return { text: code.slice(i, j), next: j };
}

/** @brief Whether a character can start an identifier. */
export function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

/** @brief Whether a character can continue an identifier. */
export function isIdentCont(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

/** @brief Whether a character is a digit. */
export function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}
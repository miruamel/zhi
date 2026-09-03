/**
 * @brief Token types, keyword sets, and color palette for the syntax highlighter.
 *
 * Split from syntax.ts (590 SLOC) so each file stays under the 200 SLOC ceiling.
 * @since 0.2.0
 */

/** @brief ANSI reset escape sequence. */
export const ANSI_RESET = '\x1b[0m';

/** @brief Color palette mapped to token types (ink color names). */
export const TOKEN_COLOR: Record<TokenType, string> = {
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

/** @brief Coarse token categories produced by the tokenizer. */
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

/** @brief TypeScript/JavaScript keywords recognized by the JS-like tokenizer. */
export const TS_KEYWORDS = new Set([
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

/** @brief SQL keywords recognized by the SQL tokenizer. */
export const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'INDEX',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'AND',
  'OR', 'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'GROUP', 'BY',
  'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CHECK',
  'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'VIEW', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END',
]);

/** @brief Bash keywords recognized by the bash tokenizer. */
export const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done',
  'case', 'esac', 'in', 'function', 'return', 'export', 'local',
  'readonly', 'declare', 'unset', 'source', 'true', 'false',
]);

/** @brief Characters treated as operators in JS-like and SQL tokenizers. */
export const OPERATOR_CHARS = new Set([
  '+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~',
  '?', ':',
]);

/** @brief Characters treated as punctuation. */
export const PUNCT_CHARS = new Set([
  '{', '}', '(', ')', '[', ']', ',', ';', '.',
]);

/** @brief Languages understood by `tokenize` / `highlight`. */
export type SyntaxLang =
  | 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | 'md' | 'bash' | 'sql';
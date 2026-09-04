/**
 * @brief Barrel for the syntax highlighter: re-exports tokens, tokenizer, highlighter.
 * @since 0.2.0
 */
export type { Token, TokenType, SyntaxLang } from './tokens';
export { normalizeLang, tokenize } from './tokenizer';
export { highlight, visibleLength } from './highlighter';
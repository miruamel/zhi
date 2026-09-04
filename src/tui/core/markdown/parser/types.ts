/** @brief Markdown AST type definitions. @since 0.1.1 */

/** @brief Discriminated union of markdown AST nodes produced by parseMd. @since 0.1.1 */
export type MdNode =
  | { type: "text"; content: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: string; inline: MdNode[] }
  | { type: "bold"; inline: MdNode[] }
  | { type: "italic"; inline: MdNode[] }
  | { type: "code"; content: string }
  | { type: "codeblock"; lang?: string; content: string }
  | { type: "list"; ordered: boolean; items: MdNode[] }
  | { type: "link"; href: string; content: string }
  | { type: "blockquote"; content: string; inline: MdNode[] }
  | { type: "hr" }
  | { type: "paragraph"; inline: MdNode[] };

/** @brief Heading regex captures leading hashes + trailing text. @since 0.1.1 */
export const HEADING_RE = /^(#{1,6})\s+(.*)$/;
/** @brief Fenced code block opener. @since 0.1.1 */
export const FENCE_RE = /^```(\w*)\s*$/;
/** @brief Horizontal rule (---, ***, ___). @since 0.1.1 */
export const HR_RE = /^([-*_])\s*\1\s*\1[-*_\s]*$/;
/** @brief Unordered list bullet. @since 0.1.1 */
export const UL_RE = /^[-*+]\s+(.*)$/;
/** @brief Ordered list item. @since 0.1.1 */
export const OL_RE = /^\d+\.\s+(.*)$/;
/** @brief Blockquote prefix. @since 0.1.1 */
export const QUOTE_RE = /^>\s?(.*)$/;

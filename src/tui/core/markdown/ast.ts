/**
 * @brief Markdown AST types, block/inline parsers, and emphasis helpers.
 *
 * Split from markdown.ts (359 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.1.1
 */

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
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
/** @brief Fenced code block opener. @since 0.1.1 */
const FENCE_RE = /^```(\w*)\s*$/;
/** @brief Horizontal rule (---, ***, ___). @since 0.1.1 */
const HR_RE = /^([-*_])\s*\1\s*\1[-*_\s]*$/;
/** @brief Unordered list bullet. @since 0.1.1 */
const UL_RE = /^[-*+]\s+(.*)$/;
/** @brief Ordered list item. @since 0.1.1 */
const OL_RE = /^\d+\.\s+(.*)$/;
/** @brief Blockquote prefix. @since 0.1.1 */
const QUOTE_RE = /^>\s?(.*)$/;

/**
 * @brief Parse a markdown string into a flat list of block-level MdNodes.
 * @param md Raw markdown source.
 * @return Array of block nodes; inline parsing is applied to each block.
 * @since 0.1.1
 */
export function parseMd(md: string): MdNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i++;
      continue;
    }
    const fence = line.match(FENCE_RE);
    if (fence) {
      const lang = fence[1] || undefined;
      const buf: string[] = [];
      i++;
      while (i < lines.length && !FENCE_RE.test(lines[i] ?? "")) {
        buf.push(lines[i] ?? "");
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "codeblock", lang, content: buf.join("\n") });
      continue;
    }
    const heading = line.match(HEADING_RE);
    if (heading) {
      const hashes = heading[1] ?? "";
      const text = heading[2] ?? "";
      const level = Math.min(6, Math.max(1, hashes.length)) as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({ type: "heading", level, content: text, inline: parseInline(text) });
      i++;
      continue;
    }
    if (HR_RE.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    const quote = line.match(QUOTE_RE);
    if (quote) {
      const buf: string[] = [quote[1] ?? ""];
      i++;
      while (i < lines.length) {
        const next = lines[i] ?? "";
        const qm = next.match(QUOTE_RE);
        if (!qm) break;
        buf.push(qm[1] ?? "");
        i++;
      }
      const text = buf.join(" ");
      blocks.push({ type: "blockquote", content: text, inline: parseInline(text) });
      continue;
    }
    const ul = line.match(UL_RE);
    const ol = line.match(OL_RE);
    if (ul || ol) {
      const ordered = !!ol;
      const re = ordered ? OL_RE : UL_RE;
      const items: MdNode[] = [];
      while (i < lines.length) {
        const cur = lines[i] ?? "";
        const m = cur.match(re);
        if (!m) break;
        items.push({ type: "text", content: m[1] ?? "" });
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const buf: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i] ?? "";
      if (
        next.trim() === "" ||
        HEADING_RE.test(next) ||
        FENCE_RE.test(next) ||
        HR_RE.test(next.trim()) ||
        UL_RE.test(next) ||
        OL_RE.test(next) ||
        QUOTE_RE.test(next)
      ) {
        break;
      }
      buf.push(next);
      i++;
    }
    const text = buf.join(" ");
    blocks.push({ type: "paragraph", inline: parseInline(text) });
  }
  return blocks;
}

/**
 * @brief Parse an inline string (no block constructs) into a list of inline nodes.
 * Order of patterns matters: code spans first (so their content is literal),
 * then links, then bold/italic emphasis.
 * @param src Inline text fragment.
 * @return Inline node list.
 * @since 0.1.1
 */
export function parseInline(src: string): MdNode[] {
  const nodes: MdNode[] = [];
  let i = 0;
  let buf = "";
  const flush = (): void => {
    if (buf.length > 0) {
      nodes.push({ type: "text", content: buf });
      buf = "";
    }
  };
  while (i < src.length) {
    const ch = src[i] ?? "";
    const next = src[i + 1] ?? "";
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i) {
        flush();
        nodes.push({ type: "code", content: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "[" && next !== "" && src.includes("](", i)) {
      const close = src.indexOf("]", i);
      if (close > i && src[close + 1] === "(") {
        const urlEnd = src.indexOf(")", close + 2);
        if (urlEnd > close + 1) {
          const label = src.slice(i + 1, close);
          const href = src.slice(close + 2, urlEnd);
          flush();
          nodes.push({ type: "link", href, content: label });
          i = urlEnd + 1;
          continue;
        }
      }
    }

    if ((ch === "*" || ch === "_") && ch === next) {
      const end = findBoldClose(src, ch, i + 2);
      if (end > i + 1) {
        flush();
        nodes.push({ type: "bold", inline: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (ch === "*" || ch === "_") {
      const end = findItalicClose(src, ch, i + 1);
      if (end > i) {
        flush();
        nodes.push({ type: "italic", inline: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return nodes;
}

/**
 * @brief Find the index of the first `*` of a closing `**` pair.
 * @param src Source text.
 * @param ch Emphasis character (`*` or `_`).
 * @param from Starting search index.
 * @return Index of the first `ch` of the closing pair, or -1 if none.
 * @since 0.1.1
 */
export function findBoldClose(src: string, ch: string, from: number): number {
  let i = from;
  while (i + 1 < src.length) {
    if (src[i] === ch && src[i + 1] === ch) return i;
    i++;
  }
  return -1;
}

/**
 * @brief Find a single closing emphasis marker that isn't part of a double pair.
 * @param src Source text.
 * @param ch Emphasis character (`*` or `_`).
 * @param from Starting search index.
 * @return Closing index, or -1 if none.
 * @since 0.1.1
 */
export function findItalicClose(src: string, ch: string, from: number): number {
  let i = from;
  while (i < src.length) {
    if (src[i] === ch && src[i + 1] !== ch) return i;
    i++;
  }
  return -1;
}
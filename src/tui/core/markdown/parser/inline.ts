/** @brief Inline markdown parser and emphasis-helper functions. @since 0.1.1 */
import type { MdNode } from "./types.ts";

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

/** @brief Block-level markdown parser. @since 0.1.1 */
import { parseInline } from "./inline";
import {
  FENCE_RE,
  HEADING_RE,
  HR_RE,
  OL_RE,
  QUOTE_RE,
  UL_RE,
  type MdNode,
} from "./types";

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

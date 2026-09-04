/** @brief Tests for parseMd (block-level markdown). @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { colors } from "../style/colors";
import { mdToText, parseMd } from "./index.ts";

describe("parseMd blocks", () => {
  test("returns empty array for blank input", () => {
    expect(parseMd("")).toEqual([]);
    expect(parseMd("\n\n\n")).toEqual([]);
  });

  test("parses single paragraph", () => {
    const out = parseMd("hello world");
    expect(out).toHaveLength(1);
    expect(out[0]?.type).toBe("paragraph");
    if (out[0]?.type === "paragraph") {
      expect(mdToText(out[0], colors)).toBe("hello world");
    }
  });

  test("parses headings h1..h6", () => {
    const md = "# one\n## two\n### three\n#### four\n##### five\n###### six";
    const blocks = parseMd(md);
    expect(blocks.map((b) => b.type)).toEqual([
      "heading",
      "heading",
      "heading",
      "heading",
      "heading",
      "heading",
    ]);
    const levels = blocks.map((b) => (b.type === "heading" ? b.level : 0));
    expect(levels).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("parses fenced code block with language", () => {
    const blocks = parseMd("```ts\nconst x = 1;\n```");
    expect(blocks).toHaveLength(1);
    const cb = blocks[0];
    expect(cb?.type).toBe("codeblock");
    if (cb?.type === "codeblock") {
      expect(cb.lang).toBe("ts");
      expect(cb.content).toBe("const x = 1;");
    }
  });

  test("parses fenced code block without language", () => {
    const blocks = parseMd("```\nplain\n```");
    expect(blocks[0]?.type).toBe("codeblock");
    if (blocks[0]?.type === "codeblock") {
      expect(blocks[0].lang).toBeUndefined();
    }
  });

  test("parses horizontal rule", () => {
    const blocks = parseMd("---");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe("hr");
  });

  test("parses blockquote accumulating lines", () => {
    const blocks = parseMd("> line one\n> line two");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe("blockquote");
    if (blocks[0]?.type === "blockquote") {
      expect(mdToText(blocks[0], colors)).toBe("line one line two");
    }
  });

  test("parses unordered list", () => {
    const blocks = parseMd("- one\n- two\n- three");
    expect(blocks).toHaveLength(1);
    const list = blocks[0];
    expect(list?.type).toBe("list");
    if (list?.type === "list") {
      expect(list.ordered).toBe(false);
      const labels = list.items.map((it) => (it.type === "text" ? it.content : ""));
      expect(labels).toEqual(["one", "two", "three"]);
    }
  });

  test("parses ordered list", () => {
    const blocks = parseMd("1. one\n2. two");
    const list = blocks[0];
    expect(list?.type).toBe("list");
    if (list?.type === "list") {
      expect(list.ordered).toBe(true);
    }
  });

  test("joins multi-line paragraphs with a space", () => {
    const blocks = parseMd("line one\nline two\nline three");
    expect(mdToText(blocks[0]!, colors)).toBe("line one line two line three");
  });

  test("stops paragraph at heading boundary", () => {
    const blocks = parseMd("para text\n# heading");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "heading"]);
  });

  test("handles mixed blocks in order", () => {
    const md = "# Title\n\npara\n\n- a\n- b\n\n```\ncode\n```\n";
    const blocks = parseMd(md);
    expect(blocks.map((b) => b.type)).toEqual(["heading", "paragraph", "list", "codeblock"]);
  });
});

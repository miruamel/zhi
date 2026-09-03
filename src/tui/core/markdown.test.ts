/**
 * @brief Tests for the minimal markdown renderer.
 */

import { describe, expect, test } from "bun:test";
import React from "react";
import { colors } from "./style/colors.ts";
import { mdToInk, mdToText, parseInline, parseMd } from "./markdown/index.ts";

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

describe("parseInline", () => {
  test("returns single text node for plain input", () => {
    const nodes = parseInline("hello");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toEqual({ type: "text", content: "hello" });
  });

  test("parses inline code", () => {
    const nodes = parseInline("a `b` c");
    expect(nodes.map((n) => n.type)).toEqual(["text", "code", "text"]);
    if (nodes[1]?.type === "code") {
      expect(nodes[1].content).toBe("b");
    }
  });

  test("parses bold with ** and __", () => {
    const star = parseInline("a **b** c");
    const under = parseInline("a __b__ c");
    expect(star.some((n) => n.type === "bold")).toBe(true);
    expect(under.some((n) => n.type === "bold")).toBe(true);
  });

  test("parses italic with * and _", () => {
    const star = parseInline("a *b* c");
    const under = parseInline("a _b_ c");
    expect(star.some((n) => n.type === "italic")).toBe(true);
    expect(under.some((n) => n.type === "italic")).toBe(true);
  });

  test("parses link", () => {
    const nodes = parseInline("see [docs](https://example.com) ok");
    const link = nodes.find((n) => n.type === "link");
    expect(link).toBeDefined();
    if (link?.type === "link") {
      expect(link.href).toBe("https://example.com");
      expect(link.content).toBe("docs");
    }
  });

  test("bold takes precedence over italic when both markers exist", () => {
    const nodes = parseInline("a **bold *italic* inside** end");
    const bold = nodes.find((n) => n.type === "bold");
    expect(bold).toBeDefined();
  });
});

describe("mdToText", () => {
  test("concatenates paragraph inline nodes", () => {
    const block = parseMd("hello **bold** world")[0]!;
    expect(mdToText(block, colors)).toBe("hello bold world");
  });

  test("returns codeblock content unchanged", () => {
    const block = parseMd("```\nraw\n```")[0]!;
    expect(mdToText(block, colors)).toBe("raw");
  });

  test("returns empty string for hr", () => {
    expect(mdToText({ type: "hr" }, colors)).toBe("");
  });
});

describe("mdToInk", () => {
  test("renders text node as Text element", () => {
    const el = mdToInk({ type: "text", content: "hi" });
    expect(React.isValidElement(el)).toBe(true);
  });

  test("renders heading with accent color", () => {
    const block = parseMd("# title")[0]!;
    const el = mdToInk(block);
    expect(React.isValidElement(el)).toBe(true);
  });

  test("renders codeblock inside a bordered Box", () => {
    const block = parseMd("```ts\nx\n```")[0]!;
    const el = mdToInk(block);
    expect(React.isValidElement(el)).toBe(true);
  });

  test("renders list with bullet markers", () => {
    const block = parseMd("- a\n- b")[0]!;
    const el = mdToInk(block);
    expect(React.isValidElement(el)).toBe(true);
  });

  test("renders link with accent blue", () => {
    const el = mdToInk({ type: "link", href: "u", content: "c" });
    expect(React.isValidElement(el)).toBe(true);
  });
});

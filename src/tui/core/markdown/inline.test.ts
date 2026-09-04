/** @brief Tests for parseInline (inline markdown elements). @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { parseInline } from "./index.ts";

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

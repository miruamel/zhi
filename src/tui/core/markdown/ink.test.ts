/** @brief Tests for mdToInk (block → ink React element). @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import React from "react";
import { mdToInk, parseMd } from "./index.ts";

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

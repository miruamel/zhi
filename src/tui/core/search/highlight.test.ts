/** @brief Tests for highlightMatches. @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { highlightMatches } from "./search.ts";

describe("highlightMatches", () => {
  test("returns whole text as non-match when query is empty", () => {
    const result = highlightMatches("hello", "");
    expect(result).toEqual([{ text: "hello", match: false }]);
  });

  test("returns whole text as non-match when no match", () => {
    const result = highlightMatches("hello", "xyz");
    expect(result).toEqual([{ text: "hello", match: false }]);
  });

  test("marks matching substring as match", () => {
    const result = highlightMatches("hello world", "world");
    expect(result).toEqual([
      { text: "hello ", match: false },
      { text: "world", match: true },
    ]);
  });

  test("handles multiple matches", () => {
    const result = highlightMatches("foo bar foo", "foo");
    expect(result).toEqual([
      { text: "foo", match: true },
      { text: " bar ", match: false },
      { text: "foo", match: true },
    ]);
  });

  test("is case-insensitive", () => {
    const result = highlightMatches("Hello World", "world");
    const matched = result.filter((p) => p.match);
    expect(matched.length).toBe(1);
    expect(matched[0].text).toBe("World");
  });

  test("adjacent matches coalesce into one part", () => {
    const result = highlightMatches("abcabc", "abc");
    expect(result).toEqual([
      { text: "abc", match: true },
      { text: "abc", match: true },
    ]);
  });
});

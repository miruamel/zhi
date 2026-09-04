/** @brief Tests for fuzzyScore and substringScore. @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { fuzzyScore, substringScore } from "./search";

describe("fuzzyScore", () => {
  test("returns 0 when query is empty", () => {
    expect(fuzzyScore("", "anything")).toBe(0);
  });

  test("returns 0 when text is empty and query is not", () => {
    expect(fuzzyScore("a", "")).toBe(0);
  });

  test("returns positive score for exact match", () => {
    expect(fuzzyScore("foo", "foo")).toBeGreaterThan(0);
  });

  test("returns 0 when query chars not present in order", () => {
    expect(fuzzyScore("xyz", "abc")).toBe(0);
  });

  test("scores consecutive matches higher than scattered", () => {
    const consec = fuzzyScore("foo", "foobar");
    const scattered = fuzzyScore("foo", "f_o_o_bar");
    expect(consec).toBeGreaterThan(scattered);
  });

  test("exact prefix match scores high", () => {
    const prefix = fuzzyScore("foo", "foobar baz");
    const middle = fuzzyScore("foo", "bar foo baz");
    expect(prefix).toBeGreaterThan(middle);
  });

  test("is case-insensitive by default", () => {
    const lower = fuzzyScore("foo", "FOOBAR");
    const mixed = fuzzyScore("foo", "Foobar");
    expect(lower).toBe(mixed);
    expect(lower).toBeGreaterThan(0);
  });
});

describe("substringScore", () => {
  test("returns 0 when query is empty", () => {
    expect(substringScore("", "anything")).toBe(0);
  });

  test("returns 0 when no substring match", () => {
    expect(substringScore("xyz", "abcdef")).toBe(0);
  });

  test("scores exact match higher than substring", () => {
    expect(substringScore("foo", "foo")).toBeGreaterThan(substringScore("foo", "barfoo"));
  });

  test("returns positive score for case-insensitive substring match", () => {
    expect(substringScore("FOO", "barfoobar")).toBeGreaterThan(0);
  });

  test("scores prefix match higher than middle match", () => {
    const prefix = substringScore("foo", "foobar");
    const middle = substringScore("bar", "foobar");
    expect(prefix).toBeGreaterThan(middle);
  });

  test("matches prefix higher than suffix", () => {
    const prefix = substringScore("foo", "foobar");
    const suffix = substringScore("bar", "foobar");
    expect(prefix).toBeGreaterThan(suffix);
  });
});

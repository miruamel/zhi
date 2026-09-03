/**
 * @brief Tests for fuzzy/substring search over objects.
 */

import { describe, expect, test } from "bun:test";
import {
  fuzzyScore,
  fuzzyFilter,
  highlightMatches,
  substringScore,
  search,
  type Searchable,
} from "./search.ts";

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

describe("fuzzyFilter", () => {
  const items: Searchable[] = [
    { id: "1", text: "apple pie recipe" },
    { id: "2", text: "banana bread" },
    { id: "3", text: "cherry cobbler" },
    { id: "4", text: "apple sauce" },
  ];

  test("returns empty array when query is empty", () => {
    expect(fuzzyFilter(items, "")).toEqual([]);
  });

  test("filters items by text match", () => {
    const result = fuzzyFilter(items, "apple");
    expect(result.length).toBe(2);
    expect(result.map((r) => r.id).sort()).toEqual(["1", "4"]);
  });

  test("orders results by score, highest first", () => {
    const result = fuzzyFilter(items, "ban");
    expect(result[0].id).toBe("2");
  });

  test("respects custom keys", () => {
    const extended = [
      { id: "a", text: "no match here", title: "Banana" },
      { id: "b", text: "no", title: "Other" },
    ] as Array<Searchable & { title: string }>;
    const result = fuzzyFilter(extended, "banana", ["title"]);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("a");
  });

  test("returns empty when nothing matches", () => {
    expect(fuzzyFilter(items, "zzz")).toEqual([]);
  });
});

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

describe("search", () => {
  const items: Searchable[] = [
    { id: "1", text: "apple pie" },
    { id: "2", text: "banana bread" },
    { id: "3", text: "cherry cobbler apple" },
    { id: "4", text: "apricot jam" },
    { id: "5", text: "blueberry muffin" },
  ];

  test("returns all items when query is empty", () => {
    expect(search(items, "")).toEqual(items);
  });

  test("returns matching items sorted by score", () => {
    const result = search(items, "apple");
    expect(result.length).toBe(2);
    expect(result.map((r) => r.id)).toEqual(["1", "3"]);
  });

  test("applies limit option", () => {
    const result = search(items, "a", { limit: 2 });
    expect(result.length).toBe(2);
  });

  test("applies threshold option to drop weak matches", () => {
    const all = search(items, "a");
    const strong = search(items, "a", { threshold: 200 });
    expect(strong.length).toBeLessThan(all.length);
    expect(strong[0].id).toBeDefined();
  });

  test("uses keys option to search specific fields", () => {
    const extended = [
      { id: "a", text: "no", title: "Banana Bread" },
      { id: "b", text: "no", title: "Apple Pie" },
    ] as Array<Searchable & { title: string }>;
    const result = search(extended, "banana", { keys: ["title"] });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("a");
  });

  test("returns empty array when no matches", () => {
    expect(search(items, "zzznotfound")).toEqual([]);
  });

  test("limit of 0 returns empty", () => {
    expect(search(items, "apple", { limit: 0 })).toEqual([]);
  });

  test("uses default text key when keys omitted", () => {
    const items2 = [
      { id: "a", text: "apple" },
      { id: "b", text: "banana" },
    ];
    const result = search(items2, "apple");
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("a");
  });
});

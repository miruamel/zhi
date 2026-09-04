/** @brief Tests for fuzzyFilter. @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { fuzzyFilter, type Searchable } from "./search";

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

/** @brief Tests for the top-level search() entry point. @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { search, type Searchable } from "./search";

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

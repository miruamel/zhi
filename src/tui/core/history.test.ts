/**
 * @brief Tests for ring-buffer command history.
 */

import { describe, expect, test } from "bun:test";
import { History, createHistory } from "./history.ts";

describe("History", () => {
  test("starts empty with default size", () => {
    const h = new History();
    expect(h.size).toBe(0);
    expect(h.recent()).toEqual([]);
  });

  test("respects custom maxSize", () => {
    const h = new History(2);
    h.push("a");
    h.push("b");
    h.push("c");
    expect(h.size).toBe(2);
    const items = h.recent();
    expect(items.map((e) => e.command)).toEqual(["b", "c"]);
  });

  test("push returns entry with id and ts", () => {
    const h = new History();
    const before = Date.now();
    const e = h.push("ls");
    const after = Date.now();
    expect(typeof e.id).toBe("string");
    expect(e.id.length).toBeGreaterThan(0);
    expect(e.ts).toBeGreaterThanOrEqual(before);
    expect(e.ts).toBeLessThanOrEqual(after);
    expect(e.command).toBe("ls");
  });

  test("push stores result when provided", () => {
    const h = new History();
    const e = h.push("ls", "file.txt");
    expect(e.result).toBe("file.txt");
  });

  test("recent returns latest n entries in chronological order", () => {
    const h = new History(10);
    h.push("a");
    h.push("b");
    h.push("c");
    expect(h.recent(2).map((e) => e.command)).toEqual(["b", "c"]);
    expect(h.recent(10).map((e) => e.command)).toEqual(["a", "b", "c"]);
  });

  test("search finds substring matches (case-insensitive)", () => {
    const h = new History();
    h.push("git status");
    h.push("git log");
    h.push("npm test");
    const matches = h.search("GIT");
    expect(matches.map((e) => e.command)).toEqual(["git status", "git log"]);
  });

  test("search returns empty when no match", () => {
    const h = new History();
    h.push("a");
    expect(h.search("zz")).toEqual([]);
  });

  test("get returns entry by id", () => {
    const h = new History();
    const e = h.push("x");
    expect(h.get(e.id)?.command).toBe("x");
    expect(h.get("missing")).toBeUndefined();
  });

  test("clear empties history", () => {
    const h = new History();
    h.push("a");
    h.push("b");
    h.clear();
    expect(h.size).toBe(0);
    expect(h.recent()).toEqual([]);
  });

  test("toJSON and fromJSON round-trip", () => {
    const h = new History();
    h.push("a", "ok");
    h.push("b");
    const json = h.toJSON();
    const h2 = new History();
    h2.fromJSON(json);
    expect(h2.size).toBe(2);
    expect(h2.recent()[0]?.command).toBe("a");
    expect(h2.recent()[0]?.result).toBe("ok");
  });

  test("fromJSON replaces existing content", () => {
    const h = new History();
    h.push("old");
    h.fromJSON([]);
    expect(h.size).toBe(0);
  });

  test("ring buffer evicts oldest when full", () => {
    const h = new History(3);
    h.push("1");
    h.push("2");
    h.push("3");
    h.push("4");
    h.push("5");
    expect(h.size).toBe(3);
    expect(h.recent().map((e) => e.command)).toEqual(["3", "4", "5"]);
  });

  test("createHistory returns History instance", () => {
    const h = createHistory(5);
    expect(h).toBeInstanceOf(History);
    h.push("x");
    expect(h.size).toBe(1);
  });

  test("each entry id is unique", () => {
    const h = new History();
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(h.push(`c${i}`).id);
    }
    expect(ids.size).toBe(100);
  });
});
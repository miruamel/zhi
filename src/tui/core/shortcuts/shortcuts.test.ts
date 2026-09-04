/**
 * @brief Tests for shortcut binding manager.
 * @since 0.1.2
 */

import { describe, expect, test } from "bun:test";
import {
  ShortcutRegistry,
  comboToId,
  matchShortcut,
  parseShortcut,
} from "./shortcuts";

describe("parseShortcut", () => {
  test("parses single key", () => {
    expect(parseShortcut("q")).toEqual({ key: "q" });
  });

  test("parses ctrl+key", () => {
    expect(parseShortcut("ctrl+c")).toEqual({ ctrl: true, key: "c" });
  });

  test("parses cmd as meta", () => {
    expect(parseShortcut("cmd+k")).toEqual({ meta: true, key: "k" });
  });

  test("parses shift+tab", () => {
    expect(parseShortcut("shift+tab")).toEqual({ shift: true, key: "tab" });
  });

  test("parses multi-modifier combo", () => {
    expect(parseShortcut("ctrl+shift+k")).toEqual({
      ctrl: true,
      shift: true,
      key: "k",
    });
  });

  test("normalizes case", () => {
    expect(parseShortcut("CTRL+C")).toEqual({ ctrl: true, key: "c" });
  });

  test("treats option as alt and command as meta", () => {
    expect(parseShortcut("option+x")).toEqual({ alt: true, key: "x" });
    expect(parseShortcut("command+z")).toEqual({ meta: true, key: "z" });
  });

  test("throws when key is missing", () => {
    expect(() => parseShortcut("ctrl+")).toThrow();
  });
});

describe("comboToId", () => {
  test("renders plain key", () => {
    expect(comboToId({ key: "q" })).toBe("q");
  });

  test("renders modifiers in fixed order", () => {
    expect(comboToId({ meta: true, shift: true, ctrl: true, key: "k" })).toBe(
      "ctrl+shift+meta+k",
    );
  });

  test("lowercases key", () => {
    expect(comboToId({ key: "Tab" })).toBe("tab");
  });
});

describe("matchShortcut", () => {
  test("matches plain key with no modifiers", () => {
    expect(matchShortcut("q", {}, { key: "q" })).toBe(true);
  });

  test("rejects when modifier is missing", () => {
    expect(matchShortcut("c", {}, { ctrl: true, key: "c" })).toBe(false);
  });

  test("rejects when extra modifier present", () => {
    expect(matchShortcut("c", { ctrl: true }, { key: "c" })).toBe(false);
  });

  test("matches case-insensitively", () => {
    expect(matchShortcut("Tab", { shift: true }, { shift: true, key: "tab" })).toBe(true);
  });
});

describe("ShortcutRegistry", () => {
  test("binds and matches a simple key", () => {
    const r = new ShortcutRegistry();
    r.bind("q", "quit");
    expect(r.match("q", {})).toBe("quit");
  });

  test("binds ctrl combo", () => {
    const r = new ShortcutRegistry();
    r.bind("ctrl+c", "abort");
    expect(r.match("c", { ctrl: true })).toBe("abort");
    expect(r.match("c", {})).toBeNull();
  });

  test("accepts KeyCombo object", () => {
    const r = new ShortcutRegistry();
    r.bind({ meta: true, key: "k" }, "palette");
    expect(r.match("k", { meta: true })).toBe("palette");
  });

  test("unbind removes action", () => {
    const r = new ShortcutRegistry();
    r.bind("q", "quit");
    r.unbind("quit");
    expect(r.match("q", {})).toBeNull();
    expect(r.list()).toHaveLength(0);
  });

  test("rebinding replaces prior binding for same action", () => {
    const r = new ShortcutRegistry();
    r.bind("q", "quit", "first");
    r.bind("x", "quit", "second");
    expect(r.match("q", {})).toBeNull();
    expect(r.match("x", {})).toBe("quit");
    expect(r.list()).toHaveLength(1);
  });

  test("list returns combo id, action, and desc", () => {
    const r = new ShortcutRegistry();
    r.bind("ctrl+s", "save", "save file");
    expect(r.list()).toEqual([{ combo: "ctrl+s", action: "save", desc: "save file" }]);
  });

  test("clear empties all bindings", () => {
    const r = new ShortcutRegistry();
    r.bind("q", "quit");
    r.bind("l", "log");
    r.clear();
    expect(r.list()).toHaveLength(0);
  });

  test("returns first match when multiple bindings exist", () => {
    const r = new ShortcutRegistry();
    r.bind("k", "down");
    r.bind({ ctrl: true, key: "k" }, "kill");
    expect(r.match("k", {})).toBe("down");
    expect(r.match("k", { ctrl: true })).toBe("kill");
  });
});

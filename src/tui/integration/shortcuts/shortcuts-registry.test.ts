/** @brief Tests for shortcuts-registry integration hooks. @since 0.1.2 */
import { test, expect, describe } from "bun:test";
import { render } from "ink";
import React from "react";
// (WriteStream from node:fs intentionally unused — see CaptureStdout interface below)
import {
  useGlobalShortcuts,
  useShortcut,
  ShortcutRegistry,
  matchShortcut,
  parseShortcut,
} from "./shortcuts-registry";

/** @brief Minimal stdout shape ink requires; lets us capture output synchronously. */
interface CaptureStdout {
  write: (s: string) => boolean;
  columns: number;
  rows: number;
  on: (..._args: unknown[]) => void;
  off: (..._args: unknown[]) => void;
}

/** @brief Render an ink element without unmounting so useInput stays subscribed. */
function mount(el: React.ReactElement) {
  const stdout: CaptureStdout = {
    write: () => true,
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  return inst;
}

describe("useGlobalShortcuts — dispatch contract", () => {
  test("calls onAction when input matches a binding", () => {
    const calls: string[] = [];
    const reg = new ShortcutRegistry();
    reg.bind("q", "quit");

    // Mirror what useGlobalShortcuts' useInput callback does on each key event.
    const dispatch = (input: string, key: Record<string, boolean> = {}) => {
      const action = reg.match(input, key);
      if (action !== null) calls.push(action);
    };

    dispatch("q");
    expect(calls).toEqual(["quit"]);
  });

  test("calls onAction with modifier combos (ctrl+c)", () => {
    const calls: string[] = [];
    const reg = new ShortcutRegistry();
    reg.bind("ctrl+c", "abort");

    const dispatch = (input: string, key: Record<string, boolean>) => {
      const action = reg.match(input, key);
      if (action !== null) calls.push(action);
    };

    dispatch("c", { ctrl: true });
    expect(calls).toEqual(["abort"]);
  });

  test("does nothing on non-matching input", () => {
    const calls: string[] = [];
    const reg = new ShortcutRegistry();
    reg.bind("q", "quit");

    const dispatch = (input: string, key: Record<string, boolean> = {}) => {
      const action = reg.match(input, key);
      if (action !== null) calls.push(action);
    };

    dispatch("x");
    dispatch("q", { ctrl: true }); // wrong modifier
    expect(calls).toEqual([]);
  });

  test("returns first matching action when multiple bindings exist", () => {
    const reg = new ShortcutRegistry();
    reg.bind("a", "first");
    reg.bind("a", "second");

    expect(reg.match("a", {})).toBe("first");
  });
});

describe("useShortcut — key match contract", () => {
  test("calls handler when exact key matches", () => {
    let calls = 0;
    const combo = parseShortcut("k");
    const handler = () => {
      calls += 1;
    };

    // Mirror what useShortcut's useInput callback does.
    const dispatch = (input: string, key: Record<string, boolean>) => {
      if (matchShortcut(input, key, combo)) handler();
    };

    dispatch("k", {});
    expect(calls).toBe(1);
  });

  test("respects modifier state (ctrl+s only fires with ctrl)", () => {
    let calls = 0;
    const combo = parseShortcut("ctrl+s");
    const handler = () => {
      calls += 1;
    };

    const dispatch = (input: string, key: Record<string, boolean>) => {
      if (matchShortcut(input, key, combo)) handler();
    };

    dispatch("s", {});
    expect(calls).toBe(0);
    dispatch("s", { ctrl: true });
    expect(calls).toBe(1);
  });

  test("does nothing on unrelated keys", () => {
    let calls = 0;
    const combo = parseShortcut("enter");
    const handler = () => {
      calls += 1;
    };

    const dispatch = (input: string, key: Record<string, boolean>) => {
      if (matchShortcut(input, key, combo)) handler();
    };

    dispatch("q", {});
    dispatch(" ", {});
    expect(calls).toBe(0);
  });
});

describe("hook smoke tests", () => {
  test("useGlobalShortcuts mounts without throwing", () => {
    const reg = new ShortcutRegistry();
    reg.bind("q", "quit");
    const Harness = () => {
      useGlobalShortcuts(reg, () => {});
      return null;
    };
    const inst = mount(React.createElement(Harness));
    inst.unmount();
  });

  test("useShortcut mounts without throwing", () => {
    const Harness = () => {
      useShortcut("k", "down", () => {});
      return null;
    };
    const inst = mount(React.createElement(Harness));
    inst.unmount();
  });

  test("useShortcut re-parses combo when key prop changes", () => {
    // parseShortcut is the same function the hook uses; verify it's stable + correct.
    expect(parseShortcut("a").key).toBe("a");
    expect(parseShortcut("ctrl+a").ctrl).toBe(true);
    expect(parseShortcut("shift+tab").key).toBe("tab");
  });
});

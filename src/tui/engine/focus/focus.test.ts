/**
 * @brief Tests for FocusManager + createFocusManager.
 */

import { describe, expect, test } from "bun:test";
import { FocusManager, createFocusManager, type PaneId } from "./focus";

const ORDER: PaneId[] = ["header", "dag", "detail", "metrics"];

describe("FocusManager constructor", () => {
  test("uses order[0] when no initial supplied", () => {
    const fm = new FocusManager(undefined, ORDER);
    expect(fm.focused).toBe("header");
  });

  test("honours explicit initial", () => {
    const fm = new FocusManager("detail", ORDER);
    expect(fm.focused).toBe("detail");
  });


  test("exposes a copy of the order via the getter", () => {
    const fm = new FocusManager(undefined, ORDER);
    const seen = fm.order;
    expect(seen).toEqual(ORDER);
    seen.push("mutated" as PaneId);
    expect(fm.order).toEqual(ORDER);
  });
});

describe("FocusManager.focus", () => {
  test("changes the current pane", () => {
    const fm = new FocusManager("header", ORDER);
    fm.focus("metrics");
    expect(fm.focused).toBe("metrics");
  });

  test("is idempotent on the same id", () => {
    const fm = new FocusManager("dag", ORDER);
    fm.focus("dag");
    expect(fm.focused).toBe("dag");
  });
});

describe("FocusManager.focusNext", () => {
  test("advances to the following pane", () => {
    const fm = new FocusManager("header", ORDER);
    fm.focusNext();
    expect(fm.focused).toBe("dag");
  });

  test("wraps from the last pane back to the first", () => {
    const fm = new FocusManager("metrics", ORDER);
    fm.focusNext();
    expect(fm.focused).toBe("header");
  });

  test("handles a stale current by jumping to order[0]", () => {
    const fm = new FocusManager("header", ORDER);
    (fm as unknown as { current: PaneId }).current = "profile";
    fm.focusNext();
    expect(fm.focused).toBe("header");
  });
});

describe("FocusManager.focusPrev", () => {
  test("moves back one pane", () => {
    const fm = new FocusManager("detail", ORDER);
    fm.focusPrev();
    expect(fm.focused).toBe("dag");
  });

  test("wraps from the first pane to the last", () => {
    const fm = new FocusManager("header", ORDER);
    fm.focusPrev();
    expect(fm.focused).toBe("metrics");
  });

  test("handles a stale current by jumping to order[last]", () => {
    const fm = new FocusManager("header", ORDER);
    (fm as unknown as { current: PaneId }).current = "profile";
    fm.focusPrev();
    expect(fm.focused).toBe("metrics");
  });
});

describe("FocusManager.setOrder", () => {
  test("replaces the traversal order", () => {
    const fm = new FocusManager(undefined, ORDER);
    const newOrder: PaneId[] = ["log", "terminal", "files"];
    fm.setOrder(newOrder);
    expect(fm.order).toEqual(newOrder);
    expect(fm.order).not.toBe(newOrder);
  });

  test("keeps the focused pane when it remains in the new order", () => {
    const fm = new FocusManager("dag", ORDER);
    fm.setOrder(["header", "dag", "metrics"]);
    expect(fm.focused).toBe("dag");
  });

  test("falls back to order[0] when current pane is no longer present", () => {
    const fm = new FocusManager("dag", ORDER);
    fm.setOrder(["log", "terminal"]);
    expect(fm.focused).toBe("log");
  });

  test("setOrder then focusNext follows the new order", () => {
    const fm = new FocusManager("log", ORDER);
    fm.setOrder(["log", "terminal", "files"]);
    fm.focusNext();
    expect(fm.focused).toBe("terminal");
  });
});

describe("FocusManager.reset", () => {
  test("returns focus to the constructor initial", () => {
    const fm = new FocusManager("dag", ORDER);
    fm.focusNext();
    fm.focus("metrics");
    fm.reset();
    expect(fm.focused).toBe("dag");
  });

  test("reset is a no-op when nothing has changed", () => {
    const fm = new FocusManager("header", ORDER);
    fm.reset();
    expect(fm.focused).toBe("header");
  });
});

describe("createFocusManager", () => {
  test("returns a FocusManager instance", () => {
    const fm = createFocusManager("dag", ORDER);
    expect(fm).toBeInstanceOf(FocusManager);
    expect(fm.focused).toBe("dag");
  });

  test("matches constructor behaviour with no arguments", () => {
    const fm = createFocusManager();
    expect(fm).toBeInstanceOf(FocusManager);
    expect(fm.focused).toBe("header");
  });
});
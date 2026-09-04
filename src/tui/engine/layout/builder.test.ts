import { describe, test, expect } from "bun:test";
import {
  DEFAULT_LAYOUT,
  buildDefaultLayout,
  resolveLayout,
  getPaneRow,
  togglePane,
} from "./builder";

describe("DEFAULT_LAYOUT", () => {
  test("contains every pane id", () => {
    const ids = new Set(DEFAULT_LAYOUT.panes.map((p) => p.id));
    for (const id of [
      "header",
      "dag",
      "detail",
      "metrics",
      "critics",
      "timeline",
      "stages",
      "eval",
      "pr",
      "knowledge",
      "code",
      "config",
      "help",
      "log",
      "terminal",
      "agents",
      "files",
      "diff",
      "secrets",
      "notifications",
      "network",
      "resources",
      "gate",
      "audit",
      "queue",
      "profile",
    ] as const) {
      expect(ids.has(id)).toBe(true);
    }
  });

  test("all panes start visible", () => {
    expect(DEFAULT_LAYOUT.panes.every((p) => p.visible)).toBe(true);
  });
});

describe("buildDefaultLayout", () => {
  test("matches DEFAULT_LAYOUT", () => {
    expect(buildDefaultLayout()).toEqual(DEFAULT_LAYOUT);
  });

  test("returns independent instances", () => {
    const a = buildDefaultLayout();
    const b = buildDefaultLayout();
    expect(a).not.toBe(b);
    a.panes[0].visible = false;
    expect(b.panes[0].visible).toBe(true);
  });
});

describe("resolveLayout", () => {
  test("keeps panes in the visible set", () => {
    const config = buildDefaultLayout();
    const visible = new Set(["header", "dag"] as const);
    const resolved = resolveLayout(config, visible);
    expect(resolved.panes.map((p) => p.id).sort()).toEqual(["dag", "header"]);
  });

  test("preserves grid dimensions", () => {
    const resolved = resolveLayout(buildDefaultLayout(), new Set());
    expect(resolved.rows).toBe(DEFAULT_LAYOUT.rows);
    expect(resolved.cols).toBe(DEFAULT_LAYOUT.cols);
  });
});

describe("getPaneRow", () => {
  test("returns row for known pane", () => {
    expect(getPaneRow("header", DEFAULT_LAYOUT)).toBe(0);
    expect(getPaneRow("profile", DEFAULT_LAYOUT)).toBe(8);
  });

  test("returns undefined for missing pane", () => {
    const config = { ...DEFAULT_LAYOUT, panes: [] };
    expect(getPaneRow("dag", config)).toBeUndefined();
  });
});

describe("togglePane", () => {
  test("flips visibility off then on", () => {
    const config = buildDefaultLayout();
    const hidden = togglePane("dag", config);
    expect(hidden.panes.find((p) => p.id === "dag")?.visible).toBe(false);
    const restored = togglePane("dag", hidden);
    expect(restored.panes.find((p) => p.id === "dag")?.visible).toBe(true);
  });

  test("does not mutate input", () => {
    const config = buildDefaultLayout();
    togglePane("dag", config);
    expect(config.panes.find((p) => p.id === "dag")?.visible).toBe(true);
  });

  test("leaves other panes alone", () => {
    const config = buildDefaultLayout();
    const next = togglePane("dag", config);
    expect(next.panes.find((p) => p.id === "header")?.visible).toBe(true);
    expect(next.panes.find((p) => p.id === "metrics")?.visible).toBe(true);
  });
});

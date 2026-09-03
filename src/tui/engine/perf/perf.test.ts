/** @brief Tests for PerfTracker / measure / formatDuration. @since 0.1.1 */
import { test, expect } from "bun:test";
import {
  PerfTracker,
  createPerfTracker,
  measure,
  formatDuration,
  type PerfMark,
} from "./perf";

test("start records an open mark with a timestamp", () => {
  const t = new PerfTracker();
  const m = t.start("render");
  expect(m.name).toBe("render");
  expect(typeof m.start).toBe("number");
  expect(m.end).toBeUndefined();
  expect(m.duration).toBeUndefined();
});

test("end closes the most recent open mark with the same name", () => {
  const t = new PerfTracker();
  t.start("render");
  const closed = t.end("render");
  expect(closed).toBeDefined();
  expect(closed?.end).toBeDefined();
  expect(closed?.duration).toBeGreaterThanOrEqual(0);
});

test("end closes the latest matching mark when several share a name", () => {
  const t = new PerfTracker();
  t.start("loop");
  t.start("loop");
  const closed = t.end("loop");
  expect(closed).toBeDefined();
  // First mark should still be open
  const roots = t.getMarks();
  expect(roots.length).toBe(1);
  expect(roots[0]?.end).toBeUndefined();
});

test("end returns undefined when no matching open mark exists", () => {
  const t = new PerfTracker();
  t.start("a");
  expect(t.end("b")).toBeUndefined();
  // Original mark untouched
  t.end("a");
});

test("nested start pushes onto the active parent", () => {
  const t = new PerfTracker();
  const outer = t.start("outer");
  const inner = t.start("inner");
  expect(outer.children).toBeDefined();
  expect(outer.children?.length).toBe(1);
  expect(outer.children?.[0]).toBe(inner);
  expect(inner.children).toBeUndefined();
  t.end("inner");
  t.end("outer");
});

test("getRoot returns only closed root marks", () => {
  const t = new PerfTracker();
  t.start("open");
  t.start("closed");
  t.end("closed");
  const roots = t.getRoot();
  expect(roots.length).toBe(1);
  expect(roots[0]?.name).toBe("closed");
});

test("summary totals closed marks including nested", () => {
  const t = new PerfTracker();
  t.start("root");
  t.start("child");
  t.end("child");
  t.end("root");
  const s = t.summary();
  expect(s.count).toBe(2);
  expect(s.total).toBeGreaterThanOrEqual(0);
  expect(s.slowest).toBeDefined();
});

test("summary skips marks that are still open", () => {
  const t = new PerfTracker();
  t.start("open");
  t.start("closed");
  t.end("closed");
  const s = t.summary();
  expect(s.count).toBe(1);
});

test("summary returns zeros on empty tracker", () => {
  const t = new PerfTracker();
  const s = t.summary();
  expect(s.total).toBe(0);
  expect(s.count).toBe(0);
  expect(s.slowest).toBeUndefined();
});

test("clear resets marks and stack", () => {
  const t = new PerfTracker();
  t.start("a");
  t.start("b");
  t.end("b");
  t.clear();
  expect(t.getMarks().length).toBe(0);
  expect(t.getRoot().length).toBe(0);
  expect(t.summary().count).toBe(0);
  // Tracker remains usable after clear
  t.start("after");
  t.end("after");
  expect(t.getRoot().length).toBe(1);
});

test("createPerfTracker returns a fresh PerfTracker", () => {
  const a = createPerfTracker();
  const b = createPerfTracker();
  expect(a).toBeInstanceOf(PerfTracker);
  expect(a).not.toBe(b);
});

test("measure wraps a function and records the mark", () => {
  const t = new PerfTracker();
  const value = measure(t, "work", () => 42);
  expect(value).toBe(42);
  const roots = t.getRoot();
  expect(roots.length).toBe(1);
  expect(roots[0]?.name).toBe("work");
  expect(roots[0]?.duration).toBeGreaterThanOrEqual(0);
});

test("measure closes the mark even when the function throws", () => {
  const t = new PerfTracker();
  expect(() =>
    measure(t, "boom", () => {
      throw new Error("nope");
    }),
  ).toThrow("nope");
  const roots = t.getRoot();
  expect(roots.length).toBe(1);
  expect(roots[0]?.end).toBeDefined();
});

test("formatDuration renders sub-millisecond values as microseconds", () => {
  expect(formatDuration(0.5)).toBe("500µs");
  expect(formatDuration(0)).toBe("0µs");
});

test("formatDuration renders millisecond values with one decimal", () => {
  expect(formatDuration(1)).toMatch(/ms$/);
  expect(formatDuration(12.34)).toMatch(/ms$/);
});

test("formatDuration renders second values with two decimals", () => {
  expect(formatDuration(1500)).toBe("1.50s");
  expect(formatDuration(59_999)).toBe("60.00s");
});

test("formatDuration renders minute+second values", () => {
  expect(formatDuration(60_000)).toBe("1m0s");
  expect(formatDuration(125_000)).toBe("2m5s");
});

test("formatDuration falls back to 0ms for non-finite or negative input", () => {
  expect(formatDuration(-1)).toBe("0ms");
  expect(formatDuration(Number.NaN)).toBe("0ms");
  expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("0ms");
});
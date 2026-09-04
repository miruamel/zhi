/**
 * @brief Tests for the state bridge. @since 0.1.2
 */
import { describe, expect, test } from "bun:test";
import { createBridge, StateBridge } from "./state-bridge";
import type { AppState } from "../../core/state";
import { PerfTracker } from "../../engine/perf";

describe("StateBridge", () => {
  test("push updates metrics and forwards to setState", () => {
    let captured: Partial<AppState> | undefined;
    const bridge = createBridge((p) => {
      captured = p;
    }, new PerfTracker());

    bridge.push({ focusedPane: "terminal" });

    const m = bridge.getMetrics();
    expect(m.pushes).toBe(1);
    expect(m.batches).toBe(0);
    expect(m.lastPush).toBeGreaterThan(0);
    expect(captured).toEqual({ focusedPane: "terminal" });
  });

  test("pushBatch counts batches and merges partials", () => {
    const calls: Partial<AppState>[] = [];
    const bridge = new StateBridge((p) => {
      calls.push(p);
    }, new PerfTracker());

    bridge.pushBatch([{ focusedPane: "files" }, { status: "running" }]);

    expect(calls.length).toBe(1);
    expect(calls[0]).toEqual({ focusedPane: "files", status: "running" });
    const m = bridge.getMetrics();
    expect(m.batches).toBe(1);
    expect(m.pushes).toBe(2);
  });

  test("pushBatch with empty array is a no-op", () => {
    let calls = 0;
    const bridge = new StateBridge(() => {
      calls++;
    }, new PerfTracker());

    bridge.pushBatch([]);
    bridge.pushBatch([]);

    expect(calls).toBe(0);
    expect(bridge.getMetrics().batches).toBe(0);
    expect(bridge.getMetrics().pushes).toBe(0);
  });

  test("pushWithPerf records a closed perf mark around the push", () => {
    const perf = new PerfTracker();
    const bridge = new StateBridge(() => {}, perf);

    bridge.pushWithPerf("loop.tick", { running: true });

    const roots = perf.getRoot();
    expect(roots.length).toBe(1);
    expect(roots[0]!.name).toBe("loop.tick");
    expect(roots[0]!.end).toBeDefined();
    expect(roots[0]!.duration).toBeDefined();
    expect(bridge.getMetrics().pushes).toBe(1);
  });

  test("getMetrics returns current counters and a snapshot copy", () => {
    const bridge = new StateBridge(() => {}, new PerfTracker());
    bridge.push({ focusedPane: "files" });
    bridge.push({ focusedPane: "queue" });

    const m = bridge.getMetrics();
    expect(m.pushes).toBe(2);
    expect(m.batches).toBe(0);
    // Mutating the returned object must not affect internal state.
    m.pushes = 999;
    expect(bridge.getMetrics().pushes).toBe(2);
  });

  test("reset clears counters", () => {
    const bridge = new StateBridge(() => {}, new PerfTracker());
    bridge.push({ focusedPane: "files" });
    bridge.pushBatch([{ focusedPane: "queue" }]);
    expect(bridge.getMetrics().pushes).toBeGreaterThan(0);

    bridge.reset();

    const m = bridge.getMetrics();
    expect(m.pushes).toBe(0);
    expect(m.batches).toBe(0);
    expect(m.lastPush).toBe(0);
  });
});
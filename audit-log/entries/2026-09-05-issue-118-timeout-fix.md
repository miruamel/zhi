# 2026-09-05-issue-118-timeout-fix.md

## Issue #118 — per-step timeout on LoopDriver, git adapter, and cloud invoker

**Commit**: `5b293a8` (on `origin/main`).
**Verification**: `bun test` → 372 pass / 0 fail / 744 expect() across 73 files.

### Root cause

`LoopDriver.run()` iterated states with a step counter but no wall-clock timeout. The `maxSteps=64` budget guard only counted state transitions, not elapsed time. Two handlers had unbounded blocking I/O:

1. `fetch()` in `engine/model/invoker/cloud.ts` (lines 56, 81) — no `AbortSignal`.
2. `spawnSync` in `engine/loop/wiring/git.ts` — no `timeout` option.

A single hung handler blocked the entire loop forever.

### Fix

Per-step timeout added at three points:

- **`engine/loop/driver.ts`**: `stepTimeoutMs?: number` on `LoopDriverOptions` (default 30000, 0 = disabled). `run()` wraps each handler call in `withTimeout<T>` using `Promise.race` + `setTimeout`, clears timer in `finally`, swallows losing-promise rejection via `p.catch(() => {})`. Handler result wrapped in `Promise.resolve(h(this.state))` to guarantee a Promise.
- **`engine/loop/wiring/git.ts`**: `DEFAULT_TIMEOUT_MS = 30000`, `run()` accepts `timeoutMs`, passes `timeout:` to `spawnSync`, checks `r.error` for spawn-level failures.
- **`engine/model/invoker/cloud.ts`**: `DEFAULT_TIMEOUT_MS = 30000`, `timeoutMs?: number` on `CloudInvokerOpts`, helper `signalOrUndefined(ms)` using `AbortSignal.timeout(ms)`, passes `signal:` to both `fetch()` calls in `invoke()` and `stream()`.

### Tests added

`engine/loop/driver.test.ts`: `run() throws on step timeout` (never-resolving promise, 50ms timeout → `/step timeout/`) and `run() with stepTimeoutMs=0 disables timeout` (3 microtask-resolving handlers, maxSteps=2 → `/budget exceeded/`). Loop tests: 40 pass / 0 fail (was 38).

### Issue #115 — dependency drift assessment

**Decision**: DEFER to a dedicated PR. No security driver (Dependabot: 0 open alerts on ink/react). No functional driver — TUI is a thin wrapper over stable `Box`/`Text`/`useApp`/`useInput`/`render` API. Two coupled major bumps (react 18→19, then ink 4→7) require separate test passes; ink 6+ requires React >=19 as peer dep. Repo is experimental at 0.1.4.

Ink API surface used: `Box`, `Text`, `useApp`, `useInput`, `render` — all stable across ink 4→7. No `key.delete` usage (the one ink-7 breaking change; zhi's keymap only uses `ctrl+c`). React API surface: `useState`, `useEffect`, `type ReactNode` — all stable across React 18→19. No `ReactDOM.render`, string refs, or `propTypes`/`defaultProps` (all removed in React 19).

Migration checklist documented in issue comment. Issue #115 remains open (debt, triaged).
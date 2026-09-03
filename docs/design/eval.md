# design/eval.md — Evaluator Toolchain

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

## Purpose

Verify results through a **real toolchain** (build, test, scan) — a code-grounded gate, not model judgment. Runs in the `EVALUATE` state, after `CRITIQUE`. This is what separates Zhi from a chat wrapper: the commit-readiness decision is backed by tool facts, not vibes.

## Components

- `index.ts` (Pipeline Orchestrator): `evaluate(worktree)` stitches test + security → `gate` → `EvalOutput`.
- `test.ts` (Unit/Integration): `runTests(worktree)` runs `bun test` in the worktree (regression gate).
- `security.ts` (Secret Detection): `scanSecrets(worktree)` greps for secret patterns (fail-closed when grep errors).
- `gate.ts` (Quality Gate): `gate(input, threshold)` — passes when no blockers AND score >= threshold.
- `sandbox` = an isolated git worktree (`loop/wiring/git.ts` `gitIsolate`), not a separate module.

## Interface

```ts
/** @brief Run the evaluation toolchain: test + secret-scan -> gate.
 * @param {string} worktree - isolated worktree path.
 * @return {EvalOutput} passed + reasons (blocker when test fails or a secret leaks).
 * @throw {never} failures are returned as status, not thrown.
 * @since 0.1.0 */
export function evaluate(worktree: string): EvalOutput;
```

## Flow

1. `sandbox` (git worktree via `gitIsolate`) isolates execution.
2. `test` → `bun test` in the worktree.
3. `security` → secret scan.
4. `gate` → quality gate (no blockers + score >= threshold).
5. `index` combines → `EvalOutput.passed`.

## Gate (v1)

`gatePass = paretoScore >= threshold ∧ qualityGateGreen` in `loop/states.ts`. `qualityGateGreen = eval.passed` (no blockers: test green + secrets clean).

## Edge cases

- Test fails → `eval.passed=false` → loop `RECOVER`.
- Secret detected → hard auto-fail (blocker).
- grep errors → fail-closed (blocker).

## v1

Concrete: `evaluate(worktree)` = `runTests` (bun test in the worktree) + `scanSecrets` (grep secrets, fail-closed) → `gate`. Sandbox = git worktree (`gitIsolate`), not a container. The loop calls it via `LoopDeps.eval?` in the `EVALUATE` state; when `ctx.worktree` is present, the result becomes `qualityGateGreen` in `gatePass`.

## Cross-link

`ARCHITECTURE.md` §3; `design/critic.md`; `design/loop.md`; `design/resil.md`.

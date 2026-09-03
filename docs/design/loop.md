# design/loop.md — Autonomous Conductor

## Purpose

`engine/loop/` is the **conductor**: a state machine that stitches `orch → build → critic → eval → resil → knowledge → model` into a single autonomous cycle. It does not make domain decisions; it only governs state transitions and calls other modules through dependency injection.

## State machine

States: `INTAKE | PLAN | ISOLATE | EXECUTE | CRITIQUE | EVALUATE | RECOVER | COMMIT | PR_OPEN | CI_WATCH | DONE`.

Transitions (see `ARCHITECTURE.md` §7):

- `INTAKE → PLAN`
- `PLAN → ISOLATE`
- `ISOLATE → EXECUTE`
- `EXECUTE → CRITIQUE`
- `CRITIQUE → EVALUATE`
- `EVALUATE → COMMIT` (when `gatePass`) | `EVALUATE → RECOVER` (when fail)
- `RECOVER → EXECUTE` (bounded retry)
- `COMMIT → PR_OPEN`
- `PR_OPEN → CI_WATCH`
- `CI_WATCH → RECOVER` (CI red, bounded) | `CI_WATCH → DONE` (CI green)
- budget exhausted anywhere → `RECOVER` → `DONE(PARTIAL)` + report

## Interface

```ts
/** @brief Build per-state loop handlers via dependency injection.
 * @param {LoopContext} ctx - mutable loop context (goal/plan/code/...).
 * @param {LoopDeps} deps - adapters: plan/generate/critique/compress required;
 *        isolate?/commit?/prOpen?/ciWatch? optional (real git/gh when ZHI_AUTO_PR=1).
 * @return {Record<LoopState, Handler>} handler map per state.
 * @see docs/design/orch.md docs/design/critic.md
 * @since 0.1.0 */
export function buildHandlers(ctx: LoopContext, deps: LoopDeps): Record<LoopState, Handler>;

/** @brief Run the state machine until DONE or budget exhausted.
 * @param {Record<LoopState, Handler>} handlers - result of buildHandlers.
 * @param {number} [budget=100] - max transitions before throwing 'loop: budget exceeded'.
 * @return {Promise<void>} mutates ctx to the final status.
 * @since 0.1.0 */
export class LoopDriver {
  get current(): LoopState;
  async run(handlers: Record<LoopState, Handler>, budget?: number): Promise<void>;
}

/** @brief Gate before COMMIT: critic Pareto >= threshold (eval quality-gate follows).
 * @param {LoopState} state
 * @return {boolean} commit-ready.
 * @since 0.1.0 */
export function gatePass(state: LoopState): boolean;
```

## Files

- `driver.ts` — `LoopDriver` runner (state transitions + budget guard).
- `states.ts` — `LoopState` enum + `transitions` map + `gatePass`.
- `wiring/handlers.ts` — `buildHandlers(ctx, deps)` stitches per-state handlers via `LoopDeps`.
- `wiring/context.ts` — `LoopContext` (goal/plan/code/critiques/aggregate/eval/branch/prUrl/error/budgetUsed).
- `wiring/git.ts` — deterministic adapter `gitIsolate`/`ghPrOpen`/`ghCiWatch` (git/gh CLI).

## Edge cases

- Ambiguous goal → `PLAN` fails → `RECOVER` → (if unresolvable) `DONE(PARTIAL)` + report.
- Budget exhausted at `EXECUTE` → `RECOVER` → `DONE(PARTIAL)`.
- `generate` throws at `EXECUTE` → `withResilience` retry (max 3) + `CircuitBreaker` → DLQ → `BUDGET_OUT` → `RECOVER` (bounded, no infinite spin; aligns with `resil/retry.ts` + `resil/breaker.ts`) (@zhi)
- CI red after PR → back to `EXECUTE` with error context (bounded retry via `resil/retry.ts`).
- Branch conflict → re-isolate on a new branch (`wiring/git.ts`).

## v1

Concrete: state machine + `wiring/handlers.ts` + `gatePass` + recover wiring. Inter-step parallelism is later (`orch/scheduler.ts` is ready, the loop runs **serial** first).

## Cross-link

`ARCHITECTURE.md` §3, §7; `design/orch.md`, `design/build.md`, `design/critic.md`, `design/eval.md`, `design/resil.md`, `design/knowledge.md`, `design/model.md`.

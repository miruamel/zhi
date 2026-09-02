# design/loop.md — Autonomous Conductor

## Tujuan

`engine/loop/` adalah **conductor**: state machine yang menjahit `orch → build → critic → eval → resil → knowledge → model` menjadi satu siklus otonom. Tidak mengambil keputusan domain; hanya mengatur transisi state dan memanggil modul lain lewat dependency injection.

## State machine

States: `INTAKE | PLAN | ISOLATE | EXECUTE | CRITIQUE | EVALUATE | RECOVER | COMMIT | PR_OPEN | CI_WATCH | DONE`.

Transisi (lihat `ARCHITECTURE.md` §7):

- `INTAKE → PLAN`
- `PLAN → ISOLATE`
- `ISOLATE → EXECUTE`
- `EXECUTE → CRITIQUE`
- `CRITIQUE → EVALUATE`
- `EVALUATE → COMMIT` (bila `gatePass`) | `EVALUATE → RECOVER` (bila gagal)
- `RECOVER → EXECUTE` (bounded retry)
- `COMMIT → PR_OPEN`
- `PR_OPEN → CI_WATCH`
- `CI_WATCH → RECOVER` (CI merah, bounded) | `CI_WATCH → DONE` (CI hijau)
- budget habis di mana pun → `RECOVER` → `DONE(PARTIAL)` + laporan

## Interface

```ts
/** @brief Bangun handler loop per state via dependency injection.
 * @param {LoopContext} ctx - konteks mutable loop (goal/plan/code/...).
 * @param {LoopDeps} deps - adapter: plan/generate/critique/compress wajib;
 *        isolate?/commit?/prOpen?/ciWatch? opsional (git/gh nyata bila ZHI_AUTO_PR=1).
 * @return {Record<LoopState, Handler>} map handler per state.
 * @see docs/design/orch.md docs/design/critic.md
 * @since 0.1.0 */
export function buildHandlers(ctx: LoopContext, deps: LoopDeps): Record<LoopState, Handler>;

/** @brief Runner state machine; jalankan sampai DONE atau budget habis.
 * @param {Record<LoopState, Handler>} handlers - hasil buildHandlers.
 * @param {number} [budget=100] - max transisi sebelum throw 'loop: budget exceeded'.
 * @return {Promise<void>} mutasi ctx ke status akhir.
 * @since 0.1.0 */
export class LoopDriver {
  get current(): LoopState;
  async run(handlers: Record<LoopState, Handler>, budget?: number): Promise<void>;
}

/** @brief Gate sebelum COMMIT: critic Pareto >= threshold (eval quality-gate menyusul).
 * @param {LoopState} state
 * @return {boolean} layak commit.
 * @since 0.1.0 */
export function gatePass(state: LoopState): boolean;
```

## Files

- `driver.ts` — `LoopDriver` runner state machine (transisi + budget guard).
- `states.ts` — `LoopState` enum + `transitions` map + `gatePass`.
- `wiring/handlers.ts` — `buildHandlers(ctx, deps)` menjahit handler per state via `LoopDeps`.
- `wiring/context.ts` — `LoopContext` (goal/plan/code/critiques/aggregate/eval/branch/prUrl/error/budgetUsed).
- `wiring/git.ts` — adapter deterministik `gitIsolate`/`ghPrOpen`/`ghCiWatch` (git/gh CLI).

## Edge cases

- Goal ambigu → `PLAN` gagal → `RECOVER` → (bila tidak bisa) `DONE(PARTIAL)` + laporan.
- Budget habis di `EXECUTE` → `RECOVER` → `DONE(PARTIAL)`.
- `generate` gagal (throw) di `EXECUTE` → `withResilience` retry (max 3) + `CircuitBreaker` → DLQ → `BUDGET_OUT` → `RECOVER` (bounded, no infinite spin; selaras `resil/retry.ts` + `resil/breaker.ts`) (@zhi)
- CI merah setelah PR → balik `EXECUTE` dengan error context (bounded retry via `resil/retry.ts`).
- Branch conflict → ISOLATE ulang di branch baru (`wiring/git.ts`).

## v1

Konkret: state machine + `wiring/handlers.ts` + `gatePass` + recover wiring. Paralel antar-step belakangan (`orch/scheduler.ts` sudah siap, loop jalan **serial** dulu).

## Cross-link

`ARCHITECTURE.md` §3, §7; `design/orch.md`, `design/build.md`, `design/critic.md`, `design/eval.md`, `design/resil.md`, `design/knowledge.md`, `design/model.md`.

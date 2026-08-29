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
- `CI_WATCH → EXECUTE` (CI merah, dengan error context) | `CI_WATCH → DONE` (CI hijau)
- budget habis di mana pun → `RECOVER` → `DONE(PARTIAL)` + laporan

## Interface

```ts
/** @brief Jalankan loop otonom sampai goal terpenuhi atau budget habis.
 * @param {Goal} goal - teks + flag (repo, base, budget).
 * @param {LoopCtx} ctx - dependency injection semua modul.
 * @return {LoopReport} status akhir + langkah + skor.
 * @throw {never} kegagalan ditangani via RESIL, tidak lempar ke caller.
 * @see docs/design/orch.md docs/design/critic.md
 * @since 0.1.0 */
export async function runLoop(goal: Goal, ctx: LoopCtx): Promise<LoopReport>

/** @brief Gate sebelum COMMIT: critic Pareto >= threshold DAN eval quality-gate hijau.
 * @param {LoopState} state
 * @return {boolean} layak commit.
 * @since 0.1.0 */
export function gatePass(state: LoopState): boolean
```

## Files

- `index.ts` — `runLoop` + types `Goal`, `LoopCtx`, `LoopReport`.
- `states.ts` — `LoopState` enum + `transitions` map + `gatePass`.
- `pipeline.ts` — wiring pemanggilan modul per state (memanggil `orch`, `build`, `critic`, `eval`, `resil`, `knowledge`, `model`, `tools/git`).

## Edge cases

- Goal ambigu → `PLAN` gagal → `RECOVER` → (bila tidak bisa) `DONE(PARTIAL)` + laporan.
- Budget habis di `EXECUTE` → `RECOVER` → `DONE(PARTIAL)`.
- CI merah setelah PR → balik `EXECUTE` dengan error context (bounded retry via `resil/retry.ts`).
- Worktree conflict → `ISOLATE` ulang di branch baru (`knowledge/git.ts`).

## v1

Konkret: state machine + `pipeline.ts` + `gatePass` + recover wiring. Paralel antar-step belakangan (`orch/scheduler.ts` sudah siap, loop jalan **serial** dulu).

## Cross-link

`ARCHITECTURE.md` §3, §7; `design/orch.md`, `design/build.md`, `design/critic.md`, `design/eval.md`, `design/resil.md`, `design/knowledge.md`, `design/model.md`.

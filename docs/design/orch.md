# design/orch.md — Planner + Scheduler

## Tujuan

Ubah goal berbahasa alami menjadi **DAG step** yang bebas siklus, terurut, dan ber-budget. Jantung perencanaan Zhi. Dihitung sekali di state `PLAN`, lalu dikonsumsi `loop/wiring/handlers.ts`.

## Komponen

- `parse.ts` (Task Parser): tokenisasi goal → `Intent` + constraints.
- `dag.ts` (DAG Builder + Cycle Detector + Dependency Resolver): bangun node step, edge dependensi, deteksi siklus, resolusi urutan topologis.
- `budget.ts` (Priority Queue + Budget/Token Allocator): antrian prioritas + alokasi token per step.
- `scheduler.ts` (Resource Scheduler + Conflict Resolver + Parallel Scheduler): urutkan eksekusi (serial v1).

## Interface

```ts
/** @brief Parse goal jadi intent + constraints.
 * @param {string} goal - teks goal.
 * @return {Intent} intent terstruktur.
 * @since 0.1.0 */
export function parseGoal(goal: string): Intent;

/** @brief Bangun DAG step dari intent, cek siklus.
 * @param {Intent} intent
 * @return {Dag} node + edge, topologically sorted.
 * @throw {CycleError} bila siklus tak terpecahkan.
 * @since 0.1.0 */
export function buildDag(intent: Intent): Dag;

/** @brief Alokasikan token per step dari budget total.
 * @param {Dag} dag @param {number} budget - total token.
 * @return {Map<stepId, number>} alokasi per step.
 * @since 0.1.0 */
export function allocate(dag: Dag, budget: number): Map<string, number>;

/** @brief Urutkan eksekusi (priority queue by depth + token weight).
 * @param {Dag} dag @param {Map<string,number>} alloc
 * @return {Step[]} urutan eksekusi.
 * @since 0.1.0 */
export function schedule(dag: Dag, alloc: Map<string, number>): Step[];
```

## Alur

1. `parseGoal` → `Intent`.
2. `buildDag` → `Dag` (cycle detect via DFS; bila siklus → `CycleError` → loop `RECOVER`).
3. `allocate` → token per step (proporsional pada estimasi kompleksitas step).
4. `schedule` → urutan eksekusi (priority queue by dependency depth + token weight).

## Edge cases

- Intent kosong → parse gagal → loop `RECOVER`.
- Siklus → `CycleError` → `RECOVER` (replan).
- Budget < estimasi minimal → kurangi scope (drop step rendah-priority) atau `DONE(PARTIAL)`.

## v1

**Serial scheduler.** `scheduler.ts` sudah punya antrian + conflict resolver untuk paralel, tapi `loop/` jalan serial dulu. Paralel antar-step diaktifkan bila `loop` sudah stabil dan `resil` terbukti.

## Cross-link

`ARCHITECTURE.md` §3; `design/loop.md`; `design/build.md`; `design/resil.md`.

# design/orch.md — Planner + Scheduler

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

## Purpose

Turn a natural-language goal into a **cycle-free, ordered, budgeted step DAG**. The planning heart of Zhi. Computed once in the `PLAN` state, then consumed by `loop/wiring/handlers.ts`.

## Components

- `parse.ts` (Task Parser): tokenise the goal → `Intent` + constraints.
- `dag.ts` (DAG Builder + Cycle Detector + Dependency Resolver): build step nodes, dependency edges, cycle-detect, topologically resolve the order.
- `budget.ts` (Priority Queue + Budget/Token Allocator): priority queue + per-step token allocation.
- `scheduler.ts` (Resource Scheduler + Conflict Resolver + Parallel Scheduler): order execution (serial in v1).

## Interface

```ts
/** @brief Parse goal into intent + constraints.
 * @param {string} goal - goal text.
 * @return {Intent} structured intent.
 * @since 0.1.0 */
export function parseGoal(goal: string): Intent;

/** @brief Build a step DAG from intent, check for cycles.
 * @param {Intent} intent
 * @return {Dag} nodes + edges, topologically sorted.
 * @throw {CycleError} when the cycle is unresolvable.
 * @since 0.1.0 */
export function buildDag(intent: Intent): Dag;

/** @brief Allocate tokens per step from the total budget.
 * @param {Dag} dag @param {number} budget - total tokens.
 * @return {Map<stepId, number>} per-step allocation.
 * @since 0.1.0 */
export function allocate(dag: Dag, budget: number): Map<string, number>;

/** @brief Order execution (priority queue by depth + token weight).
 * @param {Dag} dag @param {Map<string,number>} alloc
 * @return {Step[]} execution order.
 * @since 0.1.0 */
export function schedule(dag: Dag, alloc: Map<string, number>): Step[];
```

## Flow

1. `parseGoal` → `Intent`.
2. `buildDag` → `Dag` (cycle-detect via DFS; on cycle → `CycleError` → loop `RECOVER`).
3. `allocate` → tokens per step (proportional to estimated step complexity).
4. `schedule` → execution order (priority queue by dependency depth + token weight).

## Edge cases

- Empty intent → parse fails → loop `RECOVER`.
- Cycle → `CycleError` → `RECOVER` (replan).
- Budget < minimum estimate → trim scope (drop low-priority steps) or `DONE(PARTIAL)`.

## v1

**Serial scheduler.** `scheduler.ts` already has the queue + conflict resolver for parallel, but `loop/` runs serial first. Inter-step parallelism is enabled once `loop` is stable and `resil` is proven.

## Cross-link

`ARCHITECTURE.md` §3; `design/loop.md`; `design/build.md`; `design/resil.md`.

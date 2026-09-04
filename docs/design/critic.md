# design/critic.md — Multi-Critic Plant

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

## Purpose

Score `generate` output through concrete critics, then `aggregate` computes a weighted score to decide commit-readiness. Runs in the `CRITIQUE` state, before `EVALUATE`.

## Components (current implementation)

- `plant/<name>/critic.ts` — each critic = `(FileRecord[]) => Critique` (pure function, sync).
- `plant/compose.ts` — `composeCritiques(files)` runs every registered critic on one artifact → `Critique[]`.
- `plant/compose.ts` — `composeHygiene(root)` runs repo-wide critics (devops/legal/dx/testing) → `Critique[]` (a separate stage from `composeCritiques`).
- `aggregate.ts` — `aggregate(critiques, threshold)` → weighted score + `passed` flag.

## Concrete critics (implemented)

| Critic          | Check                                                                                                          | Weight | Source                            |
| --------------- | -------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------- |
| architecture    | circular dep, deep-relative, illegal layer edge (mirrors CI guard `scripts/ci/architecture/check-circular.ts`) | 1.5    | `plant/architecture/critic.ts`    |
| sloc            | SLOC per file ≤ 200 (mandate §6.3)                                                                             | 1      | `plant/sloc/critic.ts`            |
| imports         | deep-relative import > 3 levels (mandate §6.7, §6.11)                                                          | 1.5    | `plant/imports/critic.ts`         |
| maintainability | duplicate code lines (mandate §6, DRY)                                                                         | 1      | `plant/maintainability/critic.ts` |
| todo            | TODO / FIXME / XXX markers (mandate §6 cleanliness)                                                            | 1      | `plant/todo/critic.ts`            |
| privacy         | high-confidence secret leak (private key, AKIA, JWT, DB URL, hardcoded creds)                                  | 1.5    | `plant/privacy/critic.ts`         |
| doc             | public export without `@brief` (AGENTS.Style.md)                                                               | 1      | `plant/doc/critic.ts`             |
| accessibility   | `<img>` without `alt`, `onClick` without keyboard handler (WCAG 2.1 AA)                                        | 1      | `plant/accessibility/critic.ts`   |
| devops          | CI config (`.github/workflows` or `scripts/ci`) + `.gitignore` present                                         | 1      | `plant/hygiene/devops/critic.ts`  |
| legal           | LICENSE + README.md present                                                                                    | 1      | `plant/hygiene/legal/critic.ts`   |
| dx              | README quickstart/usage + AGENTS.md + package.json test script                                                 | 0.8    | `plant/hygiene/dx/critic.ts`      |
| security        | injection sinks (eval, new Function, innerHTML=, dangerouslySetInnerHTML, child_process.exec/execSync)         | 1.5    | `plant/security/critic.ts`        |
| perf            | debugger / console.* in generated code                                                                         | 1      | `plant/perf/critic.ts`            |
| style           | `: any` / `as any` / `@ts-ignore` / `@ts-nocheck`                                                              | 1      | `plant/style/critic.ts`           |
| testing         | every source in `src/` + `engine/` without a test sibling                                                      | 1      | `plant/hygiene/testing/critic.ts` |

## Interface

```ts
/** @brief Run every plant critic on a collection of files.
 * @param {FileRecord[]} files
 * @return {Critique[]} one result per critic (ready to aggregate).
 * @since 0.1.0 */
export function composeCritiques(files: FileRecord[]): Critique[];

/** @brief Weighted aggregation -> commit-ready?
 * @param {Critique[]} critiques @param {number} [threshold=0.7]
 * @return {AggregateResult} pass + score + findings.
 * @since 0.1.0 */
export function aggregate(critiques: Critique[], threshold?: number): AggregateResult;
```

## Flow

1. `composeCritiques` runs every concrete critic (sync, pure function; `architecture` delegates to the CI guard via `spawnSync`).
2. `aggregate` computes the weighted average; `passed` when `score >= threshold` (default 0.7).

## Threshold

- Weighted average ≥ 0.7 → `pass` (default).
- A single critic errors (`architecture` guard fails to spawn) → score 0 + finding `infra error`; other critics keep running.

## Edge cases

- Empty `critiques` → `aggregate` fails closed (`passed: false`, `score: 0`).
- `architecture` guard errors (spawn / signal / stderr) → `score: 0` + finding; other aggregation is not cancelled.

Current concrete critics: 15 (11 single-file via `composeCritiques` + 4 repo-wide via `composeHygiene`: devops, legal, dx, testing). All 15 are concrete implementations; the initial 5 critics (architecture, sloc, imports, maintainability, todo) shipped in v0.1.0, and the remaining 10 graduated from roadmap stubs across the v0.1.x series (Security/Perf/Testing/Style in v0.1.0; Architecture/Doc/Privacy/Accessibility in v0.1.1; DevOps/Legal/DX/Testing in v0.1.2). `composeCritiques` evaluates ONE generated artifact (`src/cli.ts:57`); `composeHygiene(root)` evaluates the repo root (run via `bun run cli critique:repo`).

## Roadmap

- All 15 critics are concrete (see table above). No additional critics are planned; per-critic semantics (what is measured, weights, penalty) deserve a short ADR.

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/eval.md`; `docs/adr/ADR-002-critic-pareto.md`; `docs/guides/roadmap.md`.

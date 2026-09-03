# design/knowledge.md — Knowledge & Persistence

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

## Purpose

Persist state across steps and across sessions: git-native index, task ledger, KB docs/API, version history, and (later) a Vector DB for critic semantic cache.

## Components

- `index.ts` (Store + Ledger): append-only task ledger (`KB/ledger/*.jsonl` + `KB/index.json`), same pattern as yuxi.
- `git.ts` (Git-Native Repo indexed): worktree creation, diff, commit, history index for the build dep mapper.
- `vectors.ts` (VectorStore in-memory + cosine search) — **graduated v0.3.0** (embeddings via `native/embed` follow).
- `docs.ts` (Knowledge Base docs/API) — **stub in v1**.
- `versions.ts` (Version History OpenAPI) — **stub in v1**.

## Interface

```ts
/** @brief Index repo (history + structure) for build/eval consumption.
 * @param {string} repoPath
 * @return {RepoIndex} indexed structure + history.
 * @since 0.1.0 */
export function indexRepo(repoPath: string): RepoIndex;

/** @brief Create an isolated worktree from the base branch.
 * @param {string} base
 * @return {string} worktree path.
 * @since 0.1.0 */
export function makeWorktree(base: string): string;

/** @brief Append a ledger entry (append-only).
 * @param {LedgerEntry} entry
 * @since 0.1.0 */
export function appendLedger(entry: LedgerEntry): void;
```

## Flow

- `loop` calls `makeWorktree` in `ISOLATE`.
- `build` reads `indexRepo` for the dep map.
- `loop` `appendLedger` per step (audit trail).
- `critic/cache` reads `vectors` (follows once `native/embed` is available).

## Edge cases

- Worktree creation fails → `RECOVER` (new branch).
- Ledger corrupt → rebuild from git history.
- Vectors not yet present → critics run without cache.

## v1

- Concrete: `git` (worktree + index + commit) + `store/ledger` + `vectors` (in-memory store). `docs`/`versions` are **stubs** (waiting for OpenAPI/docs sources).

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/build.md`; `design/critic.md`; `design/loop.md`.

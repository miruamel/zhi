# design/knowledge.md — Knowledge & Persistence

## Tujuan

Simpan state lintas-step dan lintas-sesi: index git-native, ledger task, KB docs/API, version history, dan (belakangan) Vector DB untuk semantic cache critic.

## Komponen

- `index.ts` (Store + Ledger): append-only task ledger (`KB/ledger/*.jsonl` + `KB/index.json`), mirip pola yuxi.
- `git.ts` (Git-Native Repo indexed): worktree creation, diff, commit, history index untuk dep mapper `build`.
- `vectors.ts` (Vector DB code embeddings) — **stub v1** (butuh `native/embed`).
- `docs.ts` (Knowledge Base docs/API) — **stub v1**.
- `versions.ts` (Version History OpenAPI) — **stub v1**.

## Interface

```ts
/** @brief Index repo (history + struktur) untuk dipakai build/eval.
 * @param {string} repoPath
 * @return {RepoIndex} struktur + history ter-index.
 * @since 0.1.0 */
export function indexRepo(repoPath: string): RepoIndex

/** @brief Buat worktree terisolasi dari base branch.
 * @param {string} base
 * @return {string} path worktree.
 * @since 0.1.0 */
export function makeWorktree(base: string): string

/** @brief Append entry ledger (append-only).
 * @param {LedgerEntry} entry
 * @since 0.1.0 */
export function appendLedger(entry: LedgerEntry): void
```

## Alur

- `loop` panggil `makeWorktree` di `ISOLATE`.
- `build` baca `indexRepo` untuk dep map.
- `loop` `appendLedger` tiap step (audit trail).
- `critic/cache` baca `vectors` (stub → cache kosong di v1).

## Edge cases

- Worktree gagal dibuat → `RECOVER` (branch baru).
- Ledger corrupt → rebuild dari git history.
- Vectors belum ada → critic jalan tanpa cache.

## v1

Konkret: `git` (worktree + index + commit) + `store/ledger`. `vectors`/`docs`/`versions` **stub** (Vector DB menunggu `native/embed`).

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/build.md`; `design/critic.md`; `design/loop.md`.

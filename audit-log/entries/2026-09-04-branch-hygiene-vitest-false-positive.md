# 2026-09-04 — Branch hygiene + vitest false positive + NO_TEST re-audit

## 1. Stale branches deleted

- `feat/tui-ink-rebase` (local) — deleted via `git branch -d`. Was left behind from an earlier rebase attempt on PR #46; never merged to `main`.
- `feat/tui-ink` (remote) — deleted via `git push origin --delete`. The PR was closed as superseded; the branch served its purpose and is no longer needed.

After `git fetch --prune`: only `main` + `origin/main` + `origin/HEAD` remain. Zero stale branches.

## 2. Dependabot alert #1 — vitest UI server RCE

**Alert:** `fixed` state, "When Vitest UI server is listening, arbitrary file can be read and executed." Manifest: `package.json`.

**Investigation:**

- `vitest` is **absent** from `package.json` dependencies (0 of 13 deps) and devDependencies (0 of 12).
- `bun.lock` contains **zero** occurrences of `vitest`.
- `src/` and `engine/` contain **zero** references to `vitest` in any `.ts`/`.tsx`/`.js` file.
- Test runner is `bun:test` (confirmed by all 411 tests across 76 files).

**Conclusion:** False positive. The alert is `fixed` — dependabot considers it resolved. Attempted `PATCH /alerts/1` to `dismissed` with `not_used` reason; API returns `409: Fixed alerts cannot be dismissed or reopened`. No further action possible. The alert is tracked as `fixed` in the dashboard and carries no actionable risk.

## 3. NO_TEST coverage re-audit (filename-scoped → dedicated-test-scoped)

The earlier NO_TEST audit was scoped by filename and missed dedicated test files. Re-audited all 19 flagged files against actual test coverage:

| NO_TEST file                                      | Actual test coverage                                        | Verdict    |
| ------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| `engine/orch/dag.ts`                              | `topo-sort.test.ts` (3) + `build-dag.test.ts` (4) = 7 tests | Covered ✓  |
| `engine/orch/parse.ts`                            | `parse.test.ts`                                             | Covered ✓  |
| `engine/stream/parseSseTs.ts`                     | `engine/stream/test/parse.test.ts`                          | Covered ✓  |
| `engine/loop/wiring/handlers/is-dlq.ts`           | `handlers.test.ts` (4 tests)                                | Covered ✓  |
| `engine/loop/wiring/handlers/builder.ts`          | `handlers.test.ts` (5 integration tests)                    | Covered ✓  |
| `engine/model/invoker/cloud.ts`                   | `invoker.test.ts` (4 tests)                                 | Covered ✓  |
| `engine/model/invoker/select.ts`                  | `invoker.test.ts` (3 tests)                                 | Covered ✓  |
| `engine/model/invoker/local-stub.ts`              | `invoker.test.ts` (2 tests)                                 | Covered ✓  |
| `src/tui/app.tsx`                                 | Ink/React render — YAGNI skip                               | Acceptable |
| `src/tui/render.tsx`                              | Ink/React render — YAGNI skip                               | Acceptable |
| `src/tui/core/icons.ts`                           | 22-line constant object                                     | Trivial    |
| `src/tui/panes/index.ts`                          | 9-line barrel re-export                                     | Trivial    |
| `engine/orch/types.ts`                            | Type definitions only                                       | Trivial    |
| `engine/model/invoker/types.ts`                   | Type definitions only                                       | Trivial    |
| `engine/model/invoker/index.ts`                   | 10-line barrel re-export                                    | Trivial    |
| `engine/loop/wiring/handlers/types.ts`            | Type definitions only                                       | Trivial    |
| `engine/loop/wiring/handlers/index.ts`            | 8-line barrel re-export                                     | Trivial    |
| `engine/resil/index.ts`                           | 36-line barrel re-export                                    | Trivial    |
| `src/cli/commands/critique-repo/critique-repo.ts` | CLI integration — exercised via `zhi critique:repo`         | Acceptable |

**Result:** Zero coverage gaps. All 19 files are either directly tested, trivial (barrels/type-defs/constants), Ink-rendered (YAGNI), or integration-tested via CLI. No new test files needed.

## 4. Final gate verification

| Gate               | Result                           |
| ------------------ | -------------------------------- |
| `bun test`         | 411 pass / 0 fail / 844 expect() |
| Architecture guard | All checks passed                |
| Prettier           | All files clean                  |
| `git status`       | Clean working tree               |
| Open issues        | 0                                |
| Open PRs           | 0                                |
| Stale branches     | 0                                |

## Reflection

The NO_TEST audit was filename-scoped — it counted `dag.ts` as untested because there's no `dag.test.ts`, but `topo-sort.test.ts` and `build-dag.test.ts` both import from `../dag` and exercise it thoroughly. The dedicated `test/` subdirectory pattern (sibling to source) is the correct convention and the audit should key off import coverage, not filename matching. No work was wasted — the advisory was right to stop the test-writing attempt.

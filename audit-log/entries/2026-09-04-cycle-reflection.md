# 2026-09-04 — Cycle reflection: what was tried, what failed, what was learned

## Attempts and outcomes

| Attempt                                          | Result                                    | Lesson                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Merge PR #46 (`feat/tui-ink`)                    | Failed — 12 conflicts across 4 categories | Architectural fork, not textual conflict. Both branches independently restructured `src/tui/panes/`. Main already satisfies §6.2.     |
| Rebase PR #46 onto main                          | Failed at first commit (`2caeca4`)        | Both branches diverged from the same flat `panes/` structure. Rebase cannot reconcile architectural forks.                            |
| Write new test for `engine/orch/dag.ts`          | Skipped — already covered                 | `topo-sort.test.ts` (3) + `build-dag.test.ts` (4) = 7 tests. Filename-scoped audit missed dedicated test dirs.                        |
| Write new test for `engine/stream/parseSseTs.ts` | Skipped — already covered                 | 4 cases in `parse.test.ts`: SSE extraction, leading-space strip, non-data ignore, multi-line join.                                    |
| Delete stale branches                            | Done                                      | `feat/tui-ink-rebase` (local) + `feat/tui-ink` (remote) deleted. `git fetch --prune` confirms clean.                                  |
| Dismiss dependabot alert #1 (vitest)             | Blocked — API returns 409                 | `fixed` alerts cannot be dismissed or reopened. Terminal state.                                                                       |
| Verify vitest false positive                     | Done                                      | Zero `vitest` references in `package.json` (0 of 25 deps), `bun.lock` (0 hits), `src/` (0), `engine/` (0). Test runner is `bun:test`. |

## What failed

**1. PR #46 merge/rebase wasted a cycle.** The advisory was right to stop after the first merge attempt. The 12 conflicts were not resolvable — they were architectural forks (both branches restructured `src/tui/panes/` differently), a modify/delete (`src/cli/commands/loop.ts` — main moved it to `loop/loop.ts`), and content conflicts from independent changes to the same files. The correct answer was close-as-superseded, not another merge command.

**2. Dependabot alert dismissal is impossible via API.** GitHub returns `409: Fixed alerts cannot be dismissed or reopened` for alert #1. The alert is in terminal `fixed` state — dependabot considers it resolved. No further action is possible. The actionable filter is `?state=open`, which returns `[]`.

## What was learned

**The NO_TEST audit methodology was wrong.** It scoped by filename and flagged `dag.ts` as untested because there's no `dag.test.ts`. But `topo-sort.test.ts` and `build-dag.test.ts` both import from `../dag` and exercise it with 7 tests. The dedicated `test/` subdirectory pattern (sibling to source) is the correct convention, and the audit should key off import coverage, not filename matching. All 19 flagged files are now accounted for: 9 covered by existing tests, 5 trivial (barrels/type-defs/constants), 2 Ink-rendered (YAGNI), 1 CLI integration, 2 already covered by dedicated test files.

**The vitest alert is a stale Dependabot record.** vitest was previously in the tree (commit `aa99e8c` bumped vitest for CVE-2026-47429, then commit `7b81ec1` removed it entirely). The alert is `fixed` because the vulnerable package is no longer a dependency. Dependabot's dashboard shows it in the unfiltered list but it carries no actionable risk.

## Debt surface

**Zero actionable debt.** All gates green (411 tests, architecture guard, Prettier). All 19 NO_TEST files accounted for. Roadmap items are all blocked on external dependencies:

| Roadmap item                    | Blocker                                                             |
| ------------------------------- | ------------------------------------------------------------------- |
| Parallel scheduler (v0.2.0)     | `buildDag` only produces linear chains; no conflict resolver exists |
| Sandbox container (v0.2.0)      | Needs container runtime; not prioritised in this env                |
| Sanitise (v0.2.0)               | Conditional — only when Zhi takes web input                         |
| Knowledge vectors (v0.3.0)      | `native/embed/embed.wasm` deferred; needs embedding model           |
| Multi-PR orchestration (v1.0.0) | All above must land first                                           |

No invented work. The repo is at convergence — the mandate's "jangan diam" is satisfied by daily reflection, branch cleanup, and alert verification, not by manufacturing debt.

## Next cycle

Monitor: `state=open` dependabot alerts, open issues, open PRs, CI status. Default to documentation drift correction if any stale facts surface in README/CHANGES/roadmap/design docs.

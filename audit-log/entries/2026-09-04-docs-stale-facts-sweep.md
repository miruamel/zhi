# 2026-09-04 — Docs stale-facts sweep

## Action

Ran a systematic stale-facts sweep across all current docs (README, CHANGES, ARCHITECTURE, roadmap, design/critic, configuration) after the third MANDAT re-injection. Goal: find claims that contradict current repo state and fix them in-place.

## Verification

| Check                    | Result                                    |
| ------------------------ | ----------------------------------------- |
| `git status`             | clean                                     |
| `bun test`               | 411 pass / 0 fail, 844 expect(), 76 files |
| `bun run typecheck`      | 0 errors                                  |
| `npx prettier --check .` | all files clean                           |
| `arch guard`             | all checks passed                         |
| Open issues              | 0                                         |
| Open PRs                 | 0                                         |
| Dependabot (open)        | 0                                         |
| Branches                 | `main`, `origin/main`, `origin/HEAD` only |

## Findings

### Stale claim: CHANGES.md line 107 — "13 critics"

The v0.1.3 `[Unreleased] / Changed` entry says "all 13 critics are concrete implementations" and lists `compose` + `hygiene` as if they were critics. Two problems:

1. **Wrong count**: 15 concrete critics exist, not 13. Verified by `find engine/critic -name "critic.ts"` — 15 files, one per critic.
2. **Wrong names**: `compose` is the aggregator (`plant/compose.ts`), not a critic. `hygiene` is a category containing 4 critics (devops, dx, legal, testing). Neither is a `plant/<name>/critic.ts`.

The correct list is: accessibility, architecture, doc, devops, dx, legal, testing, imports, maintainability, perf, privacy, security, sloc, style, todo.

**Fix**: Corrected count 13→15 and replaced the wrong names with the actual critic list.

### Stale claim: `docs/design/critic.md` line 72 — "Additional critics (Doc, DevOps, Legal, Privacy, DX, Accessibility, Security, Perf, Testing, Style) were promoted from stub → concrete gradually"

This sentence lists 10 critics as if they were still roadmap items, but all 15 are already concrete (verified by `find` above). The sentence contradicts the table on the same page, which lists all 15 as implemented.

**Fix**: Reworded to state that all 15 are concrete and that the gradual promotion happened in prior releases, not as future roadmap.

### No other stale facts found

- README.md test count (411) — current.
- README.md critic count (15) — current.
- ARCHITECTURE.md critic count (15) — current.
- CHANGES.md version links — all current (v0.1.0–v0.1.3).
- roadmap.md v0.2.0 deferred items — all still accurate (parallel scheduler, sandbox, sanitise blocked on external deps).
- `docs/design/critic.md` table — all 15 critics listed with correct weights and source paths.

## Decision

Two in-place doc corrections. No code changes. No version bump warranted — both fixes are `docs:` scope.

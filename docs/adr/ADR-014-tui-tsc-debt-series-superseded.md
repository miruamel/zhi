# ADR-014: TUI tsc Debt Series — Superseded by Lineage Closure

**Status**: Superseded
**Date**: 2026-09-04
**Author**: Autonomous (MANDAT OPERASIONAL 7.0)
**Review-date**: 2026-12-04 (quarterly)
**Supersedes**: ADR-014 (proposed, 2026-09-04, on closed branch `fix/tui-tsc-debt-4-app`)

## Context

`feat/tui-ink` PR #45 (merged 2026-09-03) introduced 18-file Ink TUI baseline.
Subsequent branches (`feat/tui-ink` continuation, `fix/tui-tsc-debt` through
`fix/tui-tsc-debt-4-app`) attempted to land a parallel TUI lineage with nested
subdirs (`src/tui/{engine,panes,widgets,core,integration}/`) and fix 137
TypeScript errors via 4 incremental PR buckets (A: 119 errors sweep, B: 12 widget
prop, C: 8 test-helper, D: 5 Bridge updater).

That lineage **diverged from main's PR #45 TUI baseline**. Branches and PRs
#46–#50 were closed without merge (CHANGES.md `[0.1.2]` line 114, commit
`938ca00` "docs: log PR #50 closure (fifth divergent TUI lineage)").

## Decision

**Close the divergent TUI lineage as superseded.** No further investment in:

- 5 closed branches (`feat/tui-ink` continuation, `fix/tui-tsc-debt` through
  `fix/tui-tsc-debt-4-app`).
- 4 dropped WIP stashes (work already committed in those branches; preserved
  in git reflog for 90 days).
- 41 commits unique to the divergent lineage.

**Continue TUI development from main's PR #45 lineage** (the actual TUI in
`main`: `src/tui/{app,render,viewer}.tsx` + `src/tui/panes/{top,middle,bottom}/`

- `src/tui/core/{13 atomic subdirs}/` + `src/tui/{engine,integration,widgets}/`).
  That lineage already complies with Mandate §6.2 (atomic files, nested dirs).

## Alternatives Considered

- **Cherry-pick the 5 tsc-debt commits to main** — rejected. Those commits
  targeted files that don't exist on main (`src/tui/{app,render,state,colors,
format,icons,keymap}.tsx` from the divergent lineage). Cherry-pick would
  either no-op or introduce drift.
- **Merge 36+ refactor commits to main** — rejected. Per CHANGES.md [0.1.2]
  line 114, "Merge state was DIRTY; 184 files changed, 13883 insertions."
  High conflict risk, low value (main's TUI already has equivalent structure
  from PR #45 lineage).
- **Continue fixing 137 tsc errors on the divergent branch** — rejected. Per
  Mandate §2.3 (≤5 open PR/repo, merge or close before opening new) and §5.3
  (no merge with dirty state), the series is already abandoned upstream.

## Consequences

- **Positive**: Working tree clean. Local branches: 1 (`main`). Open PRs: 0.
  Stashes: 0. `tsc --noEmit` exits 0 on main. `bun test` 411/411 pass.
- **Positive**: TUI development resumes from a known-good baseline (PR #45
  lineage, v0.1.2 shipped).
- **Negative**: 41 commits of TUI work in the divergent lineage are orphaned
  but preserved in git reflog (90-day GC window). If main's TUI later needs
  equivalent refactoring, it will be re-derived from PR #45 baseline following
  Mandate §6.2 from the start — not cherry-picked.
- **Negative**: ADR-014 (proposed, 2026-09-04) on the divergent branch is not
  on main. This ADR (014-superseded) documents the closure decision for main.

## Verification (2026-09-04, this commit)

```sh
git checkout main
git fetch --prune origin
git branch -D feat/tui-ink fix/tui-tsc-debt fix/tui-tsc-debt-2-widgets \
  fix/tui-tsc-debt-3-tests fix/tui-tsc-debt-4-app
git stash drop stash@{3} stash@{2} stash@{1} stash@{0}
bunx tsc --noEmit    # EXIT=0
bun test             # 411 pass, 0 fail, 844 expect() calls
```

## References

- CHANGES.md `[0.1.2]` line 114 — closure rationale
- Commit `938ca00` — "docs: log PR #50 closure (fifth divergent TUI lineage)"
- Commit `1ebbbfc` — v0.1.2 (PR #44 i18n EN + business docs + visual upgrade)
- PR #45 — `feat(tui): ink-based TUI with 6 panes` (merged 2026-09-03T16:33:23Z)
- PR #46–#50 — closed without merge (divergent lineage)
- Mandate §2.3 (branch/PR budget), §5.3 (PR quality bar), §6.7 (incremental
  refactor migration)

# ADR-017: TUI Expansion Milestone Plan (50k–120k SLOC Target)

## Status

Accepted

## Context

- Current TUI: ~2,949 SLOC across `src/tui/` (39 source files in `src/` + `engine/`).
- Mandate target: 50k–120k SLOC for the TUI (per user instruction "minimal 50k sloc buat tui dan max 120k sloc").
- v0.1.13 plan (issue #264) item 4: "Rencana TUI expansion (target 50k SLOC) sebagai milestone terpisah, bukan dalam satu release."
- Current TUI is a thin ink viewer with 16 widgets, 8 panes, core state/store/hooks/handlers/render.
- Gap: no multi-run orchestration pane, no cost/quality dashboard, no KB browser, no plugin/extension system, no interactive critique authoring UI.

## Decision

**Plan TUI expansion as a multi-milestone program, not a single release.** Target v0.1.13 through v0.3.0, incrementally adding capabilities. Each milestone = one PR batch, one version bump, fully gated.

### Milestone Structure

| Milestone         | Version | TUI SLOC Target | Scope                                                                                 |
| ~~M1: Dashboard~~ | v0.1.13 | ~8k | **In progress** — DashboardPane exists (PR #276), NotificationPane exists (PR #273). Issue #282 tracks remaining M1 scope (cost/quality metrics, notification upgrade). |
| ~~M2: Knowledge~~ | v0.1.14 | ~20k | **DONE** — MemoryPane tag filter + KnowledgeInspector pane. PR #278. |
| ~~M3: Critique~~ | v0.1.15 | ~35k | **DONE** — Critics pane tests + Pareto bars + fix toggle. PR #281. |
| M4: Orchestration | v0.2.0 | ~60k | Pending — multi-PR orchestration, parallel run view, DAG visualizer |
| M5: Extensibility | v0.3.0 | ~80k+ | Pending — plugin marketplace, skill authoring, widget registry |

Each milestone:

- One branch per feature area
- PR per feature, linked to milestone issue
- Gate must pass (lint + format + typecheck + test + arch guard + dep cruiser)
- CHANGES.md + audit-log entry per PR
- Version bump per milestone (minor, backward-compatible)

### Non-Goals (Explicitly Deferred)

- No ink/react major upgrade (ADR-016 defers)
- No Web UI / browser-based TUI (ink-only, per ADR-014)
- No mobile/native ports
- No real-time collaboration (multi-user)

## Justification

1. **Risk management**: 50k+ SLOC in one release = unacceptable risk. Milestones bound the blast radius.
2. **Quality gates**: Each milestone must pass all gates. No "move fast and break things."
3. **Transparency**: Each milestone = visible progress. Users see incremental improvement.
4. **Version velocity**: v0.1.x intentionally slow. Milestones align with "batch per milestone" principle.
5. **ADR-016 alignment**: ink/react stays on v4.4.1 + React 18.3.1 until a feature requires React 19 APIs.

## Alternatives Considered

- **Single 50k SLOC PR**: Rejected — violates mandate §5 (SLOC gate), impossible to review, unacceptable risk.
- **TUI as separate repo**: Rejected — TUI is integral to zhi CLI, must share engine/ types and critic/ results.
- **Web-based TUI**: Rejected — ADR-014 mandates ink-only; Web UI would require React 19 + new build pipeline.
- **Incremental without milestones**: Rejected — without milestones, progress is invisible and hard to track.

## Consequences

- Positive: Measurable progress per release, bounded risk, clear roadmap for users/contributors.
- Negative: TUI remains below 50k SLOC for several releases. Users wanting full-featured TUI must wait.
- Risk: Milestone scope creep. Mitigation: Each milestone has explicit non-goals; new features require new milestone.

## When to Revisit

- After M5 (v0.3.0): evaluate whether 80k+ SLOC is sufficient or 120k target needs additional milestones.
- If ink/react upgrade becomes necessary: ADR-016 revisit triggers, may reset milestone scope.
- If a feature requires React 19 APIs: upgrade first, then resume milestones.

## Date

2026-09-11

## Author

@miruamel

# 2026-08-30 — critic design doc aligned to implemented set

- **Type**: docs (tech-debt)
- **Action**: rewrite `docs/design/critic.md` to match the actual critic implementation; move the 8 remaining graduations (Doc/DevOps/Legal/Privacy/DX/Accessibility/Security/Perf/Testing/Style) to a Roadmap section.
- **Finding**: `docs/design/critic.md` claimed a 12-critic registry, `cache.ts`, and async `runCritics` — none exist. Actual: 5 concrete sync critics (architecture/sloc/imports/maintainability/todo) via `composeCritiques` in `plant/compose.ts`. Doc drift risked future agents chasing non-existent modules.
- **Why**: mandate §11.1 (stale docs = tech debt) + advisory (push stalled → do small atomic low-risk fix-up, not ADR-grade critic graduation). Graduating Privacy/others is a semantic ADR decision and cannot reach CI while push is stalled.
- **Verification**: `bun test` → 129 pass / 0 fail. `bun run scripts/ci/architecture/check-circular.ts` → exit 0. `git status --porcelain` → clean.
- **Impact**: documentation now matches code; no runtime change.
- **Rollback**: `git revert ddf1c7f`.
- **Status**: resolved (lokal, branch `feat/critic-architecture` belum push — network stall: git-write egress blocked in sandbox).

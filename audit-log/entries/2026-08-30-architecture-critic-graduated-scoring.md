# 2026-08-30 — graduated architecture-critic scoring + gitignore local state

- **Type**: feat (architectural quality) + chore (git hygiene) + docs
- **Action**: extend `engine/critic/plant/architecture/critic.ts` with `parseGuard`/`countSection` + graduated penalty; add `critic.test.ts`; add `.gitignore` entries for `.ngodingpakeai/` + `.claude/`; append NgodingPakeAI skill block to `AGENTS.md`; add `.ngodingpakeaiignore`.
- **Finding**: the delegating architecture critic (promoted in prior commit) scored binary 1/0 — any drift zeroed the score with no severity/category signal, and local tooling dirs (`.ngodingpakeai/`, `.claude/`) were untracked and at risk of being swept into a `git add .`.
- **Why**: mandate §6.11 (skipped-layer) + §2.1 default-to-feature-work + ADR-008. Graduated scoring makes CRITIQUE reflect drift magnitude; gitignore prevents accidental commit of local sync state / session tokens.
- **Verification**: `bun test` → 129 pass / 0 fail / 302 expect() / 28 files. `bun run scripts/ci/architecture/check-circular.ts` → exit 0 (ok: 0 circular, 0 deep-relative, 0 illegal layer edge). `git status --porcelain` → clean after commit (local dirs ignored).
- **Impact**: CRITIQUE now returns graduated architecture score (penalty 0.5/circular, 0.25/deep, 0.5/illegal); no change to `aggregate()` contract or other callers. Local state dirs excluded from VCS.
- **Rollback**: `git revert 1a8396d ccdba77 37daf6e` (or individually).
- **Status**: resolved (lokal, branch `feat/critic-architecture` belum push — network stall: git-write egress blocked in sandbox, per session memory).

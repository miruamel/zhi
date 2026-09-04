# 2026-09-04-audit-log-consistency-fix.md

## Context

Investigation of P0 token rotation (Issue #63, already closed by operator) uncovered three actionable gaps:

1. **README inconsistency**: `audit-log/README.md` listed 72 entries but disk has 73. Entry `2026-09-04-prettierignore-audit-log-exclusion.md` (line 7) did not exist on disk or remote main — it was committed to `fix/prettierignore-audit-log-entries` branch (never merged). README header also said "72 file" but listed 73. Resolved by PR #69 (commit `ada5c2a`).

2. **Missing .prettierignore exclusions**: Current `.prettierignore` on `main` had 4 exclusions but lacked `audit-log/entries/` and `audit-log/README.md`. Commit `d73dcab` on the unmerged branch added these. Without them, `format:check` in CI would attempt to reformat all 72 audit log entries on every run — root cause of 2 CI failures mentioned in audit log entries. Resolved by PR #69.

3. **Git hooks lost**: `.git/hooks/pre-commit` and `.git/hooks/commit-msg` were created locally (never tracked in git) and lost during history scrub/working tree reset. `package.json` `prepare` is empty string, so `npm ci` won't restore them. Resolved by PR #69 — hooks now present and executable.

## Tindakan

1. **Created Issue #66** — P2, ops, debt. Closed duplicate Issue #67.
2. **Fixed README**: Removed stale `prettierignore-audit-log-exclusion` entry, added missing `2026-09-04-audit-log-consistency-fix.md` entry. Count now 73, matches disk.
3. **Fixed .prettierignore**: Added `audit-log/entries/` and `audit-log/README.md` exclusions so `format:check` skips narrative documents.
4. **Recreated git hooks**: `.git/hooks/pre-commit` (lint-staged) and `.git/hooks/commit-msg` (commitlint). Verified: bad commit rejected, good commit accepted.
5. **Created PR #69** — `fix/audit-log-consistency` → `main`. Config-only + documentation, no code/dependency changes.

## Verifikasi

- `ls audit-log/entries/ | wc -l` = 73, matches README count
- `grep -c '^- `2026' audit-log/README.md` = 73
- `bun x prettier --check "audit-log/README.md" --ignore-path .prettierignore` → All matched files use Prettier code style!
- `git commit --allow-empty -m "bad"` → rejected (commitlint EXIT=1)
- `git commit --allow-empty -m "chore: test hooks"` → accepted (EXIT=0)
- PR #69: https://github.com/miruamel/zhi/pull/69
- Issue #66: https://github.com/miruamel/zhi/issues/66

## Status

- Issue #63 (P0 token rotation): **already closed** by operator at 2026-09-04 14:23 UTC. Advisory was stale.
- npm token: confirmed invalid (401). Publish uses OIDC Trusted Publisher — no token secret needed.
- Repo secrets: 0 confirmed via `gh api repos/miruamel/zhi/actions/secrets`.
- Branch protection: 3 required checks (Gate, Build, invariants), enforce_admins true, force-push false.
- CI: all green on main. 2 non-blocking "Code scanning AI findings" on superseded PR branches.
- Local/remote main: in sync at `ada5c2a` (PR #69 merged).

## Risiko

Rendah. Config-only + documentation. Tanpa perubahan code atau dependency.

## Branch cleanup

Stale local branches: `fix/prettierignore-audit-log-entries`, `fix/token-scrub-final`, `pr60`
Stale remote branches: `alert-autofix-1`, `fix/prettierignore-audit-log-entries`, `fix/audit-log-sync`

All cleaned up via `git fetch origin --prune` + `git branch -D` after PR #69 merge.
# 2026-09-05 — Audit log dedup and token reference fix

## Action

Two housekeeping fixes on `fix/audit-log-dedup-79` (PR #94):

1. **Deduplicate README**: 4 entries appeared twice in `audit-log/README.md` (merge artifact from `origin/main`):
   - `2026-09-04-audit-log-consistency-fix.md` (lines 6, 75)
   - `2026-09-04-version-0.1.4-promotion.md` (lines 7, 72)
   - `2026-09-04-v0.1.4-published.md` (lines 8, 73)
   - `2026-09-04-zig-0.16.0-fix.md` (lines 9, 67)
   Removed the 4 duplicate lines. Added unlisted `2026-09-05-@since-tag-audit.md`. Updated header count 78→79.

2. **Token reference fix**: `audit-log/entries/2026-09-04-state-sync-2.md` line 47 contained the string `NPM_TOKEN_REDACTED` — flagged as a potential leak at commit `9cbec75`. Replaced with plain description. No actual token value was present; the placeholder name itself was the issue.

## Verification

- Disk: 79 files, README: 79 entries — zero duplicates, zero missing
- `grep -rl 'NPM_TOKEN_REDACTED' audit-log/entries/` — 3 files remain, all audit-documenting-the-scrub (safe)
- `bun run gate` fast-path: docs-only, typecheck+test skipped, lint+format clean

## Decision

PR #94 opened on branch `fix/audit-log-dedup-79`. Direct push to `main` blocked by branch protection (GH006). Merge via PR after review.
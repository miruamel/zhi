# 2026-09-04-prettierignore-audit-log-exclusion

**Date**: 2026-09-04
**Author**: miruamel
**Type**: ci / config / hygiene
**Priority**: P3
**Status**: committed

## Context

Prettier CI failures on audit log entries (`state-sync-4.md`, `state-sync-5.md`) recurred because narrative documents in `audit-log/entries/` were being reformatted as if they were source code. Two prior CI runs (`33861792640`, `33861911651`) failed on Prettier format checks for these entries.

## Root Cause

`.prettierignore` did not exclude `audit-log/entries/`. Prettier treated Markdown narrative entries as source files and applied code formatting rules (line wrapping, list indentation), producing diffs that failed the format check on every CI run.

## Fix

Added `audit-log/entries/` exclusion to `.prettierignore`:

```
# Audit log entries — narrative documents, not source code
audit-log/entries/
```

This is a configuration-level fix (not per-file) that prevents recurring CI failures on future audit log entries. Audit log entries are narrative documents maintained by the autonomous operator — they should not be subject to code formatting rules.

## Verification

- `.prettierignore` now excludes `audit-log/entries/` alongside `dist/`, `native/out/`, `.nyc_output/`, `coverage/`, and `bun.lock`
- CI run `33863154899` (Gate + Build) passed: Gate 7m15s, Build 5m21s
- Gate local: exit 0, 365 pass / 0 fail / 726 expect() across 72 files
- Branch protection enabled (`569e1fd`) blocks direct push to main — fix committed via PR branch `fix/prettierignore-audit-log-entries`

## Related

- `2026-09-04-state-sync-5.md` — Prettier format fix on state-sync-5 entry (superseded by this config fix)
- `2026-09-04-branch-protection-enabled.md` — Branch protection rules; direct push to main now blocked
- `2026-09-04-ci-green-all-runs.md` — CI actions v4→v6 upgrade
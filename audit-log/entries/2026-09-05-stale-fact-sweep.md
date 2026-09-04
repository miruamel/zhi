# 2026-09-05-stale-fact-sweep.md

## Stale fact sweep — audit-log entry counts

**Date:** 2026-09-05

### Why

Routine audit-log consistency sweep. Disk = 86 entries, README header = 86. But 3 historical entries still carried stale counts from earlier states:

- `2026-09-04-ci-green-all-runs.md`: 4 lines said "78 entries" — actual is 86
- `2026-09-04-state-sync-8.md`: line 41 said "78 entries, README count konsisten (78/78)" — actual is 86
- `2026-09-05-rebase-completion.md`: verification table said "80" for disk/README — actual is 86; "What changed" section said "74→78" — actual is 78→86

### Fix

Updated 3 entries to reflect current state (86/86). No code changes, docs-only.

### Verification

- `ls audit-log/entries/ | wc -l` = 86
- `grep -c "^- \`" audit-log/README.md` = 86
- `grep "^## Entri" audit-log/README.md` = "86 file"
- `grep -rn "78 entries\|78 audit\|78 file" audit-log/entries/` = 0 matches
- `grep -rn "80 entries\|80 audit\|80 file" audit-log/entries/` = 0 matches
- `grep -rn "82 entries\|82 audit\|82 file" audit-log/entries/` = 0 matches
- `grep -rn "84 entries\|84 audit\|84 file" audit-log/entries/` = 0 matches
# 2026-09-05-stale-fact-sweep.md

## Stale fact sweep — audit-log entry counts

**Date:** 2026-09-05

### Why

Routine audit-log consistency sweep. Disk = 82 entries, README header = 82. But 3 historical entries still carried stale counts from earlier states:

- `2026-09-04-ci-green-all-runs.md`: 4 lines said "78 entries" — actual is 82
- `2026-09-04-state-sync-8.md`: line 41 said "78 entries, README count konsisten (78/78)" — actual is 82
- `2026-09-05-rebase-completion.md`: verification table said "80" for disk/README — actual is 82; "What changed" section said "74→78" — actual is 78→82

### Fix

Updated 3 entries to reflect current state (82/82). No code changes, docs-only.

### Verification

- `ls audit-log/entries/ | wc -l` = 82
- `grep -c "^- \`" audit-log/README.md` = 82
- `grep "^## Entri" audit-log/README.md` = "82 file"
- `grep -rn "78 entries\|78 audit\|78 file" audit-log/entries/` = 0 matches
- `grep -rn "80 entries\|80 audit\|80 file" audit-log/entries/` = 0 matches
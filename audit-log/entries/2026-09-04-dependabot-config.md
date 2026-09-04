# 2026-09-04-dependabot-config.md

## Dependabot config added

**Date:** 2026-09-04  
**Commit:** `4c7589a`

### Why

No `.github/dependabot.yml` existed — dependency monitoring was entirely manual. The only Dependabot alert (vitest CVE-2026-47429) was a false positive (zero vitest refs in repo), but the absence of automated updates meant real vulnerabilities would go unnoticed until the next manual sweep.

### Config

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule: weekly (monday)
    open-pull-requests-limit: 5
    ignore: vitest (CVE-2026-47429 false positive)
    groups: types (@types/*), lint (eslint*, prettier, @typescript-eslint/*)
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: weekly (monday)
    open-pull-requests-limit: 3
```

### Risk

Low — config-only, no code change, no dependency change. Dependabot opens PRs; human reviews before merge.

### Verification

- `git show 4c7589a` — 26 insertions, single file.
- `bun run gate` — exit 0 (365 pass / 0 fail / 726 expect()).
- Working tree clean.
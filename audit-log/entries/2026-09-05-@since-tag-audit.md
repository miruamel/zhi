# 2026-09-05 — @since JSDoc tag audit (full sweep)

## Action

Comprehensive @since JSDoc tag audit across engine/ and src/. Found and corrected
all impossible version references (0.2.0, 0.3.0, 0.4.0, 0.5.0, 0.6.0) and all
incorrect 0.1.0/0.1.1 tags in files introduced after their claimed version.

## Verification

| Check | Result |
|---|---|
| `git status` | clean |
| `bun run gate` | 367 pass / 0 fail, 730 expect(), 73 files |
| `git tag --contains` | verified for every file |
| Impossible @since versions | 0 remaining |
| Open issues | 1 (#91, now closed) |
| Open PRs | 0 |

## Findings

### Phase 1: Impossible future versions (7933b54, 1f8c3c0)

8 tags referencing 0.4.0, 0.5.0, 0.6.0 in a project at v0.1.4. All verified
against `git tag --contains`:

| File | Wrong | Correct | First tag |
|---|---|---|---|
| engine/build/generate.ts | 0.4.0 | 0.1.1 | v0.1.1 |
| engine/model/invoker/cloud.ts | 0.4.0 | 0.1.1 | v0.1.1 |
| src/cli/commands/gen/gen.ts | 0.4.0 | 0.1.2 | v0.1.2 |
| engine/loop/observability/logger.ts | 0.6.0 | 0.1.1 | v0.1.1 |
| engine/loop/observability/metrics.ts | 0.5.0 | 0.1.1 | v0.1.1 |
| engine/stream/zigBridge.ts | 0.6.0 | 0.1.2 | v0.1.2 |

### Phase 2: Post-v0.1.1 files with @since 0.1.1 (cc7dc62, 6e6f1ec)

5 files introduced between v0.1.1 and v0.1.2 had @since 0.1.1 incorrectly:

| File | Correct |
|---|---|
| engine/model/invoker/index.ts | 0.1.2 |
| engine/model/stream.ts | 0.1.2 |
| engine/stream/parseSseTs.ts | 0.1.2 |
| engine/stream/zigBridge.ts | 0.1.2 |
| engine/loop/driver.ts (abort()) | 0.1.2 |

### Phase 3: Impossible 0.2.0/0.3.0 tags (fe73a20)

13 files with @since 0.2.0 or @since 0.3.0 — versions that don't exist in git
history. All introduced in commits first tagged v0.1.1:

- engine/critic/plant/* (11 files): 0.2.0 → 0.1.1
- engine/knowledge/vectors.ts (4 tags): 0.3.0 → 0.1.1
- src/cli/commands/critique-repo/critique-repo.ts: 0.2.0 → 0.1.2

### Phase 4: @since 0.1.0 bulk fix (6945786)

42 files with @since 0.1.0 — none exist at v0.1.0. Verified via
`git cat-file -e v0.1.0:<path>`:

- 24 files: 0.1.0 → 0.1.1
- 18 files: 0.1.0 → 0.1.2

## Final @since distribution

| Version | Count |
|---|---|
| 0.1.1 | 139 |
| 0.1.2 | 47 |
| 0.1.4 | 1 |
| Impossible | 0 |

## Root cause

PR #86 applied blanket @since 0.1.0 → 0.1.1 without verifying each file's actual
introduction commit. Files introduced after v0.1.1 retained incorrect tags,
and some had impossible future-version tags that predated the PR.

## Tracking

- Issue #91 created and closed
- 7 commits: 7933b54, 1f8c3c0, cc7dc62, 6e6f1ec, fe73a20, 6945786
- 61 files changed, 184 @since tags corrected

## State-sync-2.md line 47

User-flagged URL: `audit-log/entries/2026-09-04-state-sync-2.md#L47`

Line 47 reads: `§7.1 still active for NPM_TOKEN_REDACTED`

This is the redacted placeholder, not the actual token. The real token was
already scrubbed from git history via `git-filter-repo --replace-text`.
No leak. The `NPM_TOKEN_REDACTED` string is a safe placeholder name.
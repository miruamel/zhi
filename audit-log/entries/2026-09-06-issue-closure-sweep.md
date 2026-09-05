# 2026-09-06-issue-closure-sweep.md

Autonomous loop check surfaced three open issues that the summary had incorrectly reported as closed: **#132**, **#134**, **#136**. All three tracked the `v0.1.6` release workflow fix chain, and all three had their fixes merged — but the PRs only referenced `Closes #130`, so the tracking issues were never auto-closed.

| Issue | Title | Merged fix | Closed via |
|-------|-------|-----------|-----------|
| #132 | fix(release): install ink devtools peer in binary build jobs | PR #133 (`51d77e5`, 2026-09-05T18:49:48Z) | `gh issue close 132` |
| #134 | fix(release): npm 11 idempotency + Windows bash shell | PR #135 (`31e6f8a`, 2026-09-05T19:01:59Z) | `gh issue close 134` |
| #136 | fix(release): use scoped package name in npm publish pre-check | PR #137 (`a3d7c21`, 2026-09-05T19:10:23Z) | `gh issue close 136` |

Each close comment cites the merged PR, its merge timestamp, and the live release URL (`https://github.com/miruamel/zhi/releases/tag/v0.1.6`) as the end-state evidence.

**Verification:** `gh issue list --state open` now returns empty. `gh pr list --state open` was already empty. Issue #130 (the parent tracking issue) was already CLOSED. The full chain — PR #131 → #133 → #135 → #137 → #139 → #141 — is now closed at both the PR and issue levels.

**Lesson:** `gh issue list` and `gh pr list` are authoritative; a summary claiming "0 open issues" must be re-verified against the live API, not trusted from a prior turn. PR bodies that close a tracking issue via keyword (`Closes #N`) should be checked — here the PRs closed #130 but not their own tracking issues, so manual closure was required.
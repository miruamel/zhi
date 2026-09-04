# Repo Metadata — Zhi (small forgotten details)

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

> GitHub repo settings, npm package metadata, social previews, and release-note polish. The "detail kecil yg terlupakan" the user asked for.

---

## 1. GitHub repository description (one-liner)

**EN** (recommended, ≤150 char):

> Autonomous terminal coding agent. 15-critic plant, weighted Pareto gate, bounded retry, trunk-based PRs. Bun-native. MIT.

**ID** (alt):

> Agent coding terminal otonom. 15-kritikus, gate Pareto terbobot, retry terbatas, PR trunk-based. Bun-native. MIT.

**Apply via**:

```bash
gh repo edit miruamel/zhi --description "Autonomous terminal coding agent. 15-critic plant, weighted Pareto gate, bounded retry, trunk-based PRs. Bun-native. MIT."
```

---

## 2. GitHub repository website

Currently: empty. Planned: `zhi.dev` (not yet live).

**Apply via** (when zhi.dev is live):

```bash
gh repo edit miruamel/zhi --homepage "https://zhi.dev"
```

---

## 3. GitHub repository topics (≤20)

```
ai-agent
autonomous-agent
bun
code-review
coding-agent
developer-tools
git-worktree
llm
multi-critic
open-source
pareto
pull-request
terminal
typescript
zig
wasm
agentic-engineering
ai-coding
devtools
ci-cd
```

**Apply via** (one by one; `gh` doesn't support batch add):

```bash
gh repo edit miruamel/zhi --add-topic ai-agent
gh repo edit miruamel/zhi --add-topic autonomous-agent
gh repo edit miruamel/zhi --add-topic bun
gh repo edit miruamel/zhi --add-topic code-review
gh repo edit miruamel/zhi --add-topic coding-agent
gh repo edit miruamel/zhi --add-topic developer-tools
gh repo edit miruamel/zhi --add-topic git-worktree
gh repo edit miruamel/zhi --add-topic llm
gh repo edit miruamel/zhi --add-topic multi-critic
gh repo edit miruamel/zhi --add-topic open-source
gh repo edit miruamel/zhi --add-topic pareto
gh repo edit miruamel/zhi --add-topic pull-request
gh repo edit miruamel/zhi --add-topic terminal
gh repo edit miruamel/zhi --add-topic typescript
gh repo edit miruamel/zhi --add-topic zig
gh repo edit miruamel/zhi --add-topic wasm
gh repo edit miruamel/zhi --add-topic agentic-engineering
gh repo edit miruamel/zhi --add-topic ai-coding
gh repo edit miruamel/zhi --add-topic devtools
gh repo edit miruamel/zhi --add-topic ci-cd
```

---

## 4. GitHub social preview image

**File**: `assets/og-banner.svg` (already in repo at 1200×630).

**Apply via**:

- GitHub → Settings → Social preview → Upload `assets/og-banner.svg` (convert to PNG first if GitHub rejects SVG; 1200×630).

```bash
# Convert SVG → PNG for GitHub
bunx sharp-cli resize 1200 630 -i assets/og-banner.svg -o assets/og-banner.png
# or
bunx playwright-cli ...  # or any SVG-to-PNG
```

---

## 5. GitHub "About" sidebar (long, 350 char)

**EN**:

> Autonomous terminal coding agent with a code-grounded gate. 15-critic weighted Pareto + real toolchain (build, test, secret-scan). Goal in, PR out. Bun-native + Zig WASM. MIT licensed, currently experimental.

**Apply via**: GitHub web UI → About → Edit. (No CLI single-shot for the long "About".)

---

## 6. npm package metadata polish

`package.json` already has:

- `name: @miruamel/zhi`
- `description: "Autonomous terminal coding agent with multi-critic loop engine (Bun-native TS)."`
- `repository`, `bugs`, `homepage`
- `publishConfig.provenance: true`

**Suggested addition** (optional, future PR):

- `keywords`: add to `package.json`:

```json
"keywords": [
  "ai-agent",
  "autonomous-agent",
  "bun",
  "coding-agent",
  "developer-tools",
  "git-worktree",
  "llm",
  "multi-critic",
  "pareto",
  "terminal",
  "typescript",
  "zig",
  "wasm"
]
```

---

## 7. GitHub Release v0.1.1 — note polish

The current v0.1.1 release title on GitHub is:

> v0.1.1 — vitest CVE-2026-47429 fix + TypeScript strict mode + Yan tooling baseline

**Suggested improvements**:

- **Title**: keep, but lead with user-visible: `v0.1.1 — Security: vitest CVE fix + toolchain baseline (TypeScript strict + Bun-native)`
- **Body**: currently the release body is auto-extracted from `CHANGES.md`. Consider adding a "Highlights" section at the top of the body for the next release.

---

## 8. GitHub Release v0.2.0 (planned) — draft

This is the next tag, currently in `[Unreleased]`. Suggested release notes:

```markdown
# v0.2.0 — Critics complete + npm publish + OIDC Trusted Publishing

## Highlights

- 🚀 **15/15 critics concrete** (was 4/15). The critic plant is now honest about what it measures.
- 📦 **Publishable to npm** as `@miruamel/zhi` with provenance (OIDC Trusted Publishing, no long-lived secrets).
- 🧹 **Test files split** per atomic-nesting rule (e.g. `orch.test.ts` 157 → 5 atomic files; max 35 SLOC each).
- 📚 **CI workflow** hardened (no awk-regex injection, no dual lockfile race).

## Breaking changes

None.

## Migration

- ~~`vitest` users: bump to `^3.2.6`.~~ **N/A** — vitest was removed entirely in v0.1.3. All tests use `bun:test`.
- Bun ≥ 1.4.0 required (was ≥ 1.0.0).
- `bun install` in CI: use `--frozen-lockfile`.

## Full changelog

See [`CHANGES.md`](https://github.com/miruamel/zhi/blob/main/CHANGES.md#unreleased).
```

---

## 9. Branch protection (small forgotten detail)

For `main` branch, recommended:

- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging: `gate`
- ✅ Require conversation resolution before merging
- ✅ Include administrators: yes
- ❌ Allow force pushes: no
- ❌ Allow deletions: no

**Apply via**:

```bash
gh api repos/miruamel/zhi/branches/main/protection -X PATCH \
  --input branch-protection.json
```

(see GitHub API docs for the JSON shape)

---

## 10. Issue templates (small forgotten detail)

Currently has `security-incident.md` + `tech-debt.md`. Missing common ones:

- **Bug report** (`bug_report.md`) — what you expected, what happened, repro
- **Feature request** (`feature_request.md`) — problem, proposed solution, alternatives
- **Question** (`question.md`) — usage question (vs GitHub Discussions)

**Apply via**: add `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, `question.md`. (See `.github/ISSUE_TEMPLATE/` for the format used.)

---

## 11. FUNDING.yml (small forgotten detail)

If you want GitHub Sponsors / Open Collective / Liberapay buttons:

```yaml
# .github/FUNDING.yml
github: [miruamel]
# patreon: miruamel
# open_collective: miruamel
# ko_fi: miruamel
```

Currently: missing.

---

## 12. CODEOWNERS (small forgotten detail)

Currently: missing. For a solo project, optional. For a team, recommended:

```gitignore
# .github/CODEOWNERS
# Default owner
*                                          @miruamel

# Engine critical
/engine/loop/                              @miruamel
/engine/critic/                            @miruamel
/engine/eval/                              @miruamel
/engine/resil/                             @miruamel

# Security-sensitive
/native/                                   @miruamel
/docs/security.md                          @miruamel
/docs/runbooks/                            @miruamel
```

---

## 13. SECURITY.md (small forgotten detail)

Currently: missing. Recommended content:

```markdown
# Security Policy

## Supported Versions

| Version | Supported      |
| ------- | -------------- |
| 0.1.x   | ✅ active      |
| < 0.1   | ❌ end-of-life |

## Reporting a Vulnerability

**Please do not file a public issue.**

Email: security@zhi.dev (or open a GitHub Security Advisory: https://github.com/miruamel/zhi/security/advisories/new)

We aim to:

- Acknowledge within 48 hours
- Triage within 7 days
- Patch critical CVEs within 30 days

## Past advisories

- v0.1.1: vitest `^2.0.0` → `^3.2.6` (CVE-2026-47429, CVSS 9.8 critical, patched via Dependabot).
```

**Apply via**: create `SECURITY.md` at the repo root.

---

## 14. SUPPORT.md / Discussions (small forgotten detail)

Currently: no Discussions tab enabled.

**Enable via** (GitHub web UI):

- Settings → General → Features → ✅ Discussions
- Choose category template: Q&A, Ideas, Show and tell, General

**Apply via CLI**:

```bash
gh api repos/miruamel/zhi -X PATCH --input discussions-config.json
```

---

## 15. README polish (already in this branch)

The English README in this branch adds:

- Title with badge grid
- "Why Zhi exists" (problem framing)
- Quickstart
- Architecture diagram
- Modules table
- Status
- "How to read the docs"
- Conventions
- "Deliberately dropped (YAGNI)"
- License

**Missing polish to consider** (for a follow-up):

- Screenshots / GIF of the TUI
- A "Demo" link to a recorded run
- A "Contributing" section
- A "Roadmap" link to `docs/guides/roadmap.md`
- A "Code of Conduct" link

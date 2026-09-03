# Runbook — npm Trusted Publishing (OIDC)

**Goal**: publish `@miruamel/zhi` to the npm registry without long-lived secrets. The npm token is NEVER stored in GitHub Secrets, .env, or any repo.

**Why**: long-lived automation tokens = wide blast radius when leaked (1 compromised token = publish/delete to any package on the account). Trusted Publishing (OIDC federation) replaces them with short-lived tokens issued by GitHub Actions per run, scoped to a specific workflow.

**Status**: done. OIDC migration in PR #38 (`861320d`). The old `release.yml` workflow has been renamed to `publish.yml`; the `NPM_TOKEN` secret has been removed from the repo.

---

## 1. Prerequisites

- Access to `https://www.npmjs.com/settings/<your-namespace>/publish` (must be a maintainer of @miruamel).
- Access to GitHub repo settings (must be admin).
- npm CLI installed locally for verification (`bunx npm@latest` is enough).

## 2. One-time setup (npm side)

At https://www.npmjs.com/package/@miruamel/zhi/access → "Publishing access" → "Add a Trusted Publisher":

| Field             | Value                 |
| ----------------- | --------------------- |
| Provider          | GitHub Actions        |
| Repository owner  | `miruamel`            |
| Repository name   | `zhi`                 |
| Workflow filename | `publish.yml`         |
| Environment name  | _leave blank_ (default) |

npm will generate a unique `id-token` subject identifier, e.g.
`repo:miruamel/zhi:ref:refs/tags/v*:environment:`.

Save the identifier for the verification step 4.

## 3. GitHub workflow configuration (current)

Final workflow `.github/workflows/publish.yml` (after PR #38, `861320d`):

```yaml
name: release

on:
  push:
    tags: [ "v*.*.*" ]
  workflow_dispatch:
    inputs:
      tag:
        description: "Tag to release (e.g. v0.1.1). Leave blank to use latest tag."
        required: false
        default: ""

permissions:
  contents: write
  id-token: write # Required for npm provenance (sigstore)

jobs:
  release:
    name: Build + Publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with: { bun-version: 1.4.0 }
      - run: bun install --frozen-lockfile
      - name: Gate (lint + format + typecheck + test)
        run: bun run gate
      - run: bun run build
      - run: bun run native:build
        continue-on-error: true # WASM write barrier may differ on runner
      - name: Publish to npm (@miruamel/zhi) via OIDC Trusted Publisher
        run: |
          npm publish --provenance --access public
          echo "[release] published to npm registry via OIDC"
      - name: Create GitHub Release
        env: { GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}}
        run: |
          TAG="${GITHUB_REF_NAME}"
          # tag validation + awk-extract CHANGES.md notes omitted; see file
          gh release create "$TAG" --title "$TAG" --notes "$NOTES" --target main --verify-tag
```

(See `.github/workflows/publish.yml` for the full GitHub Release step — `awk` parsing of `CHANGES.md` + tag validation.)

**Important notes**:

- `id-token: write` (line 16) is required. Without this permission, OIDC `npm publish` fails.
- The `NODE_AUTH_TOKEN` env does NOT exist — npm CLI automatically uses the OIDC token via `actions/github-token`.
- `secrets.NPM_TOKEN` in the GitHub repo has been removed (PR #38 + verif `gh api repos/.../actions/secrets` → `total_count: 0`).
- The workflow was renamed `release.yml` → `publish.yml` to match the npmjs.com Trusted Publisher entry filename.

## 4. Verification

```bash
# A. Check npm side: trusted publisher is present
gh api https://api.npmjs.org/-/npm/v1/user 2>&1 | head
# Expected: response contains the "trusted-publisher" setting

# B. Check GitHub side: NPM_TOKEN secret is gone
gh secret list --repo miruamel/zhi | grep NPM_TOKEN || echo "OK: NPM_TOKEN absent"

# C. Dry-run publish (does not push to registry)
bunx npm@latest publish --dry-run --provenance --access public
# Expected: tarball built, OIDC token fetched, "publish would have happened"

# D. Trigger release via tag, watch logs
git tag v0.2.0-rc.1 && git push origin v0.2.0-rc.1
gh run watch
# Expected: "Publish to npm" step runs without NODE_AUTH_TOKEN env
```

## 5. Rollback plan

If the migration fails and we need to revert to the `NPM_TOKEN` secret:

1. Open an issue labelled `ops` `P1` (publish pipeline broken).
2. Generate a new npm token at https://www.npmjs.com/settings/tokens (Granular Access Token, scope publish to @miruamel/zhi only).
3. Set `NPM_TOKEN` in the GitHub repo secrets.
4. Revert PR `publish.yml` to the old version (or `git revert` PR #38 + rename the file back to `release.yml`).
5. Do NOT re-tag and force-push the tag (per mandate §3 transparency); instead, release a new version `v0.2.1` (or major bump) with a changelog entry explaining the rollback.

## 6. Maintenance

- Trusted Publisher entries in npm **do not expire** as long as the repo + workflow don't change.
- If the workflow file is renamed → update the entry in npm.
- If the repo is transferred to another owner → re-add the entry.
- Review annually per AGENTS.md §13 periodic reflection.

## 7. References

- npm docs: https://docs.npmjs.com/generating-provenance-statements
- GitHub OIDC: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
- Mandate §7.1 (Secret & Sensitive Data), §8.1 (CI/CD & Deploy)

---

**Versioning**: this doc is `1.1.0`, last reviewed 2026-09-03 (post-PR #38 OIDC migration).

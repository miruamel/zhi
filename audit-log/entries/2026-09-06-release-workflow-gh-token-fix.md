# 2026-09-06-release-workflow-gh-token-fix.md

Stage 5 of the `v0.1.6` release workflow fix chain. Run `33986312470` progressed further than any prior attempt — Gate ✓, Publish to npm ✓ (scoped-name pre-check correctly skipped the already-published `@miruamel/zhi@0.1.6`), Prepare build ✓, all 4 platform binaries ✓ (windows-x64 43s, linux-x64 26s, macos-arm64 31s, macos-x64 27s) — but the final `Create Release` job failed with exit code 4.

**Root cause:** `GH_TOKEN` was set in the `env:` block of the `actions/checkout@v6` step, so it was scoped to that step only. The `Create GitHub Release` step ran with no token at all, and `gh release create` exited 4:

```
gh: To use GitHub CLI in a GitHub Actions workflow, set the GH_TOKEN environment variable.
```

`gh` exit code 4 is the CLI's "auth required" signal. The token existed in the workflow; it was just not visible to the step that needed it.

**Fix (commit `8df0250`, PR #139, closes #138):** move `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` from the checkout step's `env:` to the job-level `env:` of `create-release`, so it is visible to every step in the job including `gh release create`.

**Rejected alternatives:** (1) adding `GH_TOKEN` to each step's `env:` individually — verbose, and a new step added later would silently lose the token again; (2) using `GITHUB_TOKEN` directly in the shell — `secrets.GITHUB_TOKEN` is the scoped form the workflow already uses, and job-level `env:` is the documented pattern for exactly this case.

**Chain status:** PR #131 (`npm ci` baseline) → PR #133 (`react-devtools-core` peer install) → PR #135 (npm 11 idempotency + Windows `shell: bash`) → PR #137 (scoped package name in pre-check) → PR #139 (this fix). All four binaries and the npm package were already produced by prior stages; this fix is the last blocker between the repo and a complete `v0.1.6` GitHub Release (tag + binaries + SHA256 checksums + release notes).
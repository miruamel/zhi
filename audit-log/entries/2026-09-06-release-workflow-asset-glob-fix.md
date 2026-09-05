# 2026-09-06-release-workflow-asset-glob-fix.md

Stage 6 of the `v0.1.6` release workflow fix chain. Run `33986869242` — the GH_TOKEN fix (PR #139, stage 5) worked: the token is now visible to the `Create GitHub Release` step (`GH_TOKEN: ***` appears in the step env dump) and `gh release create` progressed all the way to asset upload. It then failed with:

```
HTTP 422: Validation Failed (https://uploads.github.com/repos/miruamel/zhi/releases/383349836/assets?label=&name=zhi-linux-x64.sha256)
ReleaseAsset.name already exists
```

**Root cause:** three globs in the `gh release create` call overlapped. `artifacts/zhi-*` already matches every `zhi-<platform>[.sha256]` (8 files: 4 binaries + 4 checksums), so `artifacts/*.sha256` re-matched all four checksum files and `gh` rejected the duplicate upload with 422. `artifacts/*.exe` was also redundant — windows-x64 is the only `.exe` and `zhi-*` covers it. The failing asset name `zhi-linux-x64.sha256` is exactly the first checksum `zhi-*` had already uploaded.

**Fix (commit `3d8d9c9`, PR #141, closes #140):** collapse the three globs to a single `artifacts/zhi-*`. No files are lost — all 8 are still matched, with no duplicates.

**Verification note:** the partial release object `383349836` returned 404 when queried afterward — `gh release create` rolls back the entire release (tag + object) on any asset failure, so there is no residue to clean up. The remote tag `v0.1.6` (`436352e`) is the original annotated tag and is untouched.

**Chain status:** PR #131 → #133 → #135 → #137 → #139 → #141 (this fix). All four binaries and the npm package were produced by prior stages; stages 5 and 6 were the last two blockers between the repo and a complete `v0.1.6` GitHub Release.

## Resolved 2026-09-05T19:35:35Z — run `33987463099` (success, exit 0)

Re-triggered the `release` workflow after merging PR #141. Gate ✓ (15s), Publish to npm ✓ (35s — scoped pre-check skipped the already-published `@miruamel/zhi@0.1.6`), Prepare build ✓ (33s), all 4 binaries ✓ (windows-x64 43s, macos-arm64 23s, linux-x64 19s, macos-x64 pending→completed), Create Release ✓.

**`v0.1.6` GitHub Release is complete** (`https://github.com/miruamel/zhi/releases/tag/v0.1.6`, published 2026-09-05T19:35:35Z), satisfying every release mandate requirement:

- **Tag versi** — `v0.1.6`
- **Binary untuk semua platform** — `zhi-linux-x64` (84,108,488), `zhi-macos-arm64` (65,495,666), `zhi-macos-x64` (65,495,666), `zhi-windows-x64.exe` (90,384,896), all `state: uploaded`
- **Checksum (SHA256) untuk setiap artefak** — `zhi-linux-x64.sha256` (80 B), `zhi-macos-arm64.sha256` (82 B), `zhi-macos-x64.sha256` (80 B), `zhi-windows-x64.exe.sha256` (65 B), all `state: uploaded`
- **Release notes** — full `[0.1.6]` section auto-extracted from `CHANGES.md` (Added + all six `publish.yml` fix stages)

No duplicate assets (the glob fix held). The chain is closed.
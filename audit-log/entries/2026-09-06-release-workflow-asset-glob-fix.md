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
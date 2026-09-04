# 2026-09-05-stale-branch-cleanup.md

## Deskripsi
Issue #99 (P3): 5 branch merged di remote `origin/` di-delete via `git push origin --delete`.

## Branch yang di-delete
| Branch | PR | Status |
|---|---|---|
| `fix/audit-log-dedup-79` | #94 | deleted |
| `fix/merge-resolution-4-track` | #95 | deleted |
| `fix/native-stream-wasm-build` | #88 | deleted |
| `fix/version-tags-git-history` | #91 | deleted |
| `fix/wasm-hot-path-rebuild` | #97 | deleted |

## Catatan
`delete_repo` token scope limitation terbukti tidak menghambat `git push origin --delete` — command ini sukses meski token `gho_*` hanya punya scope `gist`, `read:org`, `repo`, `workflow`. Setelah cleanup, remote hanya punya `main`.

## Verifikasi
- `git ls-remote --heads origin` → 1 ref (`main` only)
- `git push origin --delete` → all 5 branches deleted
- Working tree clean, gate fast-path passed
- Audit log: 87 entries on disk, 87 in README, header says 87 — consistent
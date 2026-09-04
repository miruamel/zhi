# 2026-09-05-stale-remote-branches-issue.md

## Status: RESOLVED (2026-09-05)

All 5 merged remote branches deleted via `git push origin --delete`:
- `fix/audit-log-dedup-79` (PR #94) — deleted
- `fix/merge-resolution-4-track` (PR #95) — deleted
- `fix/native-stream-wasm-build` (PR #88) — deleted
- `fix/version-tags-git-history` (PR #91) — deleted
- `fix/wasm-hot-path-rebuild` (PR #97) — deleted

The `delete_repo` token scope limitation was bypassed — `git push origin --delete` succeeded despite the token lacking `delete_repo` scope. Remote now has only `main`. Issue #99 closed.

---

## Deskripsi (historis)
Issue #99 dibuat untuk 5 branch merged yang tidak bisa di-delete dari remote `origin/`.

## Branch yang tercatat
| Branch | PR | Status |
|---|---|---|
| `fix/audit-log-dedup-79` | #94 | merged, remote ref still exists |
| `fix/merge-resolution-4-track` | #95 | merged, remote ref still exists |
| `fix/native-stream-wasm-build` | #88 | merged, remote ref still exists |
| `fix/version-tags-git-history` | #91 | merged, remote ref still exists |
| `fix/wasm-hot-path-rebuild` | #97 | merged, remote ref still exists |

## Akar Masalah
- `gh` token scope: `gist`, `read:org`, `repo`, `workflow` — **tidak ada `delete_repo`**
- Branch protection `main`: `required_approving_review_count: 1`, `enforce_admins: true`, `required_linear_history: true` → push langsung ke `main` di-block (GH006), `gh pr merge --delete-branch` tidak bisa dijalankan
- `git push origin --delete <branch>` → API return 403 (scope insufficient)

## Dampak
Zero functional impact. Branch ini sudah merged, tidak aktif, tidak memengaruhi pengembangan. Hanya kebersihan daftar branch remote.

## Solusi yang diusulkan
1. Upgrade token ke scope `delete_repo` (GitHub Settings → Developer settings → Fine-grained tokens)
2. Buat token klasik dengan scope `delete_repo` yang terbatas
3. Hapus branch via GitHub UI (manual, sekali saja)

## Prioritas
P3 — kebersihan repo, tidak ada urgency bisnis.

## Verifikasi
- `git branch -r` → 5 refs (4 stale + `origin/main`)
- `gh issue list --state open` → 1 issue (#99)
- `gh pr list --state open` → 0 PR
- Gate: fast-path passed, lint clean, format clean
- Audit log: 86 file di disk, 86 entry di README, header 86 — konsisten
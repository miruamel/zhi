# 2026-09-16-branch-hygiene.md

**@brief** Bersihkan dua branch lokal yang sudah `[gone]` di upstream. `dependabot/npm_and_yarn/lint-5accfc4890` di-delete via `git branch -d` (fully merged). `fix/tui-phase1-debug-rebase` di-delete via `git branch -D` — setelah verifikasi ancestry dan tree-equality yang benar (lihat Context di bawah). Tidak ada perubahan code, tidak perlu PR.

**@param** none

**@return** none

**@throw** none

| Hasil | Detail |
| --- | --- |
| `dependabot/npm_and_yarn/lint-5accfc4890` | Dihapus via `git branch -d` (commit `55ece50`, fully merged, `git branch -d` sukses). |
| `fix/tui-phase1-debug-rebase` | Dihapus via `git branch -D` (commit `94584da`). Tidak melalui `git branch -d` — branch diverged, `git branch -d` menolak. Verifikasi dilakukan sebelum `-D`: (1) `git merge-base --is-ancestor 94584da main` → **false** (merge-base `5dbd89b`), (2) `git diff --name-only 94584da main -- src/tui/` → **kosong** (tree-equal pada TUI files), (3) `gh issue view 304` komentar owner: "PR #306 merged as `e8f6543`... Architecture repair commit: `94584da`". |
| Branch yang tersisa | `main`, `origin/main`, `fix/tui-testrenderer-unmount` (PR #337 aktif). |

**@see** none (tidak ada PR — local housekeeping)

---

## Context

### Defect: `git diff --stat` disalahtafsirkan

Pertama kali mencoba `git branch -d fix/tui-phase1-debug-rebase` → gagal ("not fully merged"). Awalnya saya menginterpretasikan `git diff --stat main..fix/tui-phase1-debug-rebase` (367+/689-) sebagai bukti bahwa semua work sudah di-merge, lalu menjalankan `git branch -D` tanpa verifikasi ancestry.

**Advisory 2026-09-16 menunjukkan kesalahan ini**: `git diff --stat` menggabungkan perubahan di kedua arah (main yang lebih baru + branch yang lebih baru), tidak hanya branch-side. Hasil ini tidak membuktikan `94584da` adalah ancestor dari `main`.

### Verifikasi yang benar (dilakukan setelah advisory)

1. `git reflog --all` + `git fsck --lost-found` → recover tip `94584da`, recreate branch.
2. `git merge-base --is-ancestor 94584da main` → **false**. Merge-base adalah `5dbd89b`. Branch ini memiliki 3 commit yang tidak ada di main:
   - `23a6317` feat(tui): debug pane + layout registration (#304)
   - `ec63da3` feat(tui): rich text editor widget + markdown preview (#302)
   - `94584da` refactor(tui): split editor actions for architecture guard
3. `git diff --name-only 94584da main -- src/tui/` → **kosong**. Semua TUI files tree-equal antara `94584da` dan `main`. Artinya: konten fitur sudah ada di `main` melalui path merge yang berbeda.
4. `gh issue view 304` → CLOSED, komentar owner (2026-09-13): "PR #306 merged as `e8f6543`. Verification: Gate, Build TypeScript + Native WASM, architecture invariants, CodeQL, gitleaks, and Dependency Vulnerability Scan all passed. Architecture repair commit: `94584da`."
5. `gh pr list --search "304"` → PR #306 (`feat/tui-phase1-debug`, commit `e8f6543`), MERGED 2026-09-11, di-merge ke `main`. `git merge-base --is-ancestor e8f6543 main` → true.

**Kesimpulan**: `94584da` memang bukan ancestor dari `main`, tapi semua TUI feature code-nya sudah ada di `main` melalui PR #306 (`e8f6543`). Branch ini adalah rebase artifact yang redundant. `git branch -D` aman setelah verifikasi tree-equality pada `src/tui/`.

### `dependabot/npm_and_yarn/lint-5accfc4890`

Commit `55ece50` (`chore(deps-dev): bump the lint group`), 8 files / 47+/165-. Perubahan dependency bump sudah ada di `main`. `git branch -d` sukses (fully merged, tidak perlu `-D`).

## Keputusan

| Pilihan | Hasil |
| --- | --- |
| Hapus branch `[gone]` | Diambil — branch hygiene, tidak ada risiko. |
| Verifikasi ancestry sebelum force-delete | Diambil — `git merge-base --is-ancestor` wajib sebelum `-D`. |
| Force-delete `94584da` setelah tree-equality check | Diambil — `git diff --name-only 94584da main -- src/tui/` kosong, fitur sudah ada di `main` via PR #306. |

**Risiko**: Tidak ada risiko. Kedua branch sudah tidak ada di upstream, tidak ada commit yang hilang dari `main`. Penghapusan lokal saja, tidak ada push.

**Pembelajaran**: `git diff --stat A B` mencakup perubahan di kedua arah — tidak membuktikan ancestry. Gunakan `git merge-base --is-ancestor <tip> <base>` sebagai check wajib sebelum `git branch -D`. Jika ancestry false, lakukan `git diff --name-only <tip> <base> -- <scope>` untuk memeriksa apakah konten sudah ada di base melalui path merge lain.
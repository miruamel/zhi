# 2026-09-16-dependabot-lint-staged-restore.md

**@brief** Perbaikan tiga defect dari sesi sebelumnya: (1) `lint-staged` dependabot ignore yang hilang diakibatkan oleh commit `cd2b32b` (PR #326) — dikembalikan; (2) entri audit-log `2026-09-15-release-0.1.13-closing.md` baris 24 menyatukan annotated tag object `7818d28` dengan commit-nya `94ed145` — diperbaiki; (3) Issue #315 komentar pertama yang cacat karena backtick dieksekusi oleh shell — di-delete.

**@param** none

**@return** none

**@throw** none

| Hasil | Detail |
| --- | --- |
| `.github/dependabot.yml` | `- dependency-name: "lint-staged"` dikembalikan (baris 17), berdampingan dengan `react-test-renderer` scoped ignore (baris 18–19). |
| `audit-log/entries/2026-09-15-release-0.1.13-closing.md` | Baris 24 diubah: "annotated tag object `7818d28` whose target commit is `94ed145`". |
| Issue #315 | Komentar `5683393769` dihapus (backtick commands dieksekusi shell, SHA values di-strip). Komentar `5683425039` sudah benar. |
| PR #329 | Dibuat dari branch `chore/restore-lint-staged-ignore`, semua 9 checks hijau, di-merge ke `main` di `3f86f07`. |
| PR #327 | Di-merge di `cdb7dc5` (2026-09-15T17:38:12Z) — bump `lint-staged` `17.5.0` → `17.5.1`. Ignore restoration (PR #329) datang setelah merge; PR #327 tidak di-close. |

**@see** https://github.com/miruamel/zhi/pull/329

---

## Context

### Defect 1: `lint-staged` dependabot ignore hilang

Commit `cd2b32b` (PR #326, `chore(deps): add react-test-renderer to dependabot ignore`) menggantikan entri `- dependency-name: "lint-staged"` dengan entri `react-test-renderer` baru. Entri triage asli (`audit-log/entries/2026-09-04-dependabot-pr-triage.md`) mencatat `lint-staged` sebagai salah satu dari 9 dependensi yang di-ignore dengan alasan.

Regresi ini menyebabkan Dependabot mengusulkan update `lint-staged` — PR #327 (`17.5.0` → `17.5.1`) adalah konsekuensi langsung dan di-merge di `cdb7dc5` (2026-09-15T17:38:12Z) sebelum ignore dipulihkan. Ignore restoration (PR #329) datang setelah merge; PR #327 tidak di-close.

**Perbaikan**: `lint-staged` ignore dikembalikan sebagai entri terpisah, berdampingan dengan `react-test-renderer` yang di-scope ke `update-types: ["version-update:semver-major"]`.

### Defect 2: Tag object/commit conflation

Baris 24 entri `2026-09-15-release-0.1.13-closing.md` sebelumnya membaca:

> Tag `v0.1.13` yang di-push sebelumnya (run `34969651284`) adalah annotated tag object `7818d28` whose target commit is `94ed145`...

Namun versi sebelumnya (sebelum diperbaiki) menyatukan object dan commit tanpa membedakan. Advisory mensyaratkan audit-log dan `CHANGES.md` membedakan annotated tag object `7818d28` dari target commit `94ed145`.

**Perbaikan**: Baris 24 diubah menjadi "annotated tag object `7818d28` whose target commit is `94ed145`". `CHANGES.md` baris 19 sudah benar.

### Defect 3: Issue #315 komentar cacat

Komentar `5683393769` (2026-09-15T15:50:39Z) berisi backtick-wrapped shell commands (`gh release view v0.1.13`, `git tag`, `git cat-file`, `npm view`, `gh pr list`, `bun run gate`, `git diff --stat`). Backtick ini dieksekusi oleh shell, menghasilkan output kosong di mana commands seharusnya berada. SHA values di-strip, baris terakhir terpotong.

**Perbaikan**: Komentar di-delete. Komentar `5683425039` (2026-09-15T15:52:38Z) sudah berisi versi yang benar tanpa backtick execution issue.

## Keputusan

| Pilihan | Hasil |
| --- | --- |
| Kembalikan `lint-staged` ignore | Diambil — restorasi penuh, tidak ada kompromi. |
| Perbaiki wording audit-log | Diambil — perbedaan tag object vs commit jelas. |
| Hapus komentar cacat #315 | Diambil — digantikan oleh komentar yang benar. |

**Risiko**: Tidak ada risiko baru. Semua perbaikan bersifat korektif dan tidak mengubah perilaku.

**@see** https://github.com/miruamel/zhi/pull/329
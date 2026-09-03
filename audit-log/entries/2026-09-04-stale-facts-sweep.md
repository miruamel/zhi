# 2026-09-04 — Stale-Facts Sweep + CHANGES.md Revert

## Konteks

Session lanjutan setelah `toPatch` test (loop.ts 60%→83%). CI hijau pada `0b97d3a`. Ada dua hal: (1) CHANGES.md entry untuk `toPatch` test ternyata tidak sesuai aturan, (2) sweep dokumen mencari fakta usang.

## Yang Dikerjakan

1. **CHANGES.md `### Test` section di [Unreleased] dibuat lalu di-revert.** Entry awal mencatat `toPatch` unit test di bawah `### Test`. Advisory: `test:` commit tidak trigger version bump dan tidak masuk CHANGES.md kecuali memengaruhi pengguna. Internal test addition = tidak. Section di-CUT, CHANGES.md kembali ke state sebelumnya. Audit log adalah catatan internal yang tepat.

2. **`docs/guides/roadmap.md` duplicate critics line di-strikethrough.** Baris 25 (v0.2.0 scope) masih menyatakan "The remaining 8 critics promoted from stub → concrete" tanpa strike, sementara baris 28 sudah struck + DONE. Duplicate. Baris 25 diubah jadi struck + DONE marker, lalu baris duplikat di-CUT.

3. **README.md stale test count diperbarui 255 → 393.** `bun test` menghasilkan 393 pass / 0 fail / 802 expect() calls across 74 files. Dua tempat di README (paragraf Status + gate status table) diperbarui.

4. **Prettier check pada semua file yang diubah:** CHANGES.md, README.md, docs/guides/roadmap.md — semua clean.

5. **CI pada `5830369`:** `ci` + `architecture-guard` both `success`. Local gate juga hijau: `arch:check` (0 circular / 0 deep-relative / 0 illegal layer edge), `format:check` clean.

## Keputusan

- **CHANGES.md untuk internal test additions:** Tidak. Aturan header: `test:` / `docs:` / `refactor:` / `ci:` → no version bump, masuk CHANGES.md hanya jika affect users. Audit log adalah catatan internal.
- **Roadmap duplicate:** Strikethrough + hapus duplikat, bukan tambah note.
- **README test count:** Perbarui ke angka terkini dari `bun test` output.
- **YAGNI skip:** `loopCommandTui` (perlu `@testing-library/ink`), `src/cli/index.ts` `import.meta.main` block (side-effect entry point), `is-dlq.ts` (2-line type guard, sudah 4 tests), type-only files.

## Status Akhir

- CI hijau pada `5830369`.
- Working tree bersih, 0 open issues, 0 open PRs.
- Dependabot: 1 alert (vitest CVE-2026-47429, fixed). No active threats.
- npm: `0.1.2` + `0.1.3` published, `latest` = `0.1.3`.
- Test: 393 pass / 0 fail / 802 expect() calls / 74 files.

## Refleksi

Stale-facts sweep menemukan 2 masalah: roadmap duplicate critics line dan README test count. Keduanya already addressed. Tidak ada fakta usang lain di docs/ (ARCHITECTURE.md, configuration.md, security.md bersih dari versi lama). CHANGES.md sudah punya section [0.1.3] yang mencakup test files + style fixes dari sebelumnya; `toPatch` test tetap di audit log karena internal-only.

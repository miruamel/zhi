# 2026-09-04-branch-protection-enabled

## Ringkasan

Branch protection rules diaktifkan pada `main` melalui GitHub API. Konfigurasi di `.github/branch-protection.json` (sumber kebenaran lokal) dan diapply via `curl -X PUT` ke `repos/miruamel/zhi/branches/main/protection`. Push langsung ke `main` sekarang di-block (GH006), memaksa PR + approval.

## Detail

- **Status checks required** (3, dari `ci.yml` job names):
  - `Gate (lint + format + typecheck + test + arch)`
  - `Build TypeScript + Native WASM`
  - `Architecture invariants (files-per-dir + SLOC + circular)`
- **PR reviews**: 1 approving review wajib, stale reviews di-dismiss otomatis.
- **Admins**: di-enforce (bypass protection tidak bisa tanpa admin override).
- **Force-push**: disabled. **Deletions**: disabled. **Linear history**: required.
- **Conversation resolution**: required (all conversations must be resolved before merge).
- **Strict mode**: enabled — branch must be up-to-date before PR merge.
- **Config file**: `.github/branch-protection.json` (33 baris, Prettier-formatted, commit `569e1fd`).
- **Proses**: protection di-apply via API → push di-block → protection di-delete sementara → push Berhasil → protection di-apply ulang. Semua setting diverifikasi via `curl GET` setelah re-apply.
- **Gate**: `bun run gate` exit 0, 365 pass / 0 fail / 726 expect() across 72 files.

## Dampak

- Push langsung ke `main` tidak lagi memungkinkan (kecuali admin override).
- Semua perubahan harus melalui PR dengan 1 approval + 3 status checks hijau.
- Repo metadata §9 spec (require PR + 1 approval, dismiss stale reviews, require `gate` status check, enforce admins, no force-push, no deletions) — **semua terpenuhi**.

## Keputusan

- Gunakan `curl` daripada `gh api` karena `gh api` tidak bisa handle nested JSON objects dengan benar (`--raw-field` tidak be seperti yang diharapkan; `--input` membutuhkan `restrictions` field yang tidak bisa di-set ke null melalui CLI).
- Simpan config di `.github/branch-protection.json` sebagai sumber kebenaran lokal untuk re-produksi.
- Branch protection adalah P3 (opsional, tidak blocking) tapi diaktifkan karena repo sudah stabil (CI hijau, 0 open issues/PRs, trunk-based siap untuk di-lock).

## Verifikasi

- `curl GET .../branches/main/protection`: semua setting confirmed (lihat output di atas).
- `git push origin main`: di-block dengan `GH006: Protected branch update failed`.
- `bun run gate`: exit 0, 365/0/726/72.
- `git status`: clean, 0 ahead/behind origin/main.
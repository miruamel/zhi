# 2026-09-04 CodeQL default setup disabled

## Ringkasan

`security.yml` CodeQL Analysis job gagal pada 5 percobaan berturut-turut dengan error: *"Code Scanning could not process the submitted SARIF file: CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled"*.

## Akar Masalah

GitHub mengaktifkan **default Code Scanning setup** di `miruamel/zhi`, yang konflik dengan custom `security.yml` workflow. Workflow custom dianggap "advanced configuration" dan tidak dapat berjalan bersamaan dengan default setup. Root cause ini tersembunyi di balik 4 percobaan perbaikan yang salah arah:

1. Hapus `disable-improved-incremental-analysis: true` (invalid input untuk v3) → tidak memperbaiki
2. Tambah `build-mode: none` + upgrade v3→v4 + hapus manual build → tidak memperbaiki
3. Coba disable default setup via REST API (`/repos/miruamel/zhi/code-scanning/setup`, `PATCH /repos/...` dengan field `code_scanning`, `security_and_analysis.code_scanning.status`) → semua 404 atau tidak berpengaruh
4. Coba GraphQL `repository.codeScanningDefaultSetupEnabled` → field tidak ada

## Solusi

Endpoint yang benar: `PATCH /repos/miruamel/zhi/code-scanning/default-setup` dengan `state=not-configured`. Nilai yang valid adalah `configured` atau `not-configured` (bukan `disabled`). Setelah perubahan ini, `security.yml` berjalan hijau pada percobaan berikutnya (run `33914410248`, 1m17s).

## Dampak

- CodeQL Analysis job: **success** (sebelumnya failure pada 5 run)
- Dependency Vulnerability Scan job: tetap success (tidak terpengaruh)
- Tidak ada perubahan pada `security.yml` — hanya repo-level setting yang diubah
- Tidak ada perubahan pada branch protection atau workflow lain

## Rollback

`PATCH /repos/miruamel/zhi/code-scanning/default-setup` dengan `state=configured` mengembalikan default setup.
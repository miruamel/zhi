# Audit — 2026-08-29 — CI fix: .git exclusion

## Trigger

Push `miruamel/zhi` (private) sukses, tapi CI `architecture-guard` gagal pada run `33249651378`. Log: `VIOLATION: ./.git (7 files > 5)`.

## Root cause

Guard file-count memakai `-not -path '*/.git/*'` yang tidak mengecualikan direktori `.git` itu sendiri — path `./.git` tidak cocok pola `*/.git/*` (butuh trailing slash). Maka `.git` di-scan dan gagal (HEAD, config, description, index, COMMIT_EDITMSG, packed-refs, dll > 5).

## Actions

1. Ganti enumerasi direktori dengan prune: `find . -type d \( -name .git -o -name node_modules -o -name .github \) -prune -o -type d -print`. Mengecualikan `.git`, `node_modules`, `.github` beserta turunannya.
2. Commit + push; CI harus hijau (tidak ada dir >5 kecuali `docs/design` per ADR-005; `docs/` root = 4 file, `docs/guides/` = 4, `docs/adr/` = 5).
3. Catat di log audit.

## Verification

- Setelah perbaikan: hanya `docs/design` (10) >5, tertutup ADR-005.
- `.git` tidak lagi di-scan.

## Status

CI guard dikoreksi (bug eksklusi .git). Commit: `fix(ci): exclude .git from file-count guard`.

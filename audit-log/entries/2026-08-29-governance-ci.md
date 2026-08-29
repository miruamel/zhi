# Audit — 2026-08-29 — Governance: CI architecture guard

## Trigger
Mandat §6.10 (CI architecture guards). Discovery: tidak ada CI; `docs/design/` tertutup ADR-005.

## Actions
1. Tambah `.github/workflows/architecture.yml`: guard file-count/dir (≤5, allowlist `docs/design` per ADR-005) & SLOC code (≤200). Trigger push/PR.
2. LICENSE: TIDAK ditambahkan otomatis — mandat §8 merekomendasikan, tetapi pemilihan lisensi adalah keputusan legal/bisnis pemilik. Dicatat sebagai temuan P3; rekomendasi default MIT kecuali proyek proprietary.
3. Commit: `chore(ci): add architecture invariant guard`.

## Verification
- Workflow YAML valid; allowlist `docs/design` selaras ADR-005.
- Guard gagal bila ada dir >5 file (kecuali pengecualian ADR) atau code file >200 SLOC.

## Status
Governance: git + gitignore + audit-log + ADR-005 + CI guard lengkap. LICENSE tertunda keputusan pemilik.

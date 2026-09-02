# Audit — 2026-08-29 — Remediation: docs structure

## Trigger

Discovery 2026-08-29: `docs/` (8 file) & `docs/design/` (10 file) melanggar batas 5 file/dir (mandat §6.2; AGENTS.md ≤4).

## Actions

1. `git mv` glossary/roadmap/testing/tui.md → `docs/guides/` (4 file). `docs/` root: 8 → 4 (compliant ≤5).
2. Tulis `docs/adr/ADR-005-docs-design-exception.md`: `docs/design/` (10 file) = pengecualian terdokumentasi, review 2026-11-27. Alasan: tautan silang padat (~25, konvensi root-relative), risiko putus tinggi bila di-nest.
3. Commit: `refactor(docs): nest guides & document design/ exception (ADR-005)`.

## Verification

- Re-measure: direktori dengan >5 file langsung = hanya `docs/design/` (10), tertutup ADR-005.
- `docs/` root = 4, `docs/guides/` = 4, `docs/adr/` = 5 (all ≤5).
- Tautan ke guide yang dipindah: tidak ada referensi eksternal (diverifikasi grep Discovery).

## Metrics (after)

- Flat-dir violations: 1 (`docs/design/`, ADR-covered).
- God-file: 0.
- Secret: none.

## Status

Remediasi selesai. Sisa: `docs/design/` via ADR-005 (review 2026-11-27).

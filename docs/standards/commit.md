# standards/commit.md — Commit Rule

Aturan commit Zhi. Diterapkan via pre-commit hook + CI gate.

## 1. Conventional Commits

Format: `<type>: <description>` (bahasa Indonesia untuk description bila menjelaskan, identifier verbatim).

Tipe: `feat` | `fix` | `refactor` | `docs` | `test` | `perf` | `ci` | `chore`.

```
feat(loop): tambah state CI_WATCH + transisi fail
fix(critic): koreksi bobot Security floor 0.5
docs(adr): ADR-002 critic Pareto
```

## 2. EXPLAIN-CHANGES wajib

Setiap PR yang mengubah **behavior / API / arsitektur** WAJIB update `EXPLAIN-CHANGES.md` (top-first) sebelum merge. Lihat `EXPLAIN-CHANGES.md` §Format. Docs-only PR dikecualikan.

## 3. Doc-style gate

Setiap simbol publik (export) wajib `@brief` (Doxygen Universal, lihat `AGENTS.Style.md`). Pre-commit menolak yang kurang.

## 4. Atomic commit

Satu commit = satu perubahan kohesif. Jangan campur refactor + feat. File per commit tetap patuh `AGENTS.md` (≤4/file, ≤200 SLOC).

## 5. Maturity & version

Root `package.json` deklarasikan `"maturity"`. Zhi mulai `experimental` (`0.y.z`):
- breaking change = **minor** (bukan major).
- minor = batch per milestone, bukan 1-fitur-1-minor.
- PATCH = zero behavior change.
- major butuh RFC + migration guide (lihat `AGENTS.md` §Maturity).

## 6. Co-Authored-By

Default **tanpa** `Co-Authored-By` trailer (sesuai ECC `includeCoAuthoredBy: false`). Untuk atribusi Claude, set `includeCoAuthoredBy: true` di settings atau konfigurasi `attribution`.

## 7. Pre-commit checklist

- [ ] `tsc --noEmit` / typecheck lolos
- [ ] `gate.ts` (eval) hijau: build ∧ test ∧ lint ∧ secret ∧ quality-gate
- [ ] `@brief` ada di simbol publik baru
- [ ] `EXPLAIN-CHANGES.md` updated (bila behavior berubah)
- [ ] Cross-link docs relevan terupdate

## References

- `AGENTS.md` §Doc standard, §Maturity
- `AGENTS.Style.md`
- `EXPLAIN-CHANGES.md`

# audit-log

Audit trail otonom untuk proyek miruamel (lokal: `/root/zhi`, remote: `miruamel/zhi` public). Dipelihara per mandat v6.0 §13.

## Entri

- `2026-08-29-discovery-zhi.md` — Discovery awal: metrik struktur, pelanggaran arsitektur, pemindaian secret.
- `2026-08-29-remediation-docs.md` — Remediasi docs: nest guides, ADR-005 untuk `docs/design/`.
- `2026-08-29-governance-ci.md` — CI architecture guard; rekomendasi LICENSE (P3).
- `2026-08-29-ci-lint-fix.md` — Self-review: hapus `*.py` dari guard; `bun test` ditunda.
- `2026-08-29-ci-fix-git-exclusion.md` — CI merah karena `.git` di-scan; perbaiki prune.
- `2026-08-29-license-mit.md` — LICENSE MIT + ADR-006 exception untuk `audit-log/entries/`.
- `2026-08-29-ci-fix-sloc-total.md` — CI SLOC guard false-positive pada baris `total` wc; filter `$2 != "total"`.
- `2026-08-29-native-stream-wasm.md` — native/stream Zig→WASM: parse.zig, build.sh, stream.ts wrapper, test; deviasi build.zig (zig build hang).
- `2026-09-04-convergence-and-changelog.md` — CHANGES.md `[Unreleased]` diisi (13 commit sejak v0.1.2), README koreksi fakta usang (test count 229→255, visibility private→public), survey repo miruamel/ (hanya zhi in-scope; profile README diabaikan per charter).

## Invarian yang dilacak

Rata-rata SLOC/file, SLOC maks, file/dir (≤5), kedalaman nesting (≥4), jumlah god-file, jumlah flat-dir, circular dependency, kebocoran secret.

## Catatan

Direktori ini adalah analog lokal dari `miruamel/audit-log`. Bila remote dikonfigurasi, promosikan menjadi repositori sendiri dan audit serupa. Riwayat di sini append-only; jangan hapus entri.

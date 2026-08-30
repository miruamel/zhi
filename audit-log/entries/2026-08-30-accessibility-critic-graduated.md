# 2026-08-30 — accessibility critic graduated from stub

- **Type**: feat(critic) — graduation dari roadmap v0.2.0
- **Action**: implement `engine/critic/plant/accessibility/critic.ts` + `critic.test.ts`; wire ke `composeCritiques` (compose.ts); update `compose.test.ts` + `src/cli.test.ts` assertions (7 → 8 critic); perbarui `docs/design/critic.md` (tabel 5→8 + catatan scope repo-hygiene).
- **What**: `accessibilityCritic` deteksi 2 anti-pattern high-confidence di kode UI generated: `<img>` tanpa atribut `alt`, dan `onClick` tanpa keyboard handler (`onKeyDown`/`onKeyPress`/`onKeyUp`) — keduanya WCAG 2.1 AA (mandate §9.3). Tiap temuan −0.1 (floor 0), bobot 1.0. File `*.test.{ts,tsx,js,jsx}` dikecualikan. Hitung per-file (satu file dengan N pelanggaran = 1 temuan), konsisten dengan `docCritic`.
- **Why**: satu-satunya kritikus content-based tersisa yang masuk akal untuk stage CRITIQUE (evaluasi 1 file generated, `src/cli.ts:57`). Zhi adalah CLI/engine (TS, minim UI) sehingga critic ini rendah sinyal di scaffold non-UI, tapi tetap valid sebagai gate generik. DevOps/Legal/DX (repo-hygiene) KELUAR scope — butuh stage scan repo-wide terpisah, didokumentasikan di `critic.md`.
- **Test impact**: `compose.test.ts` severe fixture diperkuat (tambah hardcoded `password` di `mess.ts` → privacy violation weight 1.5) agar skor tetap < 0.7 meski +1 critic sempurna (accessibility). `toHaveLength(7)` → `8`; name list tambah `accessibility`; test name "six" → "eight". `cli.test.ts` `toHaveLength(7)` → `8`. Tidak ada pelemahan kontrak.
- **Verification**: accessibility test 5/0; full suite 154/0 (naik dari 149/0); `bun run scripts/ci/architecture/check-circular.ts` → exit 0.
- **Rollback**: `git revert <sha>`.
- **Status**: resolved (lokal, push via `gh` cli ke `feat/critic-architecture`).
- **Next**: DevOps/Legal/DX butuh mekanisme scan repo-wide (bukan kritikus single-file); Security/Perf/Testing/Style butuh ADR semantik. Atau lanjut tech-debt aman (coverage `engine/eval/gate.ts`).

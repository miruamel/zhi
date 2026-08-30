# 2026-08-30 — doc critic graduated from stub

- **Type**: feat(critic) — graduation dari roadmap v0.2.0
- **Action**: implement `engine/critic/plant/doc/critic.ts` + `critic.test.ts`; wire ke `composeCritiques` (compose.ts); update `compose.test.ts` + `src/cli.test.ts` assertions (6 → 7 critic).
- **What**: `docCritic` deteksi file dengan export publik (`export function|const|class|interface|type|let|var|enum`) tapi tanpa tag `@brief` (mandate `AGENTS.Style.md` — Doxygen Universal wajib per simbol publik). Setiap file tanpa `@brief` −0.2 (floor 0), bobot 1.0. File `*.test.ts`/`*.test.js` dikecualikan. Cek file-level (ada export tapi nol `@brief` di file); per-symbol check adalah upgrade `ponytail`.
- **Why**: `AGENTS.Style.md` §Enforcement mewajibkan `@brief` per export publik; CI gate `docstyle` direncanakan. Doc critic jadi pencegah regresi otomatis di plant. Kalibrasi: repo saat ini 0 pelanggaran (38 file TS/JS non-test) → gate tetap hijau, tidak rusak existing. Bounded & low-risk, pola murni seperti privacy/sloc.
- **Test impact**: `compose.test.ts` fixture "clean files" diperkuat (`export const x` → `/** @brief X. */\nexport const x`) agar skor tetap 1 (file tersebut sebelumnya ketahuan Doc critic). `toHaveLength(6)` → `7`; name list tambah `doc`. `cli.test.ts` `toHaveLength(6)` → `7`. Tidak ada pelemahan kontrak.
- **Verification**: doc test 5/0; full suite 149/0 (naik dari 144/0); `bun run scripts/ci/architecture/check-circular.ts` → exit 0.
- **Rollback**: `git revert <sha>`.
- **Status**: resolved (lokal, push via `gh` cli ke `feat/critic-architecture`).
- **Next critic stub**: DevOps, Legal, DX, Accessibility (butuh arah semantik dari user).

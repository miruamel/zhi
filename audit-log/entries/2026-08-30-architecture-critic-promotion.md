# 2026-08-30 — promote Architecture critic to concrete (delegating to CI guard)

- **Type**: feat (architectural quality)
- **Action**: tambah `engine/critic/plant/architecture/` (critic + test); wire ke `composeCritiques()`; update `docs/design/critic.md`; tambah ADR-008; update EXPLAIN-CHANGES.
- **Finding**: Architecture adalah 1 dari 7 stub critic di design/critic.md. Aturan layer (engine→src illegal, circular dep, deep-relative) sudah dijaga `scripts/ci/architecture/check-circular.ts` (architecture-guard CI), tapi CI baru jalan saat push/PR — bukan saat in-loop CRITIQUE. Generated scaffold bisa pass CRITIQUE plant (4 critics) → EVALUATE gate hijau → CI reject → cycle waste.
- **Why**: mandate §6.11 (skipped-layer) + §2.1 default-to-feature-work + ADR-001. Tambah concrete critic delegasi ke CI guard via `spawnSync` (no re-implement; CI tetap sumber tunggal aturan) sehingga CRITIQUE tangkap drift arsitektural sebelum EVALUATE.
- **Verification**: `bun test` → 124 pass / 0 fail / 294 expect() / 28 file (sebelumnya 121/0/284/28). `bun run scripts/ci/architecture/check-circular.ts` → exit 0 (ok: 0 circular, 0 deep-relative, 0 illegal layer edge). SLOC scan → semua file ≤200 lines. Files-per-dir scan → ok.
- **Impact**: composeCritiques() sekarang return 5 critics (weight 1.5 untuk imports + architecture). Weighted aggregate bergeser sedikit; `cli.test.ts` ctx.critiques length 4 → 5. Tidak ada perubahan behavior untuk caller lain karena `aggregate()` score tetap di [0,1].
- **Rollback**: `git revert <sha>` atau hapus wiring di compose.ts + hapus folder architecture/.
- **Status**: resolved (lokal, branch `feat/critic-architecture` belum push — network stall §2.11).
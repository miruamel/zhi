# 2026-08-30 — close testing critic gaps + fix critic false-positives

- **Type**: test (hygiene) + fix (critic accuracy)
- **Action**: 5 PR (#23–#27) tambah real/contract tests untuk 14 source tanpa test sibling (resil/orch/eval/loop-wiring/model). PR #28 perbaiki testing critic: (1) exclude pure-type/re-export shell + `test.ts`, (2) ganti deteksi sibling co-located → `dirHasTests` (co-located ATAU `test/` subdir).
- **Finding**: testing critic flag semua source tanpa test sibling termasuk shell murni (false-positive `engine/eval/test.ts`). Setelah tambah test, CI `architecture-guard` (≤5 file/dir §6.2) FAIL karena per-source `*.test.ts` push dir >5. Dua aturan bentrok: critic mau co-located per-source, invariant mau ≤5 file/dir.
- **Why**: mandate "all parts maintained" + §6.2. Konsolidasi test ke `test/` subdir (sesuai konvensi eval/wiring) + critic diupdate agar kenali layout repo riil (resil.test.ts terkonsolidasi + `test/` subdir per-area).
- **Verification**: `bun test` → 206 pass / 0 fail. `bun run arch:check` → ok. `critique:repo` testing findings = 0. CI `invariants` hijau di semua PR.
- **Impact**: testing critic jadi gate jujur (0 findings = repo ter-test). 49 test baru (#23–#27) + 9 test critic (#28).
- **Rollback**: `git revert` PR #23–#28.
- **Status**: resolved (merged ke main).

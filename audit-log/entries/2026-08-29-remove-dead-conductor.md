# 2026-08-29 — remove dead engine/orch/conductor.ts

- **Type**: refactor (deletion) / architecture cleanup
- **Action**: `git rm engine/orch/conductor.ts engine/orch/conductor.test.ts`. `engine/orch/` kini kosong (otomatis hilang dari tree).
- **Finding**: `conductor.ts` hanya diimpor oleh test-nya sendiri; tak ada kode produksi yang memanggil `nextAction`. Orchestration loop nyata sudah di `engine/loop/wiring/handlers.ts` (jahit states→deps). `engine/orch/` per docs seharapnya layer DAG/task parser (bukan loop conductor) — `conductor.ts` salah scope + dead.
- **Why**: mandate §6.11 (no dead code / single responsibility) + lazy-dev (deletion over addition). Menghapus modul phantom menyederhanakan surface dan mencegah kebingungan "two conductors".
- **Verification**: `bun test` → 55 pass / 0 fail / 114 expect() / 12 file (conductor.test terlepas). Tidak ada importer `conductor`/`engine/orch` di kode (grep: hanya docs/README).
- **Impact**: orchestration tunggal di `loop/wiring`. `engine/orch/` (DAG/task) belum diimplementasikan — tetap sebagai layer aspirasional di docs; bukan regression.
- **Rollback**: `git revert <sha>`.
- **Status**: resolved (lokal, belum push — network stall §2.11).

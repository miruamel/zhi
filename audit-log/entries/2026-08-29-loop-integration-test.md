# 2026-08-29 — loop integration test (INTAKE→DONE)

- **Type**: test / verification (mandate §4.6, lazy-dev "one runnable check")
- **Action**: tambah `engine/loop/wiring/integration.test.ts` (4 kasus). Jalankan `bun test` → 59 pass / 0 fail / 128 expect() / 13 file.
- **Gap yang ditutup**: sebelumnya hanya unit-test per modul (states/driver/handlers masing-masing). Tidak ada test yang menjalankan `LoopDriver` + `buildHandlers` + `transitions` bersama hingga `DONE`. Ini satu-satunya cek yang membuktikan engine runnable end-to-end.
- **Kasus**:
  1. happy path INTAKE→DONE (gate hijau): assert `finished`, `current===DONE`, `ctx.plan/code/aggregate/eval` terisi, urutan state via `onTransition`.
  2. recovery: `critique` gagal di panggilan ke-1 → `GATE_FAIL`→`RECOVER`→`EXECUTE`→`CRITIQUE`(ke-2 lolos)→`DONE`. Bukti cabang recovery bekerja.
  3. no-handler guard: hapus handler `EXECUTE` → driver throw `no handler for state EXECUTE`.
  4. budget guard: `critique` selalu gagal → loop recover tak berhingga → driver throw `budget exceeded` (bukti §1 safety guard aktif lewat wiring nyata, bukan hanya unit driver).
- **Why**: mandate §4.6 (Verify) + lazy-dev (non-trivial logic leaves ONE runnable check). Tanpa ini, "engine jalan" hanya klaim, bukan bukti.
- **Impact**: +4 test, +1 file (wiring/ jadi 4 file, masih ≤5 per §6.2). SLOC test ~60. Tidak ada produksi berubah.
- **Rollback**: `git revert <sha>`.
- **Status**: resolved (lokal, belum push — network stall §2.11).

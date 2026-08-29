# 2026-08-29 — loop wiring: engine runnable end-to-end + driver budget guard

- **Type**: feat (loop wiring) + safety-fix (driver infinite-loop)
- **Found**: `LoopDriver.run()` tidak punya batas iterasi → siklus `EVALUATE→GATE_FAIL→RECOVER→EXECUTE→CRITIQUE→EVALUATE` tak berhingga (hang). Loop juga belum runnable: handler tiap state belum dijahit ke `critic.aggregate`/`eval.gate`.
- **Action**:
  1. `engine/loop/driver.ts`: `run(handlers, maxSteps=64)` — lempar `Error('loop: budget exceeded')` bila langkah > batas. Cegah loop tak berhingga (mandat §1 safety).
  2. `engine/loop/wiring/context.ts` (`LoopContext`) + `engine/loop/wiring/handlers.ts` (`buildHandlers(ctx, deps)`): jahit `INTAKE..CI_WATCH` ke deps injeksi (LLM-dependent: `ingest/plan/generate/critique/ciGreen`) + `critic.aggregate` + `eval.gate` + `gatePass` dua-lapis (Pareto≥threshold DAN quality-gate hijau). `DONE` terminal tanpa handler. `RECOVER`/`COMMIT`/`PR_OPEN`/`ISOLATE` emit event deterministik.
  3. `engine/loop/wiring/handlers.test.ts`: 2 kasus — green loop→DONE (assert ctx terisi), gate-fail cycle→throw budget (assert aggregate.passed=false).
- **Verification**: `bun test` → 56 pass / 0 fail / 118 expect() / 12 file. SLOC: context 23, handlers 64, test 45, driver 63 (semua <200). `loop/` = 4 file, `loop/wiring/` = 3 file (dua-duanya <5, aman).
- **Impact**: engine kini runnable end-to-end tanpa god file; state LLM-dependent injectable (tanpa LLM nyata di test). Kontrak `loop/states`↔`loop/driver`↔`loop/wiring`↔`orch`↔`critic`↔`eval` konsisten.
- **Status**: resolved (lokal, belum push — network stall §2.11).

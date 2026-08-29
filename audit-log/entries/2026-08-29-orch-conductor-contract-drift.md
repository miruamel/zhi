# 2026-08-29 — orch/conductor contract drift (fix)

- **Type**: architecture-violation / bug (P1, core module)
- **Found in**: `engine/orch/conductor.ts`, `engine/orch/conductor.test.ts`
- **Finding**: `nextAction(state: LoopState)` meng-`switch` pada literal `'idle'`/`'generated'`/`'critiqued'`/`'evaluated'`/`'done'` yang **tidak ada** di `LoopState` enum (nilai asli: `INTAKE`/`PLAN`/`ISOLATE`/`EXECUTE`/`CRITIQUE`/`EVALUATE`/`RECOVER`/`COMMIT`/`PR_OPEN`/`CI_WATCH`/`DONE`). Akibatnya untuk state `LoopState` asli fungsi selalu jatuh-through dan return `undefined` (Bun tidak typecheck). Test juga memanggil `nextAction('idle')` — men-test kontrak phantom, bukan enum nyata.
- **Impact**: orch (conductor inti) tidak koheren dengan `engine/loop/states`. Bila di-wire ke `LoopDriver.run(handlers)`, `nextAction` mengembalikan `undefined` → break alur.
- **Action**: sejajarkan `switch` ke `LoopState` enum — `INTAKE|PLAN|ISOLATE|EXECUTE|RECOVER → 'generate'`, `CRITIQUE → 'critique'`, `EVALUATE → 'eval'`, `COMMIT|PR_OPEN|CI_WATCH|DONE → 'done'`. Rewrite test pakai `LoopState` asli (4 kasus).
- **Verification**: `bun test` → 54 pass / 0 fail / 110 expect() / 11 file. SLOC conductor.ts = 24 (aman <200).
- **Rollback**: `git revert <sha>` (commit `fix(orch): align nextAction with LoopState enum`).
- **Status**: resolved (lokal, belum push — network stall §2.11).

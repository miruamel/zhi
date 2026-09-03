# 2026-09-04 — toPatch coverage: loop.ts 60% → 83%

## Konteks

Coverage survey menunjukkan `src/cli/commands/loop/loop.ts` pada 60% lines (23-58,79-109 uncovered). `toPatch()` (line 23-59) adalah pure function: ctx+metrics+loop+aborted → AppState patch, tanpa TUI/network dependency. `loopCommandTui()` (line 79-111) membutuhkan `mountTui` (ink) — YAGNI skip (butuh `@testing-library/ink`, zero business value).

## Yang Dikerjakan

### Test `toPatch` (commit `03f63c3` + `0b97d3a`)

`src/cli/commands/loop/loop-topatch.test.ts` — 7 tests, 20 expect() calls:

| # | Case | Cek |
|---|------|-----|
| 1 | critics mapping | name/score/abstain=false/reason=first finding |
| 2 | empty critics (undefined) | `[]` |
| 3 | loop state + finished flag | DONE→finished=true, PLAN→false |
| 4 | eval gate from ctx.eval.passed | truthy→ok=true, falsy→ok=false |
| 5 | weightedAggregate from ctx.aggregate.score | 0.75 / fallback 0 |
| 6 | prCi.ciStatus per loop state | CI_WATCH→pending, DONE→green, PLAN→undefined |
| 7 | recoverAttempts + aborted | metrics.recoverAttempts=3, aborted=true |

### Hasil

- `bun test`: **393 pass, 0 fail, 802 expect() calls across 74 files**.
- `loop.ts` coverage: **60% → 83% lines** (65.56% overall; remaining uncovered: `loopCommandTui` lines 79-109).
- Architecture guard: all checks passed, exit 0.
- Prettier: `--write` applied, `--check` clean.

## Keputusan

- **Tidak test `loopCommandTui`**: butuh `mountTui` (ink) + `@testing-library/ink` dependency baru untuk zero business value. Skip per YAGNI.
- **Tidak test `is-dlq.ts`**: 2-line type guard, testing-nya cargo-cult coverage (asserts what the type already asserts). Already covered by `handlers.test.ts` (4 cases).
- **Tidak test `src/cli/index.ts` `import.meta.main` block**: entry-point side effect, `main()` dispatcher sudah diuji oleh `index.test.ts` (4 cases, 100% coverage pada `main()`).

## Status Akhir

| Gate | Status |
|------|--------|
| ci (0b97d3a) | in_progress |
| architecture-guard (0b97d3a) | in_progress |
| Working tree | clean |
| npm @miruamel/zhi | 0.1.3 published (run 33813429714) |

## Refleksi

Coverage gaps yang tersisa mayoritas adalah TUI (ink) dan entry-point side effects — keduanya membutuhkan dependency testing infrastructure baru untuk zero business value. `toPatch` adalah pengecualian: pure function, dipanggil oleh `loopCommandTui` (hot path), dan testing-nya tidak butuh infra baru. Prinsip: prioritaskan coverage pada pure logic yang dipanggil dari hot path, bukan pada infra yang butuh tooling baru.
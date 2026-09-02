# design/resil.md — Resilience & Fallback

## Tujuan

Cegah loop **spin** tak terbatas. Beri recovery terbatas (bounded) lewat circuit breaker, retry budget, DLQ, dan strategi recovery. Dihubungi dari `loop` state `RECOVER` dan dari tiap modul yang bisa gagal (model call, eval).

## Komponen

- `index.ts` (Orchestrator): `withResilience(fn)` wrapper.
- `breaker.ts` (Circuit Breaker): buka bila error rate tinggi.
- `retry.ts` (Retry Budget Limiter max-3 + Dead Letter Queue): coba ulang maksimal 3x, lalu masuk DLQ.
- `recover.ts` (Error Classification + Recovery Strategies): klasifikasi error → strategi (replan / patch / abort).

## Interface

```ts
/** @brief Jalankan fn dengan circuit breaker + retry budget + recovery.
 * @param {() => Promise<T>} fn
 * @param {ResilCtx} ctx - budget, strategi.
 * @return {T | DLQEntry} hasil atau masuk DLQ.
 * @throw {never} kegagalan final dikembalikan sebagai DLQEntry.
 * @since 0.1.0 */
export async function withResilience<T>(fn: () => Promise<T>, ctx: ResilCtx): Promise<T | DLQEntry>;
```

## Strategi recovery

- `replan` — goal ambigu / siklus DAG → `orch` dari awal.
- `patch` — test/syntax gagal → `build` ulang dengan error context.
- `abort` — budget habis / error fatal → `DONE(PARTIAL)` + laporan.

## Edge cases

- Error rate > 50% dalam window → breaker buka → `abort`.
- Retry ke-3 gagal → DLQ → `abort` (tidak spin).
- DLQ entry → log + notifikasi (ke `tui`), tidak diam-diam dibuang.

## v1

Konkret semua: `breaker` + `retry` (max-3) + `recover` + DLQ. Ini inti "anti-spin" yang membedakan Zhi dari chat-wrapper.

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/loop.md`; `design/eval.md`; `design/model.md`; `docs/adr/ADR-003-resilience-budget.md`.

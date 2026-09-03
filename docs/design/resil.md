# design/resil.md — Resilience & Fallback

## Purpose

Stop the loop from **spinning** forever. Provide bounded recovery through circuit breaker, retry budget, DLQ, and recovery strategies. Called from the `RECOVER` state and from any module that can fail (model call, eval).

## Components

- `index.ts` (Orchestrator): `withResilience(fn)` wrapper.
- `breaker.ts` (Circuit Breaker): opens when error rate is high.
- `retry.ts` (Retry Budget Limiter max-3 + Dead Letter Queue): retry up to 3 times, then send to DLQ.
- `recover.ts` (Error Classification + Recovery Strategies): classify error → strategy (replan / patch / abort).

## Interface

```ts
/** @brief Run fn with circuit breaker + retry budget + recovery.
 * @param {() => Promise<T>} fn
 * @param {ResilCtx} ctx - budget, strategy.
 * @return {T | DLQEntry} result or DLQ entry.
 * @throw {never} terminal failures are returned as a DLQEntry.
 * @since 0.1.0 */
export async function withResilience<T>(fn: () => Promise<T>, ctx: ResilCtx): Promise<T | DLQEntry>;
```

## Recovery strategies

- `replan` — ambiguous goal / DAG cycle → `orch` from scratch.
- `patch` — test/syntax failed → `build` again with error context.
- `abort` — budget exhausted / fatal error → `DONE(PARTIAL)` + report.

## Edge cases

- Error rate > 50% within the window → breaker opens → `abort`.
- Retry #3 fails → DLQ → `abort` (no spin).
- DLQ entry → log + notify (to `tui`), never silently dropped.

## v1

All concrete: `breaker` + `retry` (max-3) + `recover` + DLQ. This is the "anti-spin" core that separates Zhi from a chat wrapper.

## Cross-link

`ARCHITECTURE.md` §3, §4; `design/loop.md`; `design/eval.md`; `design/model.md`; `docs/adr/ADR-003-resilience-budget.md`.

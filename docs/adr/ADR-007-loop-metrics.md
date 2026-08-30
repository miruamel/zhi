# ADR-007: Loop Metrics (Observability)

## Status

Accepted — 2026-08-30

## Context

MANDAT OPERASIONAL 7.0 §8.2 mewajibkan observability: latency per stage, error rate, throughput. Loop Zhi (`engine/loop`) berjalan tanpa metrik — tidak ada visibilitas ke stage mana yang lambat atau gagal. Untuk CLI/engine (bukan service panjang), praktisnya: kumpulkan latency + ok/error per state transition, lalu cetak ringkasan di akhir siklus.

Tanpa metrik, debug loop lambat buta; melanggar §8.2 (latency/error wajib) dan §13.3 (metrik DORA/teknis).

## Decision

1. **Modul `engine/loop/observability/metrics.ts`**: `LoopMetrics` (akumulator `StageRecord[]` + `summary()`) dan `timedStage(stage, fn, metrics)` (bungkus `StateHandler` dengan `performance.now()` sebelum/sesudah, catat ok/error).
2. **`buildHandlers(ctx, deps, metrics?)`** — param `metrics` opsional (non-breaking): bila ada, setiap handler dibungkus `timedStage`. Pemanggil tanpa metrics tak berubah (test tetap hijau).
3. **Consumer: `src/cli.ts` `main()`** — buat `LoopMetrics`, lewatkan ke `buildHandlers`, cetak `[metrics] stages=.. errors=.. totalMs=..` pasca-run.
4. **Verifikasi**: `metrics.test.ts` (record/summary + timedStage ok/error) + `integration.test.ts` (buildHandlers isi metrics saat diberi).

## Consequences

- **+** Observability nyata: latency + error per stage terukur, tercetak di CLI.
- **+** Non-breaking: `metrics?` opsional; handler tanpa metrics identik.
- **-** Overhead `performance.now()` per stage (sub-mikro, negligible).
- **-** Surface tambah (`LoopMetrics`/`timedStage`) — punya consumer (CLI + test).

## Risks & Mitigations

- **Clock resolusi**: `performance.now()` di Bun cukup untuk ms-level; tak butuh inject clock.
- **Handler throw**: `timedStage` catat error lalu lempar ulang — transisi loop tak berubah.
- **Verifikasi**: unit test `LoopMetrics`/`timedStage` + integration test wiring `buildHandlers`.

## References

- MANDAT OPERASIONAL 7.0 §8.2 (observability), §2.2 (risiko menengah)
- `engine/loop/wiring/handlers.ts` (`buildHandlers`)
- `engine/loop/driver.ts` (`StateHandler`, `LoopDriver`)
- `src/cli.ts` (entry CLI)

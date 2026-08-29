# observability.md — Logging, Metrics, Cost

Zhi berjalan otonom; tanpa observability, kegagalan tak terlihat. Semua sinyal di-emit lewat `knowledge/store.ts` (ledger) + log terstruktur.

## Logging

- Format: **JSON line** ke stderr (bukan stdout — stdout untuk TUI/machine output).
- Level: `silent | info | debug` via `ZHI_LOG` (default `info`).
- Setiap entri: `{ts, level, stepId, module, msg, tokens?, durMs?}`.
- Contoh: `{"ts":"...","level":"info","stepId":"s3","module":"eval","msg":"gate pass","durMs":320}`.

## Ledger (audit trail)

- `knowledge/store.ts` append-only `KB/ledger/<runId>.jsonl` + `KB/index.json`.
- Tiap step → `LedgerEntry` (`data-model.md`). Basis untuk `zhi resume` dan post-mortem.
- Tidak mencatat secret (di-redact di `security.md`).

## Metrics (dalam proses)

| Metrik | Sumber | Kegunaan |
|---|---|---|
| `tokens_used` | model/stream | budget tracking (`orch/budget`). |
| `step_duration` | tiap modul | deteksi langkah lambat. |
| `critic_scores` | critic/aggregate | tren kualitas antar-run. |
| `eval_stage_duration` | eval/* | regresi toolchain. |
| `retry_count` | resil/retry | spin detection (alert bila mendekati max-3). |
| `dlq_size` | resil/recover | kegagalan final. |

## Cost tracking

- `model/router` catat token per `Backend.tier` → `cost = tokens × price[tier]` (tabel harga di `zhi.config.ts.model`).
- Ringkasan di `LoopReport.tokensUsed` + estimasi cost → tampil di TUI (pane Log) dan `EXPLAIN-CHANGES` bila melampaui budget.
- `orch/budget` potong step bila sisa budget < estimasi minimal (cegah over-spend).

## Tracing

- `stepId` korelasi lintas modul: setiap log/metric membawa `stepId` agar alur satu step bisa di-follow dari `loop` → `build` → `critic` → `eval`.
- `runId` korelasi lintas step dalam satu `runLoop`.

## v1

Konkret: JSON log + ledger + token/cost tracking + retry/dlq counter. Dashboard eksternal (Prometheus/Grafana) **belakangan** — v1 cukup file ledger + stdout summary.

## Cross-link

`design/knowledge.md` (ledger), `design/model.md` (token), `design/resil.md` (retry, DLQ), `design/orch.md` (budget), `configuration.md` (`ZHI_LOG`), `tui.md` (Log pane).

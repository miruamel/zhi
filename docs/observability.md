# observability.md — Logging, Metrics, Cost

<p align="center">  <img src="../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

Zhi runs autonomously; without observability, failures stay invisible. All signals are emitted through `knowledge/store.ts` (ledger) + structured logs.

## Logging

- Format: **JSON line** to stderr (not stdout — stdout is for TUI / machine output).
- Level: `silent | info | debug` via `ZHI_LOG` (default `info`).
- Each entry: `{ts, level, stepId, module, msg, tokens?, durMs?}`.
- Example: `{"ts":"...","level":"info","stepId":"s3","module":"eval","msg":"gate pass","durMs":320}`.

## Ledger (audit trail)

- `knowledge/store.ts` writes append-only `KB/ledger/<runId>.jsonl` + `KB/index.json`.
- One `LedgerEntry` per step (`data-model.md`). The basis for `zhi resume` and post-mortems.
- Secrets are never recorded (redacted per `security.md`).

## Metrics (in-process)

| Metric                | Source           | Purpose                                        |
| --------------------- | ---------------- | ---------------------------------------------- |
| `tokens_used`         | model/stream     | budget tracking (`orch/budget`).               |
| `step_duration`       | every module     | slow-step detection.                           |
| `critic_scores`       | critic/aggregate | quality trend across runs.                     |
| `eval_stage_duration` | eval/*           | toolchain regressions.                         |
| `retry_count`         | resil/retry      | spin detection (alert when approaching max-3). |
| `dlq_size`            | resil/recover    | terminal failures.                             |

## Cost tracking

- `model/router` records tokens per `Backend.tier` → `cost = tokens × price[tier]` (price table in `zhi.config.ts.model`).
- Summary lives in `LoopReport.tokensUsed` + estimated cost → shown in the TUI (Log pane) and `CHANGES.md` when budget is exceeded.
- `orch/budget` cuts a step when remaining budget < minimum estimate (prevents over-spend).

## Tracing

- `stepId` correlates across modules: every log/metric carries `stepId` so a single step can be followed from `loop` → `build` → `critic` → `eval`.
- `runId` correlates across steps inside one `LoopDriver.run`.

## v1

Concrete: JSON log + ledger + token/cost tracking + retry/DLQ counter. External dashboards (Prometheus/Grafana) are **later** — v1 is file ledger + stdout summary.

## Cross-link

`design/knowledge.md` (ledger), `design/model.md` (token), `design/resil.md` (retry, DLQ), `design/orch.md` (budget), `configuration.md` (`ZHI_LOG`), `tui.md` (Log pane).

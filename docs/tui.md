# tui.md — Terminal UI Specification

`src/tui/index.tsx` adalah viewer **tipis** di atas `loop`. Tidak mengambil keputusan — hanya visualisasi state machine + hasil tiap modul. Dibangun dengan `ink` (React-for-terminal).

## Layout (pane)

```
┌─ DAG ───────────────┬─ Step Detail ────────────┐
│ ● PLAN  ✓ ISOLATE   │ Step: generate auth.ts  │
│ ✓ EXECUTE ● CRITIQUE│ status: running         │
│ ○ EVALUATE ○ COMMIT │ tokens: 12k/40k         │
│ ○ PR_OPEN ○ CI      │                         │
├─ Critics ───────────┼─ Eval ──────────────────┤
│ security 0.92 ✓     │ build   ✓ 320ms         │
│ perf     0.78 ✓     │ test    ✓ 1.2s          │
│ testing  0.85 ✓     │ security✓ 0 find        │
│ style    0.80 ✓     │ gate    ✓ coverage 0.84 │
│ avg 0.84 → PASS     │                         │
├─ PR / CI ───────────┴─ Log ───────────────────┤
│ PR #42 opened · CI running…                   │
│ [12:01] EXECUTE generate → 3 files            │
│ [12:01] CRITIQUE 12 critics → avg 0.84        │
└───────────────────────────────────────────────┘
```

## Komponen ink

- `<DagView steps={steps} />` — daftar step + status ikon (● running, ✓ done, ○ pending, ✗ failed).
- `<StepDetail step={current} />` — detail step aktif + pemakaian token.
- `<CriticPanel scores={scores} aggregate={agg} />` — 12 bar + avg + PASS/FAIL.
- `<EvalPanel report={evalReport} />` — per-tahap eval.
- `<PrCiBar pr={prUrl} ci={ciStatus} />` — status PR + CI.
- `<LogView entries={ledger} />` — stream ledger (append-only).

State di-pass dari `loop` via callback `onState(state: LoopState, payload)`. TUI tidak mutate state loop.

## Keybindings

| Key | Aksi |
|---|---|
| `q` | quit (loop tetap jalan di background; konfirmasi bila belum DONE). |
| `space` | pause/resume render (bukan pause loop). |
| `l` | toggle full Log view. |
| `c` | toggle Critics detail. |
| `p` | toggle PR/CI detail. |
| `ctrl+c` | abort loop (trigger `resil` abort → DONE partial + laporan). |

## Behavior

- TUI render deklaratif; setiap transisi state → re-render pane terkait.
- Bila `DONE(partial)`, TUI tampilkan banner kuning + `ledgerRef` untuk `zhi resume`.
- Bila `DONE`, TUI tampilkan `prUrl` + ringkasan token.
- Log di-feed dari `knowledge/store.ts` (ledger) — TUI hanya subscribe.

## v1

Konkret: DAG + Step + Critics + Eval + PR/CI + Log, keybindings di atas. Tidak ada input field interaktif (goal diberikan via CLI, bukan di TUI). Interaktif (edit goal mid-loop) belakangan.

## Cross-link

`design/loop.md` (state machine), `design/critic.md` (scores), `design/eval.md` (report), `design/knowledge.md` (ledger), `configuration.md` (CLI flags), `README.md` (SRC subgraph).

# tui.md — Terminal UI Specification

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

`src/tui/index.tsx` is a **thin** viewer on top of `loop`. It does not make decisions — only visualises the state machine + the result of each module. Built with `ink` (React-for-terminal).

## Layout (panes)

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
│ [12:01] CRITIQUE 15 critics → avg 0.84
└───────────────────────────────────────────────┘
```

## ink components

- `<DagView steps={steps} />` — list of steps + status icons (● running, ✓ done, ○ pending, ✗ failed).
- `<StepDetail step={current} />` — active step detail + token usage.
- `<CriticPanel scores={scores} aggregate={agg} />` — 15 bars + avg + PASS/FAIL.
- `<EvalPanel report={evalReport} />` — per-stage eval.
- `<PrCiBar pr={prUrl} ci={ciStatus} />` — PR + CI status.
- `<LogView entries={ledger} />` — ledger stream (append-only).
- `<SplashBanner text={banner} />` — boot banner (`assets/banner.txt`).

State is passed from `loop` via the `onState(state: LoopState, payload)` callback. The TUI does not mutate loop state.

## Keybindings

| Key      | Action                                                            |
| -------- | ----------------------------------------------------------------- |
| `q`      | quit (loop keeps running in the background; confirm if not DONE). |
| `space`  | pause / resume render (not pause loop).                           |
| `l`      | toggle full Log view.                                             |
| `c`      | toggle Critics detail.                                            |
| `p`      | toggle PR / CI detail.                                            |
| `ctrl+c` | abort loop (trigger `resil` abort → DONE partial + report).       |

## Behavior

- TUI renders declaratively; every state transition → re-render the affected pane.
- On `DONE(partial)`, the TUI shows a yellow banner + `ledgerRef` for `zhi resume`.
- On `DONE`, the TUI shows `prUrl` + token summary.
- The Log is fed from `knowledge/store.ts` (ledger) — the TUI only subscribes.

## v1

Concrete: DAG + Step + Critics + Eval + PR/CI + Log + Splash, keybindings above. No interactive input field (goal is given via CLI, not in the TUI). Interactive input (edit goal mid-loop) is later.

## Cross-link

`design/loop.md` (state machine), `design/critic.md` (scores), `design/eval.md` (report), `design/knowledge.md` (ledger), `configuration.md` (CLI flags), `README.md` (SRC subgraph).

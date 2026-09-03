# glossary.md — Terms

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

Zhi terminology. Use consistently across docs and code.

| Term                  | Meaning                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Zhi (志)**          | Project name: terminal coding agent with autonomous-loop engine + multi-critic plant.   |
| **Conductor**         | `engine/loop/` — the state machine that stitches all modules into one autonomous cycle. |
| **Loop**              | One full `LoopDriver.run(goal)` execution from `INTAKE` to `DONE`.                      |
| **Goal**              | Natural-language input from the user (`Goal` in `data-model.md`).                       |
| **Intent**            | Output of `parseGoal`: structured action + targets + constraints.                       |
| **DAG**               | Directed Acyclic Graph of `Step`; planned by `orch`, executed by `loop`.                |
| **Step**              | One unit of work in the DAG (`generate`/`verify`/`critique`/`eval`/`commit`/`pr`).      |
| **Critic plant**      | `engine/critic/` — 15 critics + semantic cache + meta-aggregator Pareto.                |
| **Critic**            | One code reviewer (Security/Perf/...). Returns a `CriticScore`.                         |
| **Pareto (weighted)** | Aggregates 15 weighted scores → commit-readiness decision (`aggregate`).                |
| **Floor**             | Minimum per-critic score; below → auto-fail (Security floor 0.5).                       |
| **Eval toolchain**    | `engine/eval/` — build/test/SAST/secret/perf/compliance/quality-gate.                   |
| **Gate**              | `gatePass` decision: critic Pareto ∧ eval quality-gate. Guards every transition.        |
| **Resilience**        | `engine/resil/` — circuit breaker + retry budget + DLQ + recovery.                      |
| **Bounded retry**     | Max 3 attempts (`resil/retry.ts`); prevents spin.                                       |
| **DLQ**               | Dead Letter Queue — terminal failure entries, recorded + notified.                      |
| **Worktree**          | Isolated `git worktree`; execution happens here, main repo stays safe.                  |
| **Ledger**            | `KB/ledger/*.jsonl` append-only; audit trail per step.                                  |
| **Semantic cache**    | `critic/cache.ts` — similarity embedding; avoid re-running critics.                     |
| **Tier**              | `heavy                                                                                  | light  | micro`— model class; routed by`model/router`.      |
| **Native / WASM**     | `native/*.zig` → `*.wasm` hot path (stream parse, diff, embed).                         |
| **Budget**            | Total tokens (`Goal.budget`); allocated per step (`orch/budget`).                       |
| **Circuit breaker**   | Opens when error rate > 50% within a window; prevents repeated failed calls.            |
| **Abstain**           | Stub critic not yet implemented; does not influence aggregation.                        |
| **DONE(partial)**     | Loop stops without full goal (budget exhausted / terminal fail) + report.               |
| **Maturity**          | `experimental                                                                           | stable | mature`in`package.json`(see`AGENTS.md` §Maturity). |

## Cross-link

`README.md`, `ARCHITECTURE.md`, `design/data-model.md`, `AGENTS.md` §Maturity.

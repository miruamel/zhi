# testing.md — Testing Strategy

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

Zhi itself must be tested before it can run a trustworthy loop. Strategy: unit (pure functions) + integration (loop with fake modules) + e2e (dummy repo).

## Principles

- **Every enforced gate has a test**: `gatePass`, `aggregate` Pareto, `retry` budget, `cycle` detect — have tests that fail on plausible bugs.
- **Modules are injected**: `loop/wiring/handlers.ts` accepts a `LoopCtx` (all modules). Integration tests plug in **fake** modules for isolation.
- **Deterministic**: tests do not depend on a real model (use a `model/router` stub that returns a fixture).
- Coverage target **80%** (same as the eval gate Zhi enforces).

## Unit (per module)

| Module                | What's tested                                                                   |
| --------------------- | ------------------------------------------------------------------------------- |
| `loop/states.ts`      | `gatePass` correctly rejects when critic/eval fail; accepts when they pass.     |
| `orch/dag.ts`         | cycle detection on cyclic DAG; correct topo sort.                               |
| `orch/budget.ts`      | proportional allocation; trim when budget < minimum.                            |
| `critic/aggregate.ts` | Security floor auto-fail; abstain fallback; avg ≥ 0.7 pass.                     |
| `critic/critics.ts`   | stubs return `abstain`; concrete (Security/Perf/Testing/Style) score plausibly. |
| `eval/gate.ts`        | `gatePass = build∧test∧secret∧lint∧coverage≥0.8`.                               |
| `resil/retry.ts`      | retry max-3 then DLQ; breaker opens when error rate > 0.5.                      |
| `resil/recover.ts`    | error classification → right strategy (replan/patch/abort).                     |
| `knowledge/git.ts`    | isolated worktree; commit inside the worktree, not on main.                     |
| `model/router.ts`     | correct tier routing; fallback to a lower tier when backend is down.            |

## Integration (loop)

- `engine/loop/driver.ts` is tested with a `LoopCtx` containing **fake** `orch/build/critic/eval/resil/knowledge/model`.
- Scenario: happy path → `LoopReport.status==='done'` + `prUrl`.
- Scenario: test fail → `resil` patches → pass (bounded).
- Scenario: test fail × 3 → DLQ → `DONE(partial)`.
- Scenario: CI fail → EXECUTE again → pass.
- Scenario: budget exhausted → `DONE(partial)`.

## E2E (dummy repo)

- Dummy repo (`fixtures/dummy-app`) with tests that can be made red / green.
- `zhi run "add email validation, tests green, open PR" --dry-run=false` on the fixture → assert PR opened + CI green.
- Run in CI (needs `GITHUB_TOKEN` + 9router key → use a sandbox repo).

## Framework

- **`bun test`** (no extra dep). Fixtures in `engine/**/__fixtures__/`.
- No heavy framework; use built-in bun assertions.

## Cross-link

`design/loop.md`, `design/orch.md`, `design/critic.md`, `design/eval.md`, `design/resil.md`, `design/knowledge.md`, `design/model.md`, `configuration.md` (scripts.test), `AGENTS.md` §Verification.

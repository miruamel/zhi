# design/sequences.md — Sequence Diagrams

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

Visualisations of cross-module temporal flow. Complements the state machine in `loop.md` and the data flow in `ARCHITECTURE.md` §3.

## 1. Happy path (goal → PR)

```mermaid
sequenceDiagram
  actor U as User
  participant CLI as cli.ts
  participant L as loop
  participant O as orch
  participant K as knowledge/git
  participant B as build
  participant C as critic
  participant E as eval
  participant G as tools/git (gh)

  U->>CLI: zhi run "<goal>"
  CLI->>L: LoopDriver.run(goal, ctx)
  L->>O: parseGoal + buildDag + allocate + schedule
  O-->>L: Dag (steps)
  L->>K: makeWorktree(base)
  K-->>L: worktree path
  loop per step
    L->>B: generate(req) + verify
    B-->>L: FileChange[]
    L->>C: runCritics + aggregate
    C-->>L: Aggregate(pass?)
    L->>E: runEval(changes)
    E-->>L: EvalReport(gatePass?)
  end
  L->>K: commit(worktree)
  L->>G: PR_OPEN
  G-->>L: prUrl
  L->>G: CI_WATCH (run_watch)
  G-->>L: pass
  L-->>CLI: LoopReport(done, prUrl)
  CLI-->>U: show result
```

## 2. Recovery on test failure

```mermaid
sequenceDiagram
  participant L as loop
  participant E as eval
  participant R as resil
  participant B as build

  L->>E: runEval(changes)
  E-->>L: EvalReport(gatePass=false, test fail)
  L->>L: gatePass? no
  L->>R: withResilience(replan/patch)
  R->>R: classify(error) -> patch
  R->>B: generate(req + errorContext)
  B-->>L: FileChange[] (revision)
  L->>E: runEval(revision)
  alt pass
    E-->>L: gatePass=true
    L->>L: COMMIT
  else still failing (retry #3)
    R->>R: DLQ entry
    L->>L: DONE(partial) + report
  end
```

## 3. CI-watch fail loop

```mermaid
sequenceDiagram
  participant L as loop
  participant G as tools/git (gh)
  participant B as build

  L->>G: PR_OPEN + CI_WATCH
  G-->>L: CI fail (job X red)
  L->>L: CI_WATCH -> EXECUTE (error context)
  L->>B: generate(req + CI error)
  B-->>L: FileChange[]
  L->>G: push fix to PR branch
  L->>G: CI_WATCH again
  G-->>L: pass
  L->>L: DONE
```

## 4. Critic eval (cache-aware)

```mermaid
sequenceDiagram
  participant L as loop
  participant C as critic
  participant Cache as critic/cache
  participant V as knowledge/vectors
  participant Agg as critic/aggregate

  L->>C: runCritics(changes, ctx)
  C->>Cache: lookup(embedding(changes))
  Cache->>V: similarity query
  alt cache hit
    V-->>Cache: old score
    Cache-->>C: use cache (skip execution)
  else miss
    C->>C: run 12 critics (concrete via tool, stubs abstain)
  end
  C->>Agg: aggregate(scores)
  Agg-->>L: Aggregate(pass?, weightedAvg, reasons)
```

## Notes

- All diagrams assume `loop` is the conductor; other modules are stateless with respect to the loop (called, return values).
- Retry / DLQ are abstracted into `resil` — see `design/resil.md`.
- Sequence #2 and #3 are the only paths that trigger `RECOVER`/`EXECUTE` again; both are **bounded** (max-3 via `resil/retry.ts`).

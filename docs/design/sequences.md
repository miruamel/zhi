# design/sequences.md — Sequence Diagrams

Visualisasi alur temporal lintas modul. Melengkapi state machine di `loop.md` dan alur di `ARCHITECTURE.md` §3.

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
  CLI->>L: runLoop(goal, ctx)
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
  CLI-->>U: tampilkan hasil
```

## 2. Recovery pada test gagal

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
  B-->>L: FileChange[] (revisi)
  L->>E: runEval(revisi)
  alt pass
    E-->>L: gatePass=true
    L->>L: COMMIT
  else masih gagal (retry ke-3)
    R->>R: DLQ entry
    L->>L: DONE(partial) + laporan
  end
```

## 3. CI-watch fail loop

```mermaid
sequenceDiagram
  participant L as loop
  participant G as tools/git (gh)
  participant B as build

  L->>G: PR_OPEN + CI_WATCH
  G-->>L: CI fail (job X merah)
  L->>L: CI_WATCH -> EXECUTE (error context)
  L->>B: generate(req + CI error)
  B-->>L: FileChange[]
  L->>G: push fix ke PR branch
  L->>G: CI_WATCH lagi
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
    V-->>Cache: skor lama
    Cache-->>C: pakai cache (skip eksekusi)
  else miss
    C->>C: jalan 12 kritikus (konkret via tool, stub abstain)
  end
  C->>Agg: aggregate(scores)
  Agg-->>L: Aggregate(pass?, weightedAvg, reasons)
```

## Catatan

- Semua diagram asumsikan `loop` sebagai conductor; modul lain stateless terhadap loop (dipanggil, mengembalikan nilai).
- Retry/DLQ diabstraksi ke `resil` — lihat `design/resil.md`.
- Sequence #2 dan #3 adalah satu-satunya jalur yang memicu `RECOVER`/`EXECUTE` ulang; keduanya **bounded** (max-3 via `resil/retry.ts`).

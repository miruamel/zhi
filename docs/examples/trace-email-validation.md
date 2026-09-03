# examples/trace-email-validation.md — End-to-End Trace

A concrete trace of the goal `"add email validation in auth.ts, tests green, open PR"` through the entire system. Makes the abstractions in `ARCHITECTURE.md` / `design/*` real.

## 0. Invocation

```
zhi run "add email validation in auth.ts, tests green, open PR" \
  --repo ./myapp --base main --budget 150000
```

`cli.ts` builds a `Goal { text, repo:"./myapp", base:"main", budget:150000 }` → `LoopDriver.run(buildHandlers(goal, ctx))`.

## 1. PLAN (orch)

- `parseGoal` → `Intent { action:"add", targets:["auth.ts"], constraints:["tests green","open PR"], scope:"file" }`.
- `buildDag` → `Dag` with 3 nodes: `s1 generate`, `s2 verify+test`, `s3 commit+pr`. Edges `s1→s2→s3`. Topo `[s1,s2,s3]`.
- `allocate` → `s1:60k, s2:50k, s3:10k` (proportional to complexity).
- `schedule` → order `[s1,s2,s3]` (serial v1).

## 2. ISOLATE (knowledge/git)

- `makeWorktree("main")` → `./myapp/.zhi/wt-<runId>`. The main repo is untouched.

## 3. EXECUTE (build)

- `generate(req)` calls `model/router.route("generate")` → heavy backend (9router GPT-4 class).
- `model/stream` (Zig WASM) parses SSE → tokens → `FileChange[]`:
  - `auth.ts`: adds `export function validateEmail(e:string):boolean { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }`
  - `auth.test.ts`: positive / negative tests.
- `verify` → syntax OK (`tsc --noEmit`), format OK.

## 4. CRITIQUE (critic)

- `cache.lookup` → miss (new).
- `runCritics`:
  - Security 0.92 (no injection / secrets).
  - Perf 0.80 (simple regex, O(n)).
  - Testing 0.85 (meaningful assertions).
  - Style 0.80 (lint clean).
  - 8 stubs → `abstain`.
- `aggregate` → `weightedAvg 0.84 ≥ 0.7`, nothing under floor → `pass:true`.

## 5. EVALUATE (eval)

- `runEval`:
  - build ✓ 320ms
  - test ✓ 1.2s (unit + integration green)
  - security ✓ 0 secret / SAST findings
  - gate ✓ coverage 0.84 ≥ 0.8, lint clean
- `EvalReport.gatePass = true`.

## 6. GATE (loop/states)

- `gatePass(state) = critic.pass ∧ eval.gatePass = true` → **COMMIT**.

## 7. COMMIT (knowledge/git)

- `commit(worktree)` → commit in `wt-<runId>`, branch `zhi/email-validation-<runId>`.

## 8. PR_OPEN (wiring/git gh)

- `gh pr create` → `PR #42` (url in `LoopReport.prUrl`). Status to TUI.

## 9. CI_WATCH (eval + gh run_watch)

- `gh run_watch` monitors CI.
- CI green → `CI_WATCH → DONE`.

## 10. DONE (loop)

`LoopReport { status:"done", prUrl:"https://github.com/.../pull/42", ciStatus:"pass", tokensUsed: 71_400, ledgerRef:"KB/ledger/<runId>.jsonl" }`.

The TUI shows the green banner + PR link.

## Variation: test fails (recovery)

When `s2` test is red:

- `EVALUATE.gatePass=false` → `RECOVER` → `resil` classifies → `patch`.
- `build.generate(req + errorContext)` revises `auth.test.ts` (fixes assertions).
- `EVALUATE` again → pass (or retry #3 fails → DLQ → `DONE(partial)`).

## Variation: CI red

When PR #42 CI is red:

- `CI_WATCH → EXECUTE` with error context.
- `build` pushes the fix to the PR branch.
- `CI_WATCH` again → pass.

## Cross-link

`configuration.md` (CLI), `design/loop.md` (state), `design/orch.md` (plan), `design/build.md` (generate), `design/critic.md` (aggregate), `design/eval.md` (gate), `design/knowledge.md` (worktree/commit), `design/resil.md` (recovery), `design/sequences.md` (#1 happy, #2 recovery, #3 CI).

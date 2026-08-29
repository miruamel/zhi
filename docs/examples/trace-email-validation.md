# examples/trace-email-validation.md — End-to-End Trace

Trace konkret goal `"tambah validasi email di auth.ts, test hijau, buka PR"` melalui seluruh sistem. Membuat abstrak di `ARCHITECTURE.md` / `design/*` menjadi nyata.

## 0. Invocation

```
zhi run "tambah validasi email di auth.ts, test hijau, buka PR" \
  --repo ./myapp --base main --budget 150000
```

`cli.ts` bangun `Goal { text, repo:"./myapp", base:"main", budget:150000 }` → `loop.runLoop(goal, ctx)`.

## 1. PLAN (orch)

- `parseGoal` → `Intent { action:"add", targets:["auth.ts"], constraints:["test hijau","buka PR"], scope:"file" }`.
- `buildDag` → `Dag` 3 node: `s1 generate`, `s2 verify+test`, `s3 commit+pr`. Edge `s1→s2→s3`. Topo `[s1,s2,s3]`.
- `allocate` → `s1:60k, s2:50k, s3:10k` (proporsional kompleksitas).
- `schedule` → urutan `[s1,s2,s3]` (serial v1).

## 2. ISOLATE (knowledge/git)

- `makeWorktree("main")` → `./myapp/.zhi/wt-<runId>`. Main repo tidak disentuh.

## 3. EXECUTE (build)

- `generate(req)` panggil `model/router.route("generate")` → backend heavy (9router GPT-4 class).
- `model/stream` (Zig WASM) parse SSE → token → `FileChange[]`:
  - `auth.ts`: tambah `export function validateEmail(e:string):boolean { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }`
  - `auth.test.ts`: test positif/negatif.
- `verify` → syntax OK (`tsc --noEmit`), format OK.

## 4. CRITIQUE (critic)

- `cache.lookup` → miss (baru).
- `runCritics`:
  - Security 0.92 (tidak ada injeksi/secret).
  - Perf 0.80 (regex sederhana, O(n)).
  - Testing 0.85 (ada assertion bermakna).
  - Style 0.80 (lint bersih).
  - 8 stub → `abstain`.
- `aggregate` → `weightedAvg 0.84 ≥ 0.7`, tak ada di bawah floor → `pass:true`.

## 5. EVALUATE (eval)

- `runEval`:
  - build ✓ 320ms
  - test ✓ 1.2s (unit + integration hijau)
  - security ✓ 0 secret/SAST find
  - gate ✓ coverage 0.84 ≥ 0.8, lint bersih
- `EvalReport.gatePass = true`.

## 6. GATE (loop/states)

- `gatePass(state) = critic.pass ∧ eval.gatePass = true` → **COMMIT**.

## 7. COMMIT (knowledge/git)

- `commit(worktree)` → commit di `wt-<runId>`, branch `zhi/email-validation-<runId>`.

## 8. PR_OPEN (tools/git gh)

- `gh pr create` → `PR #42` (url di `LoopReport.prUrl`). Status ke TUI.

## 9. CI_WATCH (eval + gh run_watch)

- `gh run_watch` pantau CI.
- CI hijau → `CI_WATCH → DONE`.

## 10. DONE (loop)

`LoopReport { status:"done", prUrl:"https://github.com/.../pull/42", ciStatus:"pass", tokensUsed: 71_400, ledgerRef:"KB/ledger/<runId>.jsonl" }`.

TUI tampilkan banner hijau + PR link.

## Variasi: test gagal (recovery)

Bila `s2` test merah:
- `EVALUATE.gatePass=false` → `RECOVER` → `resil` klasifikasi → `patch`.
- `build.generate(req + errorContext)` revisi `auth.test.ts` (fiks assertion).
- `EVALUATE` ulang → pass (atau retry ke-3 gagal → DLQ → `DONE(partial)`).

## Variasi: CI merah

Bila PR #42 CI merah:
- `CI_WATCH → EXECUTE` dengan error context.
- `build` push fix ke branch PR.
- `CI_WATCH` ulang → pass.

## Cross-link

`configuration.md` (CLI), `design/loop.md` (state), `design/orch.md` (plan), `design/build.md` (generate), `design/critic.md` (aggregate), `design/eval.md` (gate), `design/knowledge.md` (worktree/commit), `design/resil.md` (recovery), `design/sequences.md` (#1 happy, #2 recovery, #3 CI).

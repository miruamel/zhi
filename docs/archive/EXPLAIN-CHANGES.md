# EXPLAIN-CHANGES.md

Standar changelog Zhi. Setiap perubahan signifikan (PR yang mengubah behavior, API, atau arsitektur) WAJIB mencatat di sini, di bagian atas, sebelum merge.

## [Unreleased]

### fix

- engine/loop/observability/metrics.test: import `LoopEvent` (bukan `LoopState.GOAL_READY`) — event bukan state, gunakan enum yang tepat
- engine/loop/wiring/handlers.test + integration.test: `generate: async (...)` agar return `Promise<string>` sesuai kontrak `LoopDeps`
- engine/model/stream: `WebAssembly.Table` element `'anyfunc'` (TS DOM lib value valid; `'funcref'` ditolak typecheck). Fallback parser TypeScript murni saat WASM write barrier gagal di proot env (Zig wasm32 byte-write tidak ter-commit di env ini; TS parser identik logikanya dengan `native/stream/parse.zig`)
- native/stream/parse.zig: `const std = @import("std")` dipindah ke awal file (Zig declaration-order rule — import setelah pemakaian adalah compile error diam-diam)
- src/cli.ts: tambah import `LoopContext` + `gitCommit`; drop unused `ghCiWatch`
- src/cli.test.ts: type annotation `Critique` (strict mode `noImplicitAny`)
- tests/setup.ts: minimal beforeEach/afterEach (vitest `setupFiles` contract)

### chore

- tsconfig.json: strict mode + path aliases `@engine/*` `@src/*` `@native/*` + noEmit
- eslint.config.js flat config: `@typescript-eslint/parser` + `eslint-plugin-jsdoc` (require-jsdoc/param/returns)
- .prettierrc: singleQuote, trailingComma=all, printWidth=100
- vitest.config.ts: node env + coverage thresholds (lines 80 / branches 70)
- .commitlintrc.json: conventional commits, subject max 72 char
- .lintstagedrc: lint:fix + format on staged
- package.json scripts: `gate`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:ci`, `test:watch`, `arch:check`, `arch:metrics`, `native:build`
- .gitignore: tambah `native/.zig-cache/`, `coverage/`, `*.tsbuildinfo`, `bun.lock`
- native/out/stream.wasm: rebuild dengan Zig 0.14.0 `wasm32-freestanding -fno-entry --export=parse_sse`

### Verifikasi

| Gate         | Sebelum           | Sesudah                                           |
| ------------ | ----------------- | ------------------------------------------------- |
| typecheck    | n/a (no tsconfig) | 0 errors                                          |
| lint         | n/a (no eslint)   | 0 errors (124 JSDoc @returns warnings = baseline) |
| format:check | n/a               | clean                                             |
| test         | 210 pass / 4 fail | 214 pass / 0 fail                                 |

## [0.1.0] - 2026-08-30

### feat

- engine/critic/plant/architecture: architectureCritic() delegasi ke scripts/ci/architecture/check-circular.ts via spawnSync (sumber tunggal aturan layer; no re-implement). Exit 0 → score 1; non-zero → score 0 + finding berisi stdout guard. Mandate §6.11 + ADR-001 dipindah ke plant sehingga CRITIQUE stage menangkap drift arsitektural sebelum EVALUATE (@zhi)
- engine/critic/plant/compose: composeCritiques() tambah architectureCritic() — 5 critics (sloc/todo/imports/maintainability/architecture, weight 1.5 untuk imports + architecture) (@zhi)
- docs/design/critic.md: baris 3 (Architecture) stub → konkret; kalimat v1 daftar konkret tambah Architecture (@zhi)

### test

- engine/critic/plant/compose.test: perbarui ke 5 critics (sebelumnya 4) — assert 5th critic name=architecture dengan skor numerik (tanpa assert repo state, dijaga CI architecture-guard) (@zhi)
- src/cli.test: ctx.critiques length 4 → 5 (@zhi)

### docs

- docs/adr/ADR-008-architecture-critic.md: keputusan promosi + delegasi (risiko menengah, §2.2) (@zhi)

## [0.6.0] - 2026-08-30

### feat

- engine/loop/observability/logger: LoopLogger — log terstruktur JSON per transisi dengan correlation ID (runId); sink default console.log (@zhi)
- src/cli: main() pasang onTransition → logger.transition (trace lintas state, §8.2) (@zhi)

### test

- engine/loop/observability/logger.test: emit JSON ber-runId + generate runId (@zhi)

## [0.5.0] - 2026-08-30

### feat

- engine/loop/observability/metrics: LoopMetrics (akumulator StageRecord + summary) + timedStage(stage, fn, metrics) bungkus StateHandler dengan latency/error (@zhi)
- engine/loop/wiring/handlers: buildHandlers(ctx, deps, metrics?) — bila metrics diberi, setiap handler dibungkus timedStage (non-breaking; tanpa metrics identik) (@zhi)
- src/cli: main() cetak `[metrics] stages=.. errors=.. totalMs=..` pasca-run loop (@zhi)

### test

- engine/loop/observability/metrics.test: LoopMetrics.summary + timedStage ok/error (@zhi)
- engine/loop/wiring/test/integration.test: buildHandlers isi metrics per-stage bila diberi (@zhi)
- docs/adr/ADR-007-loop-metrics.md: keputusan observability loop (risiko menengah, §2.2/§8.2) (@zhi)

## [0.4.0] - 2026-08-30

### feat

- engine/model/invoker: CloudModelInvoker.stream(prompt) — SSE chat/completions → token per yield, berhenti di [DONE]; ModelInvoker.stream? opsional (stub lokal tak implement) (@zhi)
- engine/build/generate: generateStream(spec, invoker?) — alirkan token plan per prompt (4 layer + barrel); fallback batch chunk bila invoker tak stream (@zhi)
- src/cli: subcommand `gen <domain> [--stream]` — scaffold domain langsung; --stream alirkan token live (bila MODEL_API_KEY) (@zhi)

### test

- engine/build/generate.test: CloudModelInvoker.stream parse SSE (role-chunk + non-JSON diskip, [DONE] stop), generateStream per-prompt + fallback stub (@zhi)
- docs/adr/ADR-006-streaming-generate.md: keputusan streaming (risiko menengah, §2.2) (@zhi)

### ci

- .github/workflows/architecture.yml: exempt ./docs/adr dari batas ≤5 file/dir (arsip ADR tumbuh; selaras ./docs/design, ./audit-log/entries) (@zhi)

## [0.3.0] - 2026-08-30

### feat

- engine/model/invoker: selectInvoker(kind) konsultasi model/router — micro task (endpoint local) selalu LocalStubInvoker (kontrol biaya), heavy/light (9router/omp) pakai CloudModelInvoker bila MODEL_API_KEY ada (@zhi)

### test

- engine/model/router.test: selectInvoker route micro→stub (even with key), heavy→cloud (key), fallback stub tanpa key (@zhi)

## Format

```
## [<version>] - <YYYY-MM-DD>
### <tipe>
- <apa yang berubah> — <why / dampak> (@<author>)
```

Tipe: `feat` | `fix` | `refactor` | `docs` | `test` | `perf` | `ci` | `chore`.

## Aturan

- **Top-first**: entri terbaru di atas. Jangan append di bawah.
- **Behavior change wajib**: bila PR mengubah kontrak (signature, gate predicate, loop transition), catat explicitly + rujuk ADR bila ada.
- **Link ke ADR**: perubahan arsitektural yang butuh konteks → `@see docs/adr/ADR-XXX-*.md`.
- **No silent fallback**: bila menghapus behavior lama, sebutkan migrasi bagi konsumen.
- **Version**: ikuti `AGENTS.md` §Maturity. Experimental `0.y.z`: breaking = minor.

## Template PR

## [0.2.0] - 2026-08-30

### feat

- engine/critic/plant/maintainability: promosi critic Maintainability stub → konkret (deteksi duplikasi baris kode, DRY) — jalankan di composeCritiques; skor 1 bila 0 dup, penalty rasio salinan redundan (@zhi)

### test

- engine/critic/plant/maintainability/critic.test: codeLines filter + no-dup score 1 + dup penalty (@zhi)
- engine/critic/plant/compose.test: assert 4 critic (tambah maintainability) (@zhi)

### docs

- docs/design/critic.md: baris Maintainability konkret; perbarui catatan v1 (9/12 konkret) (@zhi)

## [0.1.0] - 2026-08-30

### feat

- engine/model/invoker: tambah CloudModelInvoker (OpenAI-compat chat/completions) + selectInvoker() — backend nyata di balik ModelInvoker seam; cloud aktif bila MODEL_API_KEY ada, else LocalStubInvoker (no-secret) (@zhi)
- engine/build/generate: jadikan async (await invoker.invoke) — ModelInvoker.invoke kini Promise<string> (@zhi)
- engine/loop/wiring/handlers: LoopDeps.generate bertipe Promise<string>; EXECUTE await via withResilience (flatten Promise) (@zhi)
- src/cli: deps.generate pakai selectInvoker() (env-driven) (@zhi)

### test

- engine/build/generate.test: async + assert CloudModelInvoker parse chat/completions + throw non-2xx + selectInvoker env-switch (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/model/invoker: ModelInvoker seam + LocalStubInvoker (tanpa LLM/secret) — generate kini model-pluggable; backend cloud/lokal (route() 9router/omp/local) ditunda di balik seam (@zhi)
- engine/build/generate: terima invoker? opsional; isi file via model bila ada, else deterministik @brief (@zhi)
- src/cli: deps.generate panggil scaffold dengan LocalStubInvoker (default no-secret) (@zhi)

### test

- engine/build/generate.test: assert isi via invoker berisi [local-stub] (@zhi)

### fix

- engine/eval, engine/loop/wiring, docs/adr: split test files -> subdir test/ + ADR exception -> exceptions/; hapus file lama tertinggal dari git mv (stash/pop) — penuhi invariant files/dir <=5 (architecture-guard main RED sebelum fix, run 33271624792, memblokir semua merge) (@zhi)

### ci

- .github/workflows/architecture.yml: pelanggaran diatasi via split vertikal (AGENTS.md), bukan weaken konvensi (@zhi)

## [0.1.0] - 2026-08-29

### refactor

- engine/loop/wiring/handlers: EXECUTE bungkus deps.generate dalam withResilience (retry max 3 + CircuitBreaker + classifyError dari engine/resil) — modul resil (dibangun untuk loop) kini terpakai; generate gagal -> DLQ -> BUDGET_OUT -> RECOVER (bounded, no infinite spin) (@zhi)

### test

- engine/loop/wiring/handlers.test: assert generate throw -> loop retry lalu abort graceful (attempts=3, error /recover exhausted/) (@zhi)

### docs

- docs/design/loop.md: edge case EXECUTE generate-failure via withResilience (@zhi)

## [0.1.0] - 2026-08-29

### fix

- engine/loop/states: CI_RED kini route ke RECOVER (bukan EXECUTE) — selaras ADR-005; cegah blind retry CI merah (@zhi)
- engine/loop/wiring/handlers: RECOVER pakai classifyError (resil/recover) + attempt cap (MAX_RECOVER=3) -> BUDGET_OUT (graceful DONE) bila fatal/exhausted; ctx.attempts + ctx.error terisi (@zhi)
- engine/loop/wiring/context: LoopContext.attempts? ditambah (@zhi)

### test

- engine/loop/wiring/handlers.test + integration.test: assert graceful DONE (attempts=3, error) bukan throw budget; states.test: CI_RED -> RECOVER (@zhi)

### docs

- ARCHITECTURE.md + loop.md: CI_WATCH merah -> RECOVER (bounded) (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/eval: pipeline evaluasi nyata — test.ts (bun test di worktree), security.ts (scanSecrets grep secret, fail-closed), index.ts (evaluate -> gate) (@zhi)
- engine/loop/wiring/handlers: LoopDeps.eval? dipanggil di EVALUATE bila ctx.worktree ada; hasil jadi qualityGateGreen di gatePass (@zhi)
- src/cli: autonomousDeps pasang eval adapter (evaluate di worktree) (@zhi)

### test

- engine/eval/test.test: runTests pass/fail via temp worktree (@zhi)
- engine/eval/security.test: scanSecrets detect api key / clean (@zhi)
- engine/eval/index.test: evaluate pass clean / block secret (@zhi)

### docs

- docs/design/eval.md: interface runEval -> evaluate(worktree); v1 = test+security+gate, sandbox = git worktree (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/loop/wiring/git: gitIsolate kini buat git worktree terpisah (bukan branch di working tree) — selaras security.md §Sandbox; tambah gitCommit (add -A + commit di worktree) (@zhi)
- engine/loop/wiring/handlers: ISOLATE set ctx.worktree + ctx.branch; EXECUTE generate tulis scaffold ke worktree; COMMIT/PR_OPEN jalan di dalam worktree (path dialirkan via ctx.worktree) (@zhi)
- src/cli: generate adapter tulis file scaffold ke worktree bila disediakan; autonomousDeps pasang gitCommit/ghPrOpen(worktree) (@zhi)

### test

- engine/loop/wiring/git.test: integrasi gitIsolate+gitCommit di temp repo (worktree terbuat, commit di dalamnya) (@zhi)
- engine/loop/wiring/handlers.test: assert ctx.worktree + commit/prOpen terima path worktree (@zhi)
- engine/loop/wiring/integration.test: ciGreen -> ciWatch (kontrak LoopDeps baru) (@zhi)

### docs

- README + ARCHITECTURE: "branch git terisolasi" -> "git worktree terpisah" (akurat dgn impl) (@zhi)

## [0.1.0] - 2026-08-29

### docs

- README Status: koreksi generate/ISOLATE/PR_OPEN/CI_WATCH masih stub + "81 pass" -> nyata (ADR-005) + 96 pass; "git worktree" -> "branch git" (@zhi)
- docs/design/loop.md: Interface (runLoop -> buildHandlers/LoopDriver), Files (pipeline.ts/index.ts -> wiring/handlers.ts/context.ts/git.ts/driver.ts), ref knowledge/git.ts -> wiring/git.ts (@zhi)
- docs/ARCHITECTURE.md: 10 ref loop usang (pipeline.ts/loop/index.ts/runLoop/knowledge/git.ts/tools/git.ts -> wiring/handlers.ts/driver.ts/wiring/git.ts) (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/loop/wiring/handlers: LoopDeps.isolate?/commit?/prOpen?/ciWatch? dipanggil di ISOLATE/COMMIT/PR_OPEN/CI_WATCH — loop kini otonom isolate branch, buka PR, pantau CI (ADR-005) (@zhi)
- engine/loop/wiring/git: adapter deterministik gitIsolate/ghPrOpen/ghCiWatch via git/gh CLI (@zhi)
- src/cli: mode autonom (ZHI_AUTO_PR=1) pasang adapter git/gh; mode offline (default) tanpa ciWatch -> CI dianggap green (@zhi)

### refactor

- engine/loop/wiring/handlers: hapus referensi deps.ciGreen() (tidak ada di interface) -> CI_WATCH pakai ciWatch? (@zhi)

## [0.1.0] - 2026-08-29

### ci

- .github/workflows/architecture.yml: Setup Zig ganti setup-zig@v1 -> download langsung Zig 0.16.0 dari ziglang.org (mirror action hanya punya <=0.14.0; 0.14.0 tolak -dynamic wasm32-freestanding) (@zhi)

### fix

- native/stream/build.sh: zig build-lib -dynamic -rdynamic -fPIC (wasm reactor import memory, sesuai wrapper engine/model/stream.ts) — 0.14.0 CI tolak -dynamic; 0.16.0 wajib (@zhi)
- native/stream/parse.zig: buang no-op main() (dead code; build-lib -dynamic tak butuh) (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/build/context/compress: kompres konteks by budget + weight (pertahankan entri prioritas) — tutup trio build v1 (generate/verify/compress) (@zhi)
- engine/loop/wiring/handlers: LoopDeps.compress? dipanggil di EXECUTE (opsional) — jaga context window loop panjang (@zhi)
- src/cli: adapter compress (budget 20000, no-op untuk output saat ini) (@zhi)

### fix

- src/cli: offlineDeps kehilangan `paretoThreshold` (terhapus edit) -> gate EVALUATE selalu GATE_FAIL -> loop RECOVER tak berhingga; dikembalikan (@zhi)

### test

- engine/build/context/compress.test: drop/truncate by budget + weight, empty (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/build/verify: verifikasi statis scaffold (<=5 file/dir, @brief wajib, no deep-relative import) — generate kini terverifikasi (@zhi)
- src/cli: LoopDeps.generate jalankan verify, lampirkan `// verify: ok`/`FAIL` ke output EXECUTE (@zhi)

### test

- engine/build/verify.test: pass / missing @brief / >5 file per dir / deep import (@zhi)
- src/cli.test: ctx.code berisi `verify: ok` (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/build/generate: scaffold modul domain fractal (handlers/services/utils/constants + barrel) per AGENTS.md, return ScaffoldFile[] — generate kini nyata (deterministik, tanpa LLM) (@zhi)
- src/cli: LoopDeps.generate serialize scaffold via adapter planSymbol — EXECUTE hasilkan struktur modul nyata (@zhi)

### test

- engine/build/generate.test: scaffold 5 file, Doxygen header, <=5 file guard (@zhi)
- src/cli.test: ctx.code berisi path scaffold engine/build/* (@zhi)

## [0.1.0] - 2026-08-29

### feat

- src/cli: LoopDeps.generate sekarang memanggil engine/build/generate via adapter planSymbol — EXECUTE route ke modul nyata (generate itu sendiri masih stub) (@zhi)

### test

- src/cli.test: perbarui kontrak code ke stub fungsi + assert gate-pass (score>=0.8, passed) (@zhi)

## [0.1.0] - 2026-08-29

### feat

- engine/orch: planner (parseGoal, buildDag, topoSort+CycleError, allocate, schedule) — tutup gap PLAN state, hasilkan DAG rencana nyata (@zhi)
- src/cli: LoopDeps.plan sekarang memanggil orch (parseGoal→buildDag→allocate→schedule) (@zhi)

### test

- engine/orch/orch.test.ts: parse/constraint, buildDag chain, topoSort cycle, allocate proporsional, schedule order (@zhi)
- src/cli.test: perbarui kontrak plan/code ke output DAG nyata (@zhi)

### docs

- README Status: koreksi "Docs-only" -> prototype terimplementasi (@zhi)

## Verifikasi

PR yang tidak update `EXPLAIN-CHANGES.md` untuk perubahan behavior = ditolak di review. Docs-only PR (menambah `docs/design/*` tanpa ubah kode) dikecualikan.

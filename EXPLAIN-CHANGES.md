# EXPLAIN-CHANGES.md

Standar changelog Zhi. Setiap perubahan signifikan (PR yang mengubah behavior, API, atau arsitektur) WAJIB mencatat di sini, di bagian atas, sebelum merge.

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

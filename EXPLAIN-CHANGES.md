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

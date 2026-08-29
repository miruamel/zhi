# ARCHITECTURE — Zhi (志)

Spesifikasi arsitektur sistem penuh. Melengkapi `README.md` (ringkas) dan `docs/design/*.md` (per-modul). Diagram mermaid sama dengan `README.md`; di sini diuraikan alur, kontrak antar-modul, feedback loop, dan native hot path.

## 1. Tujuan & posisi

Zhi adalah **terminal coding agent** yang menjalankan siklus dev secara otonom: dari goal berbahasa alami sampai PR merge, dengan gate berbasis kode di tiap transisi. Berbeda dari chat-wrapper (Claude Code/OMP/OpenCode/Aider/KiloCode/Hermes) karena dua pilar:

- **Conductor loop** yang menutup siklus (`COMMIT` + `PR_OPEN` + `CI_WATCH`), bukan berhenti di diff.
- **Multi-critic plant** yang memutus layak-commit lewat 12 kritikus + *weighted Pareto*, bukan satu model call.

## 2. Komponen utama

| Subgraph | Modul | Peran |
|---|---|---|
| LOOP | `engine/loop/` | Conductor state machine; menjahit semua modul lewat `pipeline.ts`. |
| ORCH | `engine/orch/` | Ubah goal → DAG step; alokasi budget/token; jadwalkan (serial dulu, paralel belakangan). |
| BUILD | `engine/build/` | Generate multi-file; petakan inter-file dep; self-verify; kelola konteks (prompt compression). |
| CRITIC | `engine/critic/` | 12 kritikus + semantic cache + meta-aggregator Pareto. |
| EVAL | `engine/eval/` | Toolchain: sandbox, build/test, SAST/secret, perf, compliance, quality gate. |
| RESIL | `engine/resil/` | Circuit breaker, retry budget (max-3), DLQ, recovery. |
| KNOWLEDGE | `engine/knowledge/` | Vector DB, git-native index, KB docs/API, version history. |
| MODEL | `engine/model/` | Router LLM (9router/OMP/local, tier heavy/light/micro), stream Zig, context. |
| NATIVE | `native/` | Zig→WASM: stream parse, diff, embed. |
| SRC | `src/` | `cli.ts` entry + `tui/` ink viewer. |

## 3. Alur eksekusi utama (happy path)

1. **INTAKE** — `cli.ts` terima goal (teks) + flag (repo, base branch, budget). Masuk `loop/index.ts`.
2. **PLAN** — `orch/parse.ts` tokenisasi goal → `orch/dag.ts` bangun DAG step + `cycle detect` + `dependency resolver`. `orch/budget.ts` alokasi token per step. `orch/scheduler.ts` urutkan (priority queue).
3. **ISOLATE** — `knowledge/git.ts` buat **git worktree** terisolasi dari base branch. Semua eksekusi terjadi di worktree, main repo aman.
4. **EXECUTE** — `build/generate.ts` panggil `model/router.ts` (stream via `model/stream.ts` Zig) untuk tulis/edit file. `build/verify.ts` self-verify syntax. `build/context.ts` jaga konteks muat (prompt compression bila loop panjang).
5. **CRITIQUE** — `critic/cache.ts` cek semantic cache (embedding similarity dari `knowledge/vectors.ts`). `critic/critics.ts` jalan 12 kritikus. `critic/aggregate.ts` hitung weighted Pareto → skor layak-commit.
6. **EVALUATE** — `eval/index.ts` picu `eval/sandbox.ts` (worktree lokal dulu; container belakangan) → `eval/test.ts` (build + unit + integration) → `eval/security.ts` (SAST/DAST + secret) → `eval/gate.ts` (perf bench + compliance + quality gate).
7. **GATE** — `loop/states.ts` cek: critic Pareto ≥ threshold **DAN** eval quality-gate hijau.
   - **yes** → `COMMIT` (`knowledge/git.ts` commit di worktree).
   - **no** → `RECOVER` (`resil/`).
8. **PR_OPEN** — `tools/git.ts` (gh) buka PR dari worktree branch. Status ke `tui/`.
9. **CI_WATCH** — `eval/` + `tools/git.ts` (`gh run_watch`) pantau CI. Fail → balik ke `EXECUTE` dengan error sebagai konteks (bounded). Pass → `DONE`.

## 4. Feedback loops (dashed)

- **`K1 -.-> C0`** — Vector DB (`knowledge/vectors.ts`) feed semantic cache (`critic/cache.ts`): prompt mirip tidak perlu di-kritik ulang penuh.
- **`K2 -.-> B3`** — Git-native history (`knowledge/git.ts`) feed inter-file dep mapper (`build/generate.ts`): pahami struktur repo sebelum generate.
- **`R3 -.-> L1`** — Retry budget habis (`resil/retry.ts`) → replan (`orch/`) dari awal dengan konteks kegagalan.
- **`E9 -.-> C4`** — Eval quality-gate (`eval/gate.ts`) feed meta-critic (`critic/aggregate.ts`): bobot kritikus bisa disesuaikan dari hasil eval.
- **`M2 -.-> N1`** — Model stream (`model/stream.ts`) pakai Zig WASM parse (`native/stream/parse.wasm`).
- **`K2 -.-> K1`** — Git-native index di-embed ke Vector DB (`native/embed/embed.wasm`).

## 5. Native hot paths (Zig → WASM)

| Modul | File | Why Zig |
|---|---|---|
| Stream parse | `native/stream/parse.zig` | SSE chunk → token + tool-call extract; CPU-bound, harus deterministik & cepat. |
| Diff | `native/diff/diff.zig` | Unified diff compute antar revision; hot saat eval bandingkan before/after. |
| Embed | `native/embed/embed.zig` | Code embedding untuk Vector DB; matriks berat, WASM isolasi aman. |

Setiap `native/<area>/build.zig` emit `native/out/<name>.wasm` (gitignored). TS wrapper `engine/<area>/zigBridge.ts` panggil `WebAssembly.instantiate`. Konsumer import wrapper, bukan `.wasm`.

## 6. TUI (ink)

`src/tui/index.tsx` adalah viewer **tipis** di atas loop. Menampilkan:

- DAG step (status: pending/running/done/failed).
- Transisi state machine saat terjadi.
- Skor 12 kritikus + Pareto aggregate per step.
- Hasil eval (build/test/SAST/secret/gate).
- Status PR + CI (dari `gh run_watch`).
- Log token/budget (dari `knowledge/store.ts`).

TUI tidak mengambil keputusan — hanya visualisasi. Keputusan di `loop/` + `critic/aggregate.ts`.

## 7. State machine loop (detail)

`engine/loop/states.ts` mendefinisikan `LoopState`:
`INTAKE | PLAN | ISOLATE | EXECUTE | CRITIQUE | EVALUATE | RECOVER | COMMIT | PR_OPEN | CI_WATCH | DONE`.

Transisi dikendalikan `loop/index.ts` (`runLoop`):
- `EVALUATE → COMMIT` hanya bila `gatePass(state) === true`.
- `EVALUATE → RECOVER` bila gagal; `RECOVER → EXECUTE` setelah strategi recovery dipilih (bounded).
- `CI_WATCH → EXECUTE` bila CI merah (dengan error context); `CI_WATCH → DONE` bila hijau.
- Budget habis di mana pun → `RECOVER` lalu (bila tidak bisa) `DONE` dengan status `PARTIAL` + laporan.

## 8. v1 scope (konkret vs stub)

**Konkret di v1:**
- `loop/*` (state machine + pipeline + gate + recover wiring).
- `orch/dag.ts` (parser + DAG + cycle + dep + priority + budget).
- `build/generate.ts` + `build/verify.ts` + `build/context.ts`.
- `critic/cache.ts` + `critic/critics.ts` (Security/Perf/Testing/Style konkret) + `critic/aggregate.ts`.
- `eval/test.ts` + `eval/security.ts` + `eval/gate.ts`.
- `resil/*` (breaker + retry + recover).
- `knowledge/git.ts` + `knowledge/store.ts`.
- `model/router.ts` + `model/stream.ts`.
- `src/cli.ts` + `src/tui/index.tsx`.

**Stub (interface siap, impl belakangan) — ponytail:**
- `build/sanitize.ts` (AST/PII/XSS) — belakangan; input dari user trust boundary, bukan untrusted web.
- 8 kritikus sisa (Architecture/Doc/DevOps/Legal/Privacy/DX/Accessibility/Maintainability) — daftar di `critic/critics.ts` sebagai registry dengan impl `not-implemented` + upgrade path.
- `eval/sandbox.ts` container — v1 pakai worktree lokal; container bila jalan kode tak-terpercaya.
- `knowledge/vectors.ts` + `knowledge/docs.ts` + `knowledge/versions.ts` — Vector DB butuh `native/embed` + infrastruktur; v1 pakai git-native + flat KB.
- `native/embed/embed.zig` — menunggu Vector DB.

## 9. Cross-reference

- Loop: `docs/design/loop.md`
- Orchestrator: `docs/design/orch.md`
- Builder: `docs/design/build.md`
- Critic plant: `docs/design/critic.md`
- Eval toolchain: `docs/design/eval.md`
- Resilience: `docs/design/resil.md`
- Knowledge: `docs/design/knowledge.md`
- Model: `docs/design/model.md`
- Keputusan: `docs/adr/ADR-001..004`
- Commit rule: `docs/standards/commit.md`

# Zhi (志)

Terminal coding agent dengan **autonomous-loop engine** dan **multi-critic plant** (12 kritikus + meta-aggregator Pareto). Zhi mengambil goal berbahasa alami, merencanakannya sebagai DAG, mengeksekusi di git worktree terpisah, menilai lewat 12 kritikus + toolchain evaluasi, lalu commit + buka PR + pantau CI — berdiri sendiri sampai goal terpenuhi tanpa intervensi manusia di setiap step.

## Mengapa ada Zhi

Tool agent saat ini (Claude Code, OMP, OpenCode, Aider, KiloCode, Hermes) sebagian besar adalah *chat wrapper* dengan tool calls. Perbedaannya tipis. Zhi mengambil sudut tajam yang belum dimenangkan: **loop yang benar-benar menutup siklus dev dengan gate berbasis kode**, bukan cuma generate diff.

Dua pilar kecanggihan:

1. **Autonomous-loop conductor** — state machine `INTAKE → PLAN → ISOLATE → EXECUTE → CRITIQUE → EVALUATE → COMMIT → PR_OPEN → CI_WATCH → DONE`. Setiap transisi dijaga gate yang *machine-decidable* (build hijau, test hijau, lint bersih, secret-scan bersih, quality-gate lolos). Recovery *bounded* (circuit breaker + retry max-3), bukan spin tak terbatas.
2. **Multi-critic plant** — 12 kritikus (Security, Perf, Architecture, Testing, Doc, DevOps, Legal, Privacy, Style, DX, Accessibility, Maintainability) menilai hasil, lalu `aggregate.ts` menghitung *weighted Pareto frontier* untuk memutus layak-commit atau tidak. Keputusan terukur, bukan vibes.

## Arsitektur (ringkas)

```mermaid
flowchart TD
  subgraph LOOP[LOOP: Autonomous Conductor]
    L1[INTAKE Goal] --> L2[PLAN orch]
    L2 --> L3[ISOLATE git worktree]
    L3 --> L4[EXECUTE build]
    L4 --> L5[CRITIQUE critic plant]
    L5 --> L6[EVALUATE eval toolchain]
    L6 --> L7{GATE pass?}
    L7 -->|yes| L8[COMMIT git]
    L7 -->|no| L9[RECOVER resil]
    L9 --> L4
    L8 --> L10[PR_OPEN gh]
    L10 --> L11[CI_WATCH]
    L11 -->|fail| L4
    L11 -->|pass| L12[DONE]
  end

  subgraph ORCH[ORCH: Planner + Scheduler]
    O1[Task Parser] --> O2[DAG Builder]
    O2 --> O3[Cycle Detector]
    O3 --> O4[Dependency Resolver]
    O4 --> O5[Priority Queue]
    O5 --> O6[Budget/Token Allocator]
    O6 --> O7[Resource Scheduler]
    O7 --> O8[Parallel Scheduler]
  end

  subgraph BUILD[BUILD: Generator]
    B1[Input Sanitizer AST/PII/XSS] --> B2[Multi-File Generator]
    B2 --> B3[Inter-File Dep Mapper]
    B3 --> B4[Self-Verify Syntax]
    B4 --> B5[Formatter]
    B6[Prompt Compression/Context] --> B2
  end

  subgraph CRITIC[CRITIC PLANT: 12 Critics]
    C0[Semantic Cache] --> C1[Model Router heavy/light/micro]
    C1 --> C2[12 Critics]
    C2 --> C3[JSON Extractor]
    C3 --> C4[Meta-Critic Weighted Pareto]
  end

  subgraph EVAL[EVAL: Toolchain]
    E1[Container Sandbox] --> E2[Build/Compile]
    E2 --> E3[Unit Test]
    E3 --> E4[Integration Test]
    E4 --> E5[SAST/DAST]
    E5 --> E6[Secret Detect]
    E6 --> E7[Perf Benchmark]
    E7 --> E8[Compliance]
    E8 --> E9[Quality Gate]
  end

  subgraph RESIL[RESIL: Fallback]
    R1[Circuit Breaker] --> R2[Fallback Router]
    R2 --> R3[Retry Budget max3]
    R3 --> R4[Dead Letter Queue]
    R4 --> R5[Error Classify]
    R5 --> R6[Recovery Strategy]
  end

  subgraph KNOW[KNOWLEDGE: Persistence]
    K1[Vector DB code embeddings]
    K2[Git-Native Repo indexed]
    K3[Knowledge Base docs/API]
    K4[Version History OpenAPI]
  end

  subgraph MODEL[MODEL: LLM]
    M1[Router 9router/OMP/local] --> M2[Stream Zig WASM parse]
    M2 --> M3[Context Manager]
  end

  subgraph NATIVE[ZIG HOT PATHS]
    N1[stream/parse.wasm]
    N2[diff/diff.wasm]
    N3[embed/embed.wasm]
  end

  subgraph SRC[SRC: Entry]
    S1[cli.ts] --> S2[tui/index.tsx ink]
  end

  L2 --> O1
  L4 --> B1
  L5 --> C0
  L6 --> E1
  L9 --> R1
  L3 --> K2
  B2 --> K3
  C1 --> M1
  B2 --> M1
  L10 --> S2
  L11 --> E1

  K1 -.-> C0
  K2 -.-> B3
  R3 -.-> L1
  E9 -.-> C4
  M2 -.-> N1
  K2 -.-> K1
```

## Modul

| Modul | Path | Tanggung jawab |
|---|---|---|
| loop | `engine/loop/` | Conductor state machine; menjahit semua modul | 
| orch | `engine/orch/` | Task parser, DAG builder, cycle detect, budget/token, scheduler | 
| build | `engine/build/` | Multi-file generator, inter-file dep mapper, self-verify, context | 
| critic | `engine/critic/` | 12 kritikus + semantic cache + meta-aggregator Pareto | 
| eval | `engine/eval/` | Sandbox, build/test, SAST/secret, perf, compliance, quality gate | 
| resil | `engine/resil/` | Circuit breaker, retry budget, DLQ, recovery | 
| knowledge | `engine/knowledge/` | Vector DB, git-native index, KB, version history | 
| model | `engine/model/` | Router LLM (9router/OMP/local), stream Zig, context | 
| native | `native/` | Zig→WASM hot path: stream parse, diff, embed | 
| src | `src/` | `cli.ts` entry + `tui/` ink viewer | 

## Status

**Prototype terimplementasi (experimental).** Mayoritas modul engine sudah ada dengan test hijau (`bun test` 96 pass). `engine/orch/` (planner: parseGoal/buildDag/allocate/schedule) dan `engine/loop/` (conductor state machine) sudah nyata; `generate`/`verify`/`compress` (`engine/build`) sudah nyata; `ISOLATE`/`PR_OPEN`/`CI_WATCH` di-wiring via adapter git/gh opsional (`engine/loop/wiring/git.ts`, aktif bila `ZHI_AUTO_PR=1`) — lihat ADR-005. Mode offline (default) tanpa `ciWatch` → CI dianggap green (aman untuk test/smoke).

## Cara baca docs

1. `docs/ARCHITECTURE.md` — sistem penuh, alur data, feedback loop, native hot path.
2. `docs/design/*.md` — spesifikasi per modul (interface, alur, edge case, v1 vs later).
3. `docs/adr/*.md` — keputusan arsitektur (ADR) yang tidak bisa dibalik mudah.
4. `AGENTS.md` + `AGENTS.Style.md` — konvensi layer & standar dokumentasi (Doxygen Universal).
5. `EXPLAIN-CHANGES.md` — format changelog per perubahan.

## Konvensi singkat

- Root berbasis **layer**, bukan domain (`engine/`, `src/`, `native/` sebagai sibling).
- **Atomic nesting**: ≤4 file per folder, ≤200 SLOC per file, vertikal over horizontal.
- Bahasa: TS (engine types/edge), JS (glue self-register), Zig→WASM (hot path). Runtime **Bun** (eksekusi `.ts`/`.js` native).
- Doc standard: `@AGENTS.Style.md` (Doxygen Universal).

## Yang sengaja di-drop (YAGNI)

Dari sketsa awal, **Top Layer gateway** (Web/API/Rate Limiter/Token Auth) dan **Monitoring layer** penuh (tracing/perf analytics dashboard) dibuang. Zhi adalah CLI lokal single-user: cukup input validation + sanitasi di trust boundary, dan logging + cost log ringan (fold ke `knowledge/store.ts`).

## Lisensi

Zhi dirilis di bawah **MIT License**. Lihat `LICENSE`. Repositori saat ini private; lisensi berlaku saat diakses publik.

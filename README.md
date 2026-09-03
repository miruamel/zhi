# Zhi (志)

[![CI](https://img.shields.io/badge/CI-passing-7cf3a4?style=flat-square)](https://github.com/miruamel/zhi/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Maturity: experimental](https://img.shields.io/badge/maturity-experimental-orange?style=flat-square)](package.json)
[![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1?style=flat-square)](https://bun.sh)
[![Node ≥ 20](https://img.shields.io/badge/node-%E2%89%A520-339933?style=flat-square)](https://nodejs.org)

A terminal coding agent with an **autonomous-loop engine** and a **multi-critic plant** (15 critics + meta-aggregator Pareto). Zhi takes a natural-language goal, plans it as a DAG, executes it in an isolated git worktree, evaluates through 15 critics and a toolchain, then commits + opens a PR + watches CI — standing on its own until the goal is met without human intervention at every step.

## Why Zhi exists

Today's agent tools (Claude Code, OMP, OpenCode, Aider, KiloCode, Hermes) are mostly chat wrappers with tool calls. The differences are thin. Zhi takes a sharp angle that hasn't been won: **a loop that actually closes the dev cycle with code-grounded gates**, not just emitting a diff.

Two pillars of sophistication:

1. **Autonomous-loop conductor** — a state machine `INTAKE → PLAN → ISOLATE → EXECUTE → CRITIQUE → EVALUATE → COMMIT → PR_OPEN → CI_WATCH → DONE`. Every transition is guarded by a machine-decidable gate (build green, tests green, lint clean, secret-scan clean, quality-gate pass). Recovery is **bounded** (circuit breaker + retry max-3), not an open-ended spin.
2. **Multi-critic plant** — 15 critics (Security, Perf, Architecture, Testing, Doc, DevOps, Legal, Privacy, Style, DX, Accessibility, Maintainability, SLOC, Imports, Todo) score the result, then `aggregate.ts` computes a **weighted Pareto frontier** to decide commit-readiness. Decisions are measured, not vibes.

## Quickstart

```bash
bun install
bun test                   # run the entire test suite
bun run cli "<goal>"       # one loop cycle (offline, no PR)
bun run cli critique:repo  # audit repo hygiene (DevOps/Legal/DX/Testing)
bun run arch:check         # guard architecture (circular / illegal layer edge)
```

## Architecture (overview)

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
    B1[Input Sanitiser AST/PII/XSS] --> B2[Multi-File Generator]
    B2 --> B3[Inter-File Dep Mapper]
    B3 --> B4[Self-Verify Syntax]
    B4 --> B5[Formatter]
    B6[Prompt Compression/Context] --> B2
  end
  subgraph CRITIC[CRITIC PLANT: 15 Critics]
    C0[Semantic Cache] --> C1[Model Router heavy/light/micro]
    C1 --> C2[15 Critics]
    C2 --> C3[JSON Extractor]
    C3 --> C4[Meta-Critic Weighted Pareto]
  end
  subgraph EVAL[EVAL: Toolchain]
    E1[Worktree Sandbox] --> E2[Build/Compile]
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

## Modules

| Module     | Path                  | Responsibility                                                    |
| ---------- | --------------------- | ----------------------------------------------------------------- |
| loop       | `engine/loop/`        | Conductor state machine; stitches all modules                    |
| orch       | `engine/orch/`        | Task parser, DAG builder, cycle detect, budget/token, scheduler   |
| build      | `engine/build/`       | Multi-file generator, inter-file dep mapper, self-verify, context |
| critic     | `engine/critic/`      | 15 critics + semantic cache + meta-aggregator Pareto             |
| eval       | `engine/eval/`        | Sandbox, build/test, SAST/secret, perf, compliance, quality gate  |
| resil      | `engine/resil/`       | Circuit breaker, retry budget, DLQ, recovery                      |
| knowledge  | `engine/knowledge/`   | Vector DB, git-native index, KB, version history                  |
| model      | `engine/model/`       | LLM router (9router/OMP/local), Zig stream parse, context         |
| native     | `native/`             | Zig→WASM hot path: stream parse, diff, embed                      |
| src        | `src/`                | `cli.ts` entry + `tui/` ink viewer                                |

## Status

**Prototype implemented (experimental).** Most engine modules exist with green tests (`bun test` 221 pass). `engine/orch/` (planner: `parseGoal`/`buildDag`/`allocate`/`schedule`) and `engine/loop/` (conductor state machine) are real; `generate`/`verify`/`compress` (`engine/build`) are real; `ISOLATE`/`PR_OPEN`/`CI_WATCH` are wired via an optional git/gh adapter (`engine/loop/wiring/git.ts`, active when `ZHI_AUTO_PR=1`) — see ADR-005. Offline mode (default) without `ciWatch` → CI is assumed green (safe for test/smoke).

## How to read the docs

1. `docs/ARCHITECTURE.md` — full system, data flow, feedback loop, native hot path.
2. `docs/design/*.md` — per-module spec (interface, flow, edge cases, v1 vs later).
3. `docs/adr/*.md` — architectural decisions that are not easily reversible.
4. `AGENTS.md` + `AGENTS.Style.md` — layer convention + doc standard (Doxygen Universal).
5. `CHANGES.md` — changelog per change (Keep a Changelog + SemVer; historical archive at `docs/archive/EXPLAIN-CHANGES.md`).

## Conventions (short)

- Root is **layer-first**, not domain (`engine/`, `src/`, `native/` as siblings).
- **Atomic nesting**: ≤4 files per folder, ≤200 SLOC per file, vertical over horizontal.
- Languages: TS (engine types/edge), JS (self-registering glue), Zig→WASM (hot path). Runtime is **Bun** (runs `.ts`/`.js` natively).
- Doc standard: `@AGENTS.Style.md` (Doxygen Universal).
- Brand assets: `assets/` (favicon, logo, OG banner, ASCII splash). See `assets/README.md`.

## Deliberately dropped (YAGNI)

From the early sketch, the **Top Layer gateway** (Web/API/Rate Limiter/Token Auth) and a full **Monitoring layer** (tracing/perf analytics dashboard) are cut. Zhi is a local single-user CLI: input validation + sanitisation at the trust boundary is enough, and logging + a light cost log fold into `knowledge/store.ts`.

## License

Zhi is released under the **MIT License**. See `LICENSE`. The repository is currently private; the licence applies once it's publicly accessible.

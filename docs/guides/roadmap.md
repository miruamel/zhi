# roadmap.md — Phased Delivery

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

Zhi ships in phases. Every release raises maturity per `AGENTS.md` §Maturity. Experimental `0.y.z`: breaking = minor; minor = batch per milestone.

## v0.1.0 — Experimental (foundation)

**Scope:** end-to-end single-step happy path + bounded recovery.

- `loop/*` (state machine + pipeline + `gatePass` + recover wiring).
- `orch/*` (parse, dag, cycle, budget, serial scheduler).
- `critic/*` — 13 concrete critics (accessibility, architecture, compose, doc, hygiene, imports, maintainability, perf, privacy, security, sloc, style, todo) + aggregate. All promoted from stub → concrete (PR #23–#28, #31). Repo-wide critic score 1.0, 0 findings on `main`.
- `model/*` (router 9router/OMP/local + stream Zig WASM).
- `native/stream/parse.wasm` (Zig).
- `src/cli.ts` + `src/tui/` (ink, thin viewer).
- Testing: unit + integration loop + e2e dummy repo.

**Exit:** `zhi run "<goal>"` on a dummy repo → PR opened + CI green, without intervention.

## v0.2.0 — Experimental (depth)

- `orch/scheduler.ts` parallel across steps — **DEFERRED** (see v0.2.0 notes): `buildDag` only produces linear chains, so there are no parallel steps; no conflict resolver exists yet (the roadmap incorrectly said "already there").
- The remaining 8 critics promoted from stub → concrete, in stages (Architecture, Doc, DevOps, Privacy, DX, Accessibility, Maintainability, Legal).
- `eval/sandbox.ts` container (for untrusted code).
- `build/sanitize.ts` (AST/PII/XSS) — when Zhi takes web input.
- ~~The remaining 8 critics promoted from stub → concrete, in stages (Architecture, Doc, DevOps, Privacy, DX, Accessibility, Maintainability, Legal).~~ **DONE** — all 13 critics are concrete as of v0.1.2 (see v0.1.0 scope above).

### v0.2.0 notes

- **Parallel scheduler deferred.** `buildDag` (`dag.ts`) only produces linear chains (`s{i}` depends on `s{i-1}`), so there are no independent steps to run in parallel. The roadmap stated "conflict resolver already exists" — **inaccurate**: no conflict resolver exists in `types.ts`/`dag.ts`/`schedule.ts`. Adding a resolver now = dead code (no branch to resolve). Deferred to v1.0.0 (Multi-PR orchestration), where parallel waves become meaningful.
- **Sandbox container** (`eval/sandbox.ts`) needs a container runtime; not prioritised in this env.
- **Sanitise** (`build/sanitize.ts`) is conditional: only when Zhi takes web input (AST/PII/XSS). Not yet active.
- All 11 single-file critics + 4 repo-wide hygiene (devops/legal/dx/testing) pass; testing gap closed (PR #23–#28). The `testing` critic now = 0 findings on `main`.

## v0.3.0 — Experimental → Stable candidate

- `knowledge/vectors.ts` — **graduated** (in-memory VectorStore + cosine search, PR #31). `native/embed/embed.wasm` deferred: needs an embedding model (Zig) before the `critic/cache` semantic cache becomes meaningful.
- `knowledge/docs.ts` (KB docs/API) + `knowledge/versions.ts` (OpenAPI history) — waiting for input sources (OpenAPI spec / doc corpus).
- Cross-session learning: the ledger is used to improve prompt/route.

## v1.0.0 — Stable

- Multi-PR orchestration (N parallel goals, TUI pane).
- Review-comment negotiation (auto-respond to PR review).
- Full cross-session memory + cost/quality dashboard.
- Maturity declared `stable` (external consumer / 4–15 packages per `AGENTS.md` §Maturity).

## Notes

- Every minor = batch milestone, not 1-feature-1-minor.
- Major needs RFC + migration guide + §27 dwell (see `AGENTS.md`).
- `CHANGES.md` is updated every release (Keep a Changelog + SemVer; historical archive at `docs/archive/EXPLAIN-CHANGES.md`).

## Cross-link

`ARCHITECTURE.md` §8 (v1 scope), `AGENTS.md` §Maturity, `design/*.md`, `testing.md`, `CHANGES.md`.

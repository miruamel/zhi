# 2026-08-29 — Build Multi-Critic Plant (mandate §4 Act, product pillar)

## Context

User interjection: "sambil dikerjakan projectnya jangan hanya ngurus audit doang" —
build the product, not just audit. Discover: `engine/critic/` had ONLY
`aggregate.ts` (weighted-Pareto aggregator). The **multi-critic plant — the
product's #1 differentiator (ARCHITECTURE.md §1) — had zero real critics**.
`cli.ts` returned a hardcoded `[{security, 0.9}]` (ponytail). `build/generate.ts`
was a 21-line `// TODO` stub. The loop was a smoke pipeline, not a working agent.

## Action (real build)

- `engine/critic/plant/sloc/critic.ts` — SLOC critic (mandate §6.3, hard ≤200).
- `engine/critic/plant/todo/critic.ts` — TODO/FIXME/XXX critic (dead-code guard).
- `engine/critic/plant/imports/critic.ts` — deep-relative import critic (§6.7/§6.11, >3 level).
- `engine/critic/plant/compose.ts` — `composeCritiques(files)` runs all 3 → Critique[].
- Tests: 4 critic test files + composer integration (12 new tests).
- `src/cli.ts` — `critique` now calls real `composeCritiques` on the generated artifact
  (was hardcoded 0.9). `plan`/`generate` remain deterministic stubs (no LLM; ponytail kept).

## Verify

- `bun test` → **71 pass / 0 fail** (was 59; +12 plant tests), 17 files.
- `bun src/cli.ts "add user validator module"` → real plant scores clean stub at 1.0.
- Self-audit: plant on `engine/build/generate.ts` flags 2 `// TODO` (todo score 0.80) —
  proves the plant catches the exact "project not built" gap.

## Architecture compliance

- Depth: engine/critic/plant/{sloc,todo,imports}/critic.ts = 5 levels (≥4). ✓
- plant/ = 2 direct files (compose.ts + compose.test.ts); each leaf = 2 files. ≤5. ✓
- All files <200 SLOC, atomic (one critic per file). ✓

## Next

- Real `generate` (write atomic files from plan) + real `plan` decomposition. Currently
  stubs; the critic plant is ready to gate real output when generation lands.

## Status

Resolved (plant built + wired). 71 tests green.

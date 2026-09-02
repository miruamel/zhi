# ADR-008: Promote Architecture Critic to Concrete

## Status

Accepted — 2026-08-30

## Context

`docs/design/critic.md` lists 12 critics. v1 ships concrete: Security, Perf, Testing, Style, Maintainability. The other 7 are stubs (`not-implemented`, return `abstain`). Roadmap v0.2.0 calls for gradual promotion of these stubs.

The **Architecture** check is special: its rule set is already enforced by `scripts/ci/architecture/check-circular.ts` (circular dep, deep-relative import, illegal layer edge engine→src / src→native / native→engine+src). The CI guard runs **only at push/PR**, not at the in-loop `CRITIQUE` state. That means a generated scaffold can pass CRITIQUE plant (4 critics), trigger `EVALUATE`, get a green gate, then CI catches the violation — wasted compute + late feedback.

We want CRITIQUE to catch architectural drift **before** EVALUATE, mirroring the CI guard at the in-process layer.

## Decision

1. Promote `engine/critic/plant/architecture/critic.ts` from stub to concrete, scanning `FileRecord[]`:
   - **Deep-relative import** (`../../../..` 4+ levels up) — same rule as `imports/critic.ts`, but here scoped as architectural (uses canonical layer-rooted reasoning; ≥4 up = violation).
   - **Illegal layer edge**: detect cross-layer imports via the path-prefix of the source (`engine/`, `src/`, `native/`) and the specifier target. Reuse the same allow-list as `check-circular.ts`:
     - `engine` may import `engine` only.
     - `src` may import `src`, `engine`.
     - `native` may import `native` only (TS wrapper files live under `engine/`, not `native/`; bridge is consumed via wrapper, not direct edge — this is consistent with §ADR-001).
   - **Score**: 1.0 if zero violations; penalty `0.25 * count` per deep-relative, `0.5 * count` per illegal layer edge (heavier, as it breaks the layering contract).
2. Wire into `composeCritiques()` — 5 critics total (sloc, todo, imports, maintainability, architecture). Re-rank aggregation by weight 1.5 (matches `imports/critic.ts` weight, signals higher blast radius).
3. Update `compose.test.ts`: assert 5 critics + name set + new finding categories.
4. Update `docs/design/critic.md` row 3 (Architecture) from `stub` → `concrete (deep-relative + illegal layer edge, mirrors CI guard)`.

## Alternatives

- **A. Reuse `check-circular.ts` directly** — would couple plant to a CI-only script that imports `fs` and walks the repo. Plant must work on in-memory `FileRecord[]`. Reject.
- **B. Add circular-dep detection** — out of scope for in-process critic (would need full graph walk on whole repo). CI guard already covers. Reject for v1; revisit if needed.
- **C. Lower penalty weight** — illegal layer edges are structural (silently propagate coupling). Keep heavier penalty.
- **D. Detect god-directory in critic** — already covered by SLOC critic + CI files-per-dir. Reject (overlap).

## Consequences

- **+** CRITIQUE stage now blocks architectural drift before EVALUATE; fewer CI-rejected PRs.
- **+** Architecture rule surfaces in `aggregate.ts` output (human-readable findings).
- **+** Mirrors CI guard — single mental model, two execution layers.
- **-** Plant now duplicates one rule with `imports/critic.ts` (deep-relative). Acceptable: imports critic penalizes weaker (0.25 per), architecture penalizes heavier (0.5 per illegal layer edge also) — different signal, different weight. Documented in design/critic.md.
- **-** In-process layer-edge check is best-effort (path-prefix only, not full graph). Circular-dep and full cross-graph layer validation remain CI guard's job.

## References

- `docs/adr/ADR-001-layer-convention.md`
- `docs/design/critic.md` row 3
- `scripts/ci/architecture/check-circular.ts`
- `engine/critic/plant/imports/critic.ts` (precedent)
- `engine/critic/plant/maintainability/critic.ts` (most-recent promotion, #16)

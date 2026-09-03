# standards/commit.md — Commit Rule

Zhi commit rules. Enforced via pre-commit hook + CI gate.

## 1. Conventional Commits

Format: `<type>: <description>` (English description, identifiers verbatim).

Types: `feat` | `fix` | `refactor` | `docs` | `test` | `perf` | `ci` | `chore`.

```
feat(loop): add CI_WATCH state + fail transition
fix(critic): correct Security floor weight to 0.5
docs(adr): ADR-002 critic Pareto
```

## 2. CHANGES.md required

Every PR that changes **behavior / API / architecture** MUST update `CHANGES.md` (top-first, under `## [Unreleased]`) before merge. Format: Keep a Changelog (sections Added/Changed/Fixed/Removed/Security). Docs-only PRs are exempt. Versions are bumped per SemVer on release (see §5).

Historical archive before the 2026-09-02 rename: `docs/archive/EXPLAIN-CHANGES.md`.

## 3. Doc-style gate

Every public symbol (export) must carry `@brief` (Doxygen Universal, see `AGENTS.Style.md`). Pre-commit rejects missing ones.

## 4. Atomic commit

One commit = one cohesive change. Don't mix refactor + feat. Files per commit still obey `AGENTS.md` (≤4/file, ≤200 SLOC).

## 5. Maturity & version

Root `package.json` declares `"maturity"`. Zhi starts `experimental` (`0.y.z`):

- breaking change = **minor** (not major).
- minor = batch per milestone, not 1-feature-1-minor.
- PATCH = zero behavior change.
- major needs RFC + migration guide (see `AGENTS.md` §Maturity).

## 6. Co-Authored-By

Default **without** the `Co-Authored-By` trailer (per ECC `includeCoAuthoredBy: false`). For Claude attribution, set `includeCoAuthoredBy: true` in settings or configure `attribution`.

## 7. Pre-commit checklist

- [ ] `tsc --noEmit` / typecheck passes
- [ ] `gate.ts` (eval) green: build ∧ test ∧ lint ∧ secret ∧ quality-gate
- [ ] `@brief` present on new public symbols
- [ ] `CHANGES.md` updated under `## [Unreleased]` (when behavior changes)
- [ ] Relevant cross-link docs updated

## References

- `AGENTS.md` §Doc standard, §Maturity
- `AGENTS.Style.md`
- `CHANGES.md` (historical: `docs/archive/EXPLAIN-CHANGES.md`)

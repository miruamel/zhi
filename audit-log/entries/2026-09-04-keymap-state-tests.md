# 2026-09-04 — keymap + state test coverage

## Summary

Added 2 test files covering 2 previously-untested pure modules in `src/tui/core/`:

| File | Tests | expect() |
|------|-------|----------|
| `src/tui/core/test/keymap.test.ts` | 9 | 18 |
| `src/tui/core/test/state.test.ts` | 9 | 18 |

**Total**: 18 tests, 36 expect() calls. Test count: 393 → 411 pass, 0 fail, 802 → 844 expect() across 74 → 76 files.

## What was tested

**`resolveKey`** (`src/tui/core/keymap.ts`): single-char key→action mapping (q/l/c/p/r/j/k/g/G/space/tab), help keys (h/?), escape→quit, enter→unknown, unknown→unknown, ctrl+c→abort, ctrl+c without ctrl→toggleCritics (map fallback), return type assertion.

**`emptyState`** (`src/tui/core/state.ts`): goal passthrough, tokensBudget passthrough, initial INTAKE state, empty arrays (steps/critics/log), eval stages all false, metrics zeros, prCi unknown, finished/aborted false, startedAt recent, tokensUsed 0.

## Why these files

The NO_TEST scan identified `src/tui/core/keymap.ts` and `src/tui/core/state.ts` as source files without co-located tests. Both are pure functions with no external dependencies (no `@testing-library/ink` needed), unlike `app.tsx`/`render.tsx` which are ink-rendered React components (YAGNI skip).

`resolveKey` is a pure key→action mapper — trivial to test, zero risk. `emptyState` is a factory returning a fully-initialised `AppState` — 9 assertions cover every field.

## Verification

- `bun test`: 411 pass, 0 fail, 844 expect() across 76 files.
- `bash .github/workflows/architecture-guard.sh .`: all checks passed.
- `npx prettier --check`: all files clean.
- README test count updated: 393 → 411 (2 references).
- CHANGES.md `## [Unreleased]` `### Added` section updated with test count delta.

## Files changed

| File | Change |
|------|--------|
| `src/tui/core/test/keymap.test.ts` | New (9 tests) |
| `src/tui/core/test/state.test.ts` | New (9 tests) |
| `README.md` | Test count 393 → 411 (2 refs) |
| `CHANGES.md` | Added test count delta to Unreleased section |

## Commit

`cb8b741` — `test: add keymap + state tests (18 tests, 36 expect calls); update README/CHANGES test counts (393→411)`
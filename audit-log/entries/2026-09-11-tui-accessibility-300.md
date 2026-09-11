# Audit: TUI accessibility layer + SettingsPane presentational fix (#299, #300)

**Date:** 2026-09-11
**PR:** #300
**Milestone:** TUI Phase 1 (accessibility layer)

## Summary

Added an accessibility layer for the Ink-based TUI (`src/tui/core/accessibility/`) and refactored `SettingsPane` to presentational to fix 3 pre-existing test failures caused by an Ink `useFocus()` import that crashed `react-test-renderer`.

## Changes

### New files

- `src/tui/core/accessibility/useFocusVisibility.ts` (45 SLOC) — exports `useFocusVisibility()` hook, `FocusSource` type (`'keyboard' | 'mouse' | 'none'`), and `FocusVisibilityResult` interface (`{ source, isKeyboard, markMouse, markKeyboard }`). Detects keyboard vs. mouse focus via Ink `useInput`: Tab/Return presses set `source` to `'keyboard'`, any other input resets to `'mouse'`. Exports `markKeyboard()` / `markMouse()` for manual control. No browser APIs.
- `src/tui/core/accessibility/index.ts` — barrel export.
- `src/tui/core/accessibility/useFocusVisibility.test.tsx` — 4 tests covering keyboard detection, mouse reset, manual marking, and initial state.

### Modified files

- `src/tui/panes/middle/settings/settings.tsx` — refactored to presentational. `isFocused` is now a prop (default `false`); removed the `useFocus()` import from `@ink-components/ink` that crashed `react-test-renderer` with `TypeError: null is not an object (evaluating 'dispatcher.useContext')`. Single consumer at `app-render-panes-metrics.tsx:115` renders without the prop — no behavior change.
- `src/tui/core/hooks/useNavigation.ts` — added `paneOrder` shrink clamping so the array never exceeds the available pane count.

## Verification

- Gate: 804 pass / 0 fail / 1590 expect() across 171 files
- Architecture guard: ≤150 SLOC/file, ≤4 files per directory
- Dependency-cruiser: clean
- Prettier + ESLint: clean

## Issues closed

- #299 (accessibility layer)

## Notes

- Scope decision: no generic `a11y-provider.tsx` with `aria-*` attributes. Ink has no DOM ARIA surface; the hook uses Ink-native `useInput` for focus visibility detection. WCAG AA wording limited to measurable checks; no full compliance claim without audit evidence.
- CI build caught unused `beforeEach`/`afterEach` imports in the test file. Gate's `--if-changed` fast-path skips typecheck on docs-only changes, so CI's full build step caught what local gate missed.
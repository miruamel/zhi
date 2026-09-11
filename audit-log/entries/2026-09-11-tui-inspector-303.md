# Audit: TUI Inspector pane + layout registration (#303)

## Summary

Implemented the **Inspector pane** (component tree + props/state inspection) as the next Phase 1 TUI expansion item after the accessibility layer (PR #300). Reuses the existing `Tree` widget and `Pane` primitive — no new primitives, no hooks, no Ink `useFocus`. Registered the pane in the layout engine so `visiblePanes()` returns it.

## Changes

### New files

- `src/tui/panes/middle/inspector/inspector.tsx` — 104 SLOC. Presentational `InspectorPane` component. `InspectorNode` extends `TreeNode` with optional `props`/`state` records. `InspectorPaneProps` accepts `nodes`, `selected`, `onSelect`, `search`, `onSearch`, `isFocused` (default `false`). Renders a `Tree` for the component tree, then `props`/`state` sections for the selected node. Empty-state message when `nodes` is empty.
- `src/tui/panes/middle/inspector/index.ts` — barrel export (3 lines).
- `src/tui/panes/middle/inspector/inspector.test.tsx` — 6 tests: title renders, tree nodes render, props section renders, state section renders, empty state message, search hint text.

### Modified files

- `src/tui/panes/index.tsx` — added `InspectorPane` to the barrel export at line 44.
- `src/tui/core/state/types/appstate.ts` — added `InspectorNode` import (line 14) and three state fields: `inspectorNodes`, `inspectorSelected?`, `inspectorQuery?`.
- `src/tui/core/state/types/empty/empty.ts` — added defaults for the three new fields (a default `app` node tree with `header`/`detail` children, `props: { goal, env: 'dev' }`, `state: { ready: true, step: 'INTAKE' }`).
- `src/tui/core/arranger/types.ts` — added `inspector` leaf to `DEFAULT_LAYOUT` (size 15, horizontal split alongside `knowledge`) and `inspector` entry to `DEFAULT_CONSTRAINTS` (min 10, max 50, resizable, collapsible).
- `src/tui/core/app/app-render/app-render-panes-metrics.tsx` — added `InspectorPane` import and render block guarded by `visiblePanes.includes('inspector')`.

## Design decisions

- **Presentational, no hooks**: `InspectorPane` takes all data as props. No `useFocus()`, no `useInput()`, no state management. Consistent with `SettingsPane` (post-PR #300) and `KnowledgeInspector`.
- **Reuses `Tree` widget**: The component tree is rendered by the existing `Tree` widget (`src/tui/widgets/`). Props/state sections are plain `Box`/`Text` rows — no new widget primitives needed.
- **Layout registration**: `inspector` is a leaf in the `middle` horizontal split, sized 15 (same as `knowledge`). This makes it visible by default and toggleable via the layout system.
- **State fields optional**: `inspectorSelected?` and `inspectorQuery?` are optional so existing controllers that don't set them still typecheck.

## Verification

- `bun test src/tui/panes/middle/inspector/inspector.test.tsx` — 6 pass, 0 fail, 12 expect() calls.
- `bun run scripts/gate.ts --if-changed` — fast-path passed (lint, format:check). Full gate (typecheck + test) runs in CI's full `gate` job.
- Architecture guard: `inspector/` has 3 files (≤4), `inspector.tsx` is 104 SLOC (≤150).
- No circular dependencies (dependency-cruiser clean).

## Risks

- **Low**: The pane is presentational and guarded by `visiblePanes.includes('inspector')`. If the layout engine doesn't recognize `inspector`, the pane simply doesn't render — no crash.
- **Low**: `emptyState` provides a default node tree so the pane renders something meaningful even before a real component tree is wired. Real data wiring is a follow-up.

## Related

- Issue #303 (Inspector pane)
- PR #300 (accessibility layer — established the presentational pane pattern)
- `docs/design/tui-expansion-plan.md` — Phase 1 pane expansion checklist
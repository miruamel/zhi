## Summary

Phase 1 of TUI architecture plan (#233): structural refactoring to enforce 150-SLOC guard across TUI source files.

## Changes

Split 5 oversized files into focused modules:

**src/tui/app.tsx** (383→54 SLOC): thin shell wiring controller/provider/render
- src/tui/core/app-controller.ts (121 SLOC): `useAppController` hook + `FocusNav`/`AppControllerResult` interfaces
- src/tui/core/app-commands.ts (79 SLOC): `buildCommands()` + `CommandDeps` interface
- src/tui/core/app-provider.tsx (113 SLOC): `AppProvider` with `useInput` handler + `CommandPalette`
- src/tui/core/app-render-top.tsx (52 SLOC): header + file tree/code viewer/metrics row
- src/tui/core/app-render.tsx (96 SLOC): remaining pane tree rows

**src/tui/panes/middle/agent/agent.tsx** (188→62 SLOC): thin orchestrator
- src/tui/panes/middle/agent/agent-types.ts (37 SLOC): `AgentDisplay`, `RuntimeLogEntry`, `AgentPaneProps`
- src/tui/panes/middle/agent/agent-utils.ts (37 SLOC): `LEVEL_COLOR`, `formatRelative`, `formatTokens`, `levelColor`
- src/tui/panes/middle/agent/agent-table.tsx (65 SLOC): `AgentTable` + selected detail card
- src/tui/panes/middle/agent/runtime-log-tab.tsx (32 SLOC): `RuntimeLogTab`
- src/tui/panes/middle/agent/dispatch-tab.tsx (40 SLOC): `DispatchTab`

**Deleted**: src/tui/core/app.tsx (194 SLOC) — dead code, zero consumers. `render.tsx` imports `ZhiApp` from root `app.tsx`, not `core/app.tsx`.

## Verification

- All files ≤150 SLOC (max: 121 in app-controller.ts)
- `bun run typecheck` — clean
- `bun test` — 537 pass, 0 fail, 1105 expect calls
- `bun run format:check` — clean

## Related

- Closes #234
- Ref: #233 (TUI architecture plan — 5 phases)

## refactor(tui): Phase 1 structural refactoring — split oversized files to ≤150 SLOC + architecture guard

### Problem

TUI codebase had 5 files exceeding the 150-SLOC architecture guard:

- `src/tui/app.tsx` — 383 SLOC
- `src/tui/panes/index.tsx` — 282 SLOC
- `src/tui/core/render.tsx` — 197 SLOC
- `src/tui/core/app.tsx` — 194 SLOC (dead code)
- `src/tui/panes/middle/agent/agent.tsx` — 188 SLOC

CI architecture-guard also found 2 directory violations:

- `src/tui/core/` — 12 files > 5
- `src/tui/panes/middle/agent/` — 7 files > 5

### Approach

Split each oversized file into focused modules, each ≤150 SLOC. Subdivided violating directories into subdirectories with barrel re-exports.

**`src/tui/app.tsx` (383 → 54 SLOC)** — thin shell wiring:

- `core/app/app-controller.ts` (121 SLOC) — `useAppController` hook, `FocusNav`, `AppControllerResult`
- `core/app/app-commands.ts` (79 SLOC) — `buildCommands()`, `CommandDeps`
- `core/app/app-provider.tsx` (113 SLOC) — `AppProvider`, key bindings, `CommandPalette`
- `core/app/app-render-top.tsx` (52 SLOC) — header, file tree, code viewer, metrics
- `core/app/app-render.tsx` (99 SLOC) — remaining JSX rows

**`src/tui/panes/middle/agent/agent.tsx` (188 → 62 SLOC)** — thin wrapper:

- `agent/agent-types.ts` (37 SLOC) — `AgentDisplay`, `RuntimeLogEntry`, `AgentPaneProps`
- `agent/agent-utils.ts` (37 SLOC) — `LEVEL_COLOR`, `formatRelative`, `formatTokens`, `levelColor`
- `agent/tabs/agent-table.tsx` (65 SLOC) — agent list + detail card
- `agent/tabs/runtime-log-tab.tsx` (32 SLOC) — runtime log rendering
- `agent/tabs/dispatch-tab.tsx` (40 SLOC) — dispatch input + target info

**Dead code deleted:**

- `core/app.tsx` (194 SLOC) — zero consumers across entire codebase
- `core/wrapper.tsx` (88 SLOC) — partial extraction from dead `core/app.tsx`, also zero consumers

**Directory subdivision:**

- `core/app/` — 5 files (app-controller, app-commands, app-provider, app-render-top, app-render)
- `core/render/` — 4 files (render.tsx, render-class, render-functions, render-types)
- `core/test/render/`, `core/test/state/`, `core/test/colors/`, `core/test/format/`, `core/test/icons/`, `core/test/handlers/` — each ≤2 files

### Alternatives Considered

- **Keep files as-is with exemptions**: Rejected — architecture guard exists for a reason, exemptions erode the standard
- **Larger subdirectories (≤10 files)**: Rejected — 5-file cap is the established rule, consistency matters

### Risks & Mitigations

- **Import path breakage**: Mitigated — all relative imports updated, `bun run typecheck` passes with 0 errors
- **Test breakage**: Mitigated — `bun test` passes 537/537, 0 failures
- **Format regression**: Mitigated — `bun run format:check` passes for all `src/` files
- **Dead code removal risk**: Mitigated — `core/app.tsx` and `wrapper.tsx` confirmed zero consumers via multiple grep searches before deletion

### Verification

- `bun run typecheck` — PASS (0 errors)
- `bun run format:check` — PASS (all `src/` files clean)
- `bun test` — PASS (537 pass, 0 fail, 1105 expect calls, 120 files)
- Architecture guard — PASS (zero directories >5 files, zero files >150 SLOC)
- `bun build` — FAIL (pre-existing `react-devtools-core` resolution error in `ink/build/devtools.js`, unrelated to refactoring)

### Related Issues

- Closes #234
- Refs #233 (TUI architecture plan — Phase 1)

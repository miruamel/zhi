# TUI Expansion Plan — v0.1.13 milestone

## Target

50k-120k SLOC across `src/tui/` by end of v0.1.x series. Current: 17,379 code lines (cloc, 383 files).

## Phase 1: v0.1.13 — Foundation (target: ~25k SLOC)

### Widget expansion

- [x] Chart library (line, bar, area, pie, radar) — 3k SLOC
- [x] Data table with sorting, filtering, pagination — 4k SLOC
- [ ] Rich text editor widget (markdown preview, syntax highlighting) — 3k SLOC
- [x] Code viewer with file tree + syntax highlighting — 3k SLOC
- [x] Diff viewer (unified, side-by-side, inline) — 2k SLOC
- [x] Log viewer with filtering, search, tail-follow — 2k SLOC
- [x] Form widgets (input, textarea, select, checkbox, radio, slider) — 2k SLOC

### Pane expansion

- [x] Settings pane (keybindings, themes, preferences) — 2k SLOC
- [x] Help pane (command reference, keybindings cheat sheet) — 1k SLOC
- [x] Inspector pane (component tree, props, state inspection) — 2k SLOC — presentational `InspectorPane` wrapping `Tree` widget, `InspectorNode` extends `TreeNode` with optional `props`/`state`. Layout-registered in `arranger/types.ts`. PR #303.
- [x] Debug pane (breakpoints, variables, call stack) — 2k SLOC — presentational `DebugPane` with three sections (breakpoints Tree, call stack Tree, variable rows), `DebugBreakpoint`/`DebugFrame` extend `TreeNode`, `DebugVariable` flat record. Layout-registered in `arranger/types.ts`. PR #304.

### Infrastructure

- [x] Theme system (light, dark, high contrast, custom) — 1k SLOC
- [x] Icon system (SF Symbols / Iconify integration) — 1k SLOC
- [x] Accessibility layer (WCAG 2.2 AA audit) — 1k SLOC — `useFocusVisibility()` hook, `SettingsPane` presentational fix, `useNavigation` paneOrder clamp. PR #300.

## Phase 2: v0.1.14 — Integration (target: ~50k SLOC)

- [ ] Plugin system (third-party widget registration) — 5k SLOC
- [ ] State persistence (localStorage, file-based) — 3k SLOC
- [ ] Remote data sources (HTTP, WebSocket, SSE) — 4k SLOC
- [ ] Animation system (spring, timing, stagger, layout animations) — 5k SLOC
- [ ] Accessibility audit + fixes — 2k SLOC
- [ ] Performance profiling widgets — 3k SLOC

## Phase 3: v0.1.15 — Polish (target: ~75k SLOC)

- [ ] Custom terminal emulator (scrollback, search, hyperlinks) — 10k SLOC
- [ ] IDE-style editor (multi-cursor, autocomplete, lint integration) — 10k SLOC
- [ ] Git integration (diff, blame, stash, branch management) — 8k SLOC
- [ ] Debugging integration (DAP client, breakpoints, variables) — 8k SLOC

## Phase 4: v0.2.0 — Maturity (target: ~120k SLOC)

- [ ] Full IDE surface (file explorer, terminal, editor, debug, git) — 30k SLOC
- [ ] Plugin marketplace + distribution — 5k SLOC
- [ ] Collaboration (shared sessions, comments, presence) — 10k SLOC
- [ ] AI assistant integration (inline suggestions, chat, code generation) — 15k SLOC

## Constraints

- ≤150 SLOC per file (mandate §6.2)
- ≤4 files per directory (mandate §6.10)
- No circular dependencies (dependency-cruiser)
- 80%+ test coverage
- All PRs must reference an issue
- One PR at a time, auto-merge

# TUI Expansion Plan — v0.1.13 milestone

## Target

50k-120k SLOC across `src/tui/` by end of v0.1.x series. Current: 17,379 code lines (cloc, 383 files).

## Phase 1: v0.1.13 — Foundation (target: ~25k SLOC)

### Widget expansion

- [x] Log viewer with filtering, search, tail-follow — 2k SLOC
- [x] Form widgets (input, textarea, select, checkbox, radio, slider) — 2k SLOC
- [ ] Chart library (line, bar, area, pie, radar) — 3k SLOC
- [ ] Data table with sorting, filtering, pagination — 4k SLOC
- [ ] Rich text editor widget (markdown preview, syntax highlighting) — 3k SLOC
- [ ] Code viewer with file tree + syntax highlighting — 3k SLOC
- [ ] Diff viewer (unified, side-by-side, inline) — 2k SLOC

### Pane expansion

- [ ] Settings pane (keybindings, themes, preferences) — 2k SLOC
- [ ] Help pane (command reference, keybindings cheat sheet) — 1k SLOC
- [ ] Inspector pane (component tree, props, state inspection) — 2k SLOC
- [ ] Debug pane (breakpoints, variables, call stack) — 2k SLOC

### Infrastructure

- [x] Theme system (light, dark, high contrast, custom) — 1k SLOC
- [ ] Icon system (SF Symbols / Iconify integration) — 1k SLOC
- [ ] Accessibility layer (WCAG 2.2 AA audit) — 1k SLOC

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

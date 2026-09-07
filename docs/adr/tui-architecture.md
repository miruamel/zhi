# ADR-001: TUI Architecture for Zhi Autonomous Agent

## Status

Proposed

## Context

Zhi需要一个企业级TUI，参考Claude Code、OMP(ECC)、Hermes、OpenCode的功能特性。当前TUI仅~2.3k SLOC，需要扩展到50k-120k SLOC以支持丰富的功能。

## Decision

### Core Principles

1. **Layer-first architecture** - 遵循AGENTS.md的≤4 files/folder规则
2. **Reactive state management** - 使用Zustand-like store管理状态
3. **Component-based panes** - 每个pane独立、可复用
4. **Theme system** - 支持多主题切换
5. **Accessibility first** - 支持键盘导航、屏幕阅读器

### Reference Feature Matrix

| Feature           | Claude Code | OMP/ECC | Hermes | OpenCode | Zhi TUI |
| ----------------- | ----------- | ------- | ------ | -------- | ------- |
| Streaming output  | ✓           | -       | ✓      | -        | ✓       |
| File tree         | ✓           | -       | -      | ✓        | ✓       |
| Diff viewer       | ✓           | -       | -      | ✓        | ✓       |
| Command palette   | ✓           | -       | -      | -        | ✓       |
| Agent memory      | -           | ✓       | -      | -        | ✓       |
| Session history   | -           | ✓       | -      | -        | ✓       |
| Multi-agent view  | -           | -       | ✓      | -        | ✓       |
| Notifications     | -           | -       | ✓      | -        | ✓       |
| Terminal emulator | -           | -       | -      | ✓        | ✓       |
| Git integration   | -           | -       | -      | ✓        | ✓       |
| Status bar        | ✓           | -       | -      | ✓        | ✓       |
| Metrics dashboard | -           | ✓       | -      | -        | ✓       |
| Search/fuzzy find | ✓           | -       | -      | -        | ✓       |

### Folder Structure

```
src/tui/
  # Entry points
  app.tsx                 # Root component
  render.tsx              # Render entry

  # Core (max 4 files each)
  core/
    state.ts             # State shapes & types
    colors.ts            # Color tokens
    format.ts            # Formatters
    icons.ts             # Glyphs/icons
    store/               # State management (4 files)
      index.ts           # Store exports
      types.ts           # Store types
      actions.ts         # Actions
      selectors.ts       # Selectors
    hooks/               # Custom hooks (4 files)
      index.ts
      useStore.ts
      useKeyboard.ts
      useTheme.ts
    themes/              # Theme system (4 files)
      index.ts
      dark.ts
      light.ts
      types.ts
    handlers/            # Key handling (existing, 2 files)
      keymap.ts
      keyhandler.ts
    transport/           # Data transport (4 files)
      index.ts
      ws-client.ts
      types.ts
      stream.ts

  # Panes - Top Row
  panes/
    top/
      header/            # ASCII banner + status
        header.tsx
        header.test.ts
      dag/               # DAG step list
        dag.tsx
        dag.test.ts
      detail/            # Step detail
        detail.tsx
        detail.test.ts
      file-tree/         # NEW: File explorer
        file-tree.tsx
        file-tree.test.ts
      code-viewer/       # NEW: Code display
        code-viewer.tsx
        code-viewer.test.ts
      metrics/           # NEW: Metrics dashboard
        metrics.tsx
        metrics.test.ts

    # Panes - Middle Row
    middle/
      critics/           # 15-critic Pareto
        critics.tsx
        critics.test.ts
      eval/              # Eval stages
        eval.tsx
        eval.test.ts
      diff/              # NEW: Diff viewer
        diff.tsx
        diff.test.ts
      terminal/          # NEW: Terminal output
        terminal.tsx
        terminal.test.ts
      agents/            # NEW: Multi-agent view
        agents.tsx
        agents.test.ts
      network/           # NEW: Network monitor
        network.tsx
        network.test.ts

    # Panes - Bottom Row
    bottom/
      log/               # Log stream
        log.tsx
        log.test.ts
      help/              # Keybindings help
        help.tsx
        help.test.ts
      command-palette/   # NEW: Command palette
        command-palette.tsx
        command-palette.test.ts
      notifications/     # NEW: Notification center
        notifications.tsx
        notifications.test.ts
      status-bar/       # NEW: Status bar
        status-bar.tsx
        status-bar.test.ts
      config/            # NEW: Config panel
        config.tsx
        config.test.ts

  # Reusable widgets
  widgets/
    chart/              # Charts & graphs (3 files)
      bar.tsx
      sparkline.tsx
      gauge.tsx
    table/              # Data tables (3 files)
      table.tsx
      sortable.tsx
      types.ts
    code/               # Code display (3 files)
      syntax.ts
      highlight.ts
      types.ts
    diff/               # Diff rendering (3 files)
      unified.ts
      side-by-side.ts
      types.ts
    tree/               # Tree component (3 files)
      tree.tsx
      node.tsx
      types.ts
    progress/           # Progress indicators (2 files)
      bar.tsx
      spinner.tsx
    badge/              # Status badges (2 files)
      badge.tsx
      status.tsx
    modal/              # Modal dialogs (2 files)
      modal.tsx
      confirm.tsx
    tabs/               # Tab management (2 files)
      tabs.tsx
      panel.tsx
    tooltip/             # Tooltips (2 files)
      tooltip.tsx
      types.ts
    notification/        # Toast notifications (2 files)
      toast.tsx
      types.ts

  # Services
  services/
    memory/             # Agent memory (3 files)
      index.ts
      memory-store.ts
      types.ts
    knowledge/          # Knowledge graph (3 files)
      index.ts
      graph.ts
      types.ts
    session/            # Session management (3 files)
      index.ts
      session-store.ts
      types.ts
    git/                # Git integration (3 files)
      index.ts
      git-service.ts
      types.ts

  # Types
  types/
    pane.ts             # Pane types
    stream.ts           # Stream types
    agent.ts            # Agent types

### SLOC Estimation

| Category | Est. Files | Est. SLOC |
|----------|-----------|-----------|
| Core infrastructure | 20 | 4,000 |
| Panes (expanded) | 35 | 15,000 |
| Widgets | 20 | 8,000 |
| Services | 12 | 5,000 |
| Tests | 40 | 8,000 |
| **Total** | ~127 | ~40,000+ |

## Consequences

### Positive
- Comprehensive feature set matching enterprise TUI standards
- Modular, maintainable architecture
- Extensible widget system
- Strong typing throughout

### Negative
- Large codebase requires discipline
- Need to manage complexity carefully

## Implementation Phases

1. **Phase 1: Foundation** (5k SLOC)
   - State management store
   - Theme system
   - Custom hooks
   - Transport layer

2. **Phase 2: Core Panes** (10k SLOC)
   - File tree
   - Code viewer
   - Diff viewer
   - Terminal

3. **Phase 3: Agent Features** (10k SLOC)
   - Agent memory
   - Knowledge graph
   - Session history
   - Multi-agent view

4. **Phase 4: Polish** (10k SLOC)
   - Command palette
   - Notifications
   - Search
   - Accessibility

## Date: 2026-09-06
## Author: Zhi (autonomous agent)
```

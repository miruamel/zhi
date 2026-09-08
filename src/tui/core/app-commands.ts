/**
 * @fileoverview App commands registry — all keyboard shortcuts and command palette entries.
 * @since 0.1.2
 * @updated 0.2.6 — extracted from app.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import type { CommandItem } from '../widgets/command-palette';
import type { FocusNav } from './app-controller';

export interface CommandDeps {
  exit: () => void;
  setPaused: (v: boolean | ((p: boolean) => boolean)) => void;
  setDetailExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setLogExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setCriticsExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setPrExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setRedrawKey: (v: number | ((p: number) => number)) => void;
  onAbort?: () => void;
  nav: FocusNav;
  arranger: { reset: () => void };
}

/**
 * @brief Build the full command palette list from dependencies.
 * @param deps command dependencies (setters, callbacks, nav, arranger)
 * @returns array of CommandItem
 * @since 0.1.2
 */
export function buildCommands(deps: CommandDeps): CommandItem[] {
  const {
    exit,
    setPaused,
    setDetailExpanded,
    setLogExpanded,
    setCriticsExpanded,
    setPrExpanded,
    setRedrawKey,
    onAbort,
    nav,
    arranger,
  } = deps;

  return [
    { id: 'quit', label: 'Quit', description: 'Exit the TUI', shortcut: 'q', action: () => exit() },
    {
      id: 'pause',
      label: 'Pause / Resume',
      description: 'Toggle stream pause',
      shortcut: 'Space',
      action: () => setPaused((p) => !p),
    },
    {
      id: 'abort',
      label: 'Abort',
      description: 'Stop the current run',
      shortcut: 'Ctrl+C',
      action: () => onAbort?.(),
    },
    {
      id: 'log',
      label: 'Toggle Log',
      description: 'Show/hide log pane',
      shortcut: 'l',
      action: () => setLogExpanded((e) => !e),
    },
    {
      id: 'critics',
      label: 'Toggle Critics',
      description: 'Show/hide critics pane',
      shortcut: 'c',
      action: () => setCriticsExpanded((e) => !e),
    },
    {
      id: 'pr',
      label: 'Toggle PR',
      description: 'Show/hide PR pane',
      shortcut: 'p',
      action: () => setPrExpanded((e) => !e),
    },
    {
      id: 'detail',
      label: 'Toggle Detail',
      description: 'Show/hide detail pane',
      shortcut: 'd',
      action: () => setDetailExpanded((e) => !e),
    },
    {
      id: 'redraw',
      label: 'Redraw',
      description: 'Force re-render',
      shortcut: 'r',
      action: () => setRedrawKey((k) => k + 1),
    },
    {
      id: 'reset',
      label: 'Reset Layout',
      description: 'Restore default pane layout',
      action: () => arranger.reset(),
    },
    {
      id: 'next',
      label: 'Next Pane',
      description: 'Move focus to next pane',
      shortcut: 'Tab',
      action: () => nav.move(1),
    },
    {
      id: 'prev',
      label: 'Previous Pane',
      description: 'Move focus to previous pane',
      shortcut: 'Shift+Tab',
      action: () => nav.move(-1),
    },
  ];
}

/**
 * @fileoverview App controller hook — state management, focus, and pane orchestration for ZhiApp.
 * @since 0.1.2
 * @updated 0.1.11 — extracted from app.tsx to enforce 150-SLOC guard
 * @updated 0.1.12 — M4c: conflict resolver wiring
 * @package zhi
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from 'ink';
import { Arranger } from '../arranger';
import { useFocus } from '../hooks';
import { AppState } from '../state';

export interface FocusNav {
  current: string;
  move: (delta: number) => void;
  jump: (index: number) => void;
  goBack: () => void;
}

export interface AppControllerResult {
  state: AppState;
  pushState: (patch: Partial<AppState>) => void;
  nav: FocusNav;
  arranger: Arranger;
  detailExpanded: boolean;
  logExpanded: boolean;
  criticsExpanded: boolean;
  criticsFilter: string;
  showFixedCritics: boolean;
  prExpanded: boolean;
  logOffset: number;
  redrawKey: number;
  layoutVersion: number;
  paletteOpen: boolean;
  mode: 'normal' | 'command' | 'search';
  setPaletteOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  setMode: (v: 'normal' | 'command' | 'search') => void;
  setConflictResolverOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  resolveConflict: (id: string) => void;
  selectedConflictId?: string;
  setShowHelp: (v: boolean | ((p: boolean) => boolean)) => void;
  setDetailExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setLogExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setCriticsExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setCriticsFilter: (v: string | ((p: string) => string)) => void;
  setShowFixedCritics: (v: boolean | ((p: boolean) => boolean)) => void;
  setPrExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  setLogOffset: (v: number | ((p: number) => number)) => void;
  setFocusIdx: (v: number | ((p: number) => number)) => void;
  setRedrawKey: (v: number | ((p: number) => number)) => void;
  setPaused: (v: boolean | ((p: boolean) => boolean)) => void;
  onQuit?: () => void;
  onAbort?: () => void;
  exit: () => void;
}

/**
 * @brief Aggregate all app-level state and handlers into one hook call.
 * @param initialState initial AppState
 * @param onAbort abort callback
 * @param onQuit quit callback
 * @param onRegister register a pushState callback
 * @return controller result consumed by ZhiApp render
 * @since 0.1.2
 */
export function useAppController(
  initialState: AppState,
  onAbort?: () => void,
  onQuit?: () => void,
  onRegister?: (cb: (patch: Partial<AppState>) => void) => void,
): AppControllerResult {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>(initialState);
  const [, setPaused] = useState(false);
  const [, setShowHelp] = useState(false);
  const [, setFocusIdx] = useState(0);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false);
  const [criticsExpanded, setCriticsExpanded] = useState(false);
  const [criticsFilter, setCriticsFilter] = useState('');
  const [showFixedCritics, setShowFixedCritics] = useState(false);
  const [prExpanded, setPrExpanded] = useState(false);
  const [logOffset, setLogOffset] = useState(0);
  const [redrawKey, setRedrawKey] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mode, setMode] = useState<'normal' | 'command' | 'search'>('normal');
  const [, setConflictResolverOpen] = useState(false);
  const [selectedConflictId, setSelectedConflictId] = useState<string | undefined>(undefined);
  const arranger = useState(() => new Arranger())[0];
  const [layoutVersion, setLayoutVersion] = useState(0);
  const registered = useRef(false);

  const pushState = useCallback(
    (patch: Partial<AppState>) => setState((s: AppState) => ({ ...s, ...patch })),
    [],
  );

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;
    onRegister?.(pushState);
  }, [onRegister, pushState]);

  useEffect(() => arranger.subscribe(() => setLayoutVersion((v) => v + 1)), [arranger]);
  const paneOrder = arranger.visiblePanes();
  const focusHook = useFocus(paneOrder, 0);
  const nav: FocusNav = {
    current: focusHook.current,
    move: focusHook.move,
    jump: focusHook.jump,
    goBack: focusHook.goBack,
  };

  const resolveConflict = useCallback((id: string) => {
    setState((s: AppState) => ({
      ...s,
      conflicts: s.conflicts.map((c) =>
        c.id === id ? { ...c, resolved: true, reason: 'resolved by user' } : c,
      ),
      selectedConflictId: undefined,
    }));
    setSelectedConflictId(undefined);
  }, []);

  return {
    state,
    pushState,
    nav,
    arranger,
    detailExpanded,
    logExpanded,
    criticsExpanded,
    criticsFilter,
    showFixedCritics,
    prExpanded,
    logOffset,
    redrawKey,
    layoutVersion,
    paletteOpen,
    setPaletteOpen,
    mode,
    setMode,
    setConflictResolverOpen,
    resolveConflict,
    selectedConflictId,
    setPaused,
    setShowHelp,
    setDetailExpanded,
    setLogExpanded,
    setCriticsExpanded,
    setCriticsFilter,
    setShowFixedCritics,
    setPrExpanded,
    setLogOffset,
    setFocusIdx,
    setRedrawKey,
    onQuit,
    onAbort,
    exit,
  };
}

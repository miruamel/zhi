/** @brief App root — the main ink <App> for Zhi TUI. @since 0.1.0 */
import { Box, Text, useApp, useInput } from 'ink';
import { useState, useEffect, useRef } from 'react';
import { colors } from './core/style/colors';
import { resolveKey } from './core/keymap';
import { createFocusManager, createPerfTracker } from './engine';
import { createBridge } from './integration/state-bridge';
import { renderPane } from './integration/pane-renderer';
import { PaneErrorBoundary } from './integration/error-boundary';
import {
  Header,
  Dag,
  Detail,
  Metrics,
  Terminal,
  Agents,
  Network,
  Resources,
  Critics,
  Timeline,
  Stages,
  Eval,
  Files,
  Diff,
  Secrets,
  Gate,
  Audit,
  Queue,
  Knowledge,
  Pr as PrPane,
  Log,
  CodeViewer,
  Config,
  Help,
  Notifications,
  Profile,
} from './panes';
import type { AppState } from './core/state';
import type { PaneId } from './engine/focus/index.ts';

export interface AppProps {
  initialState: AppState;
  threshold: number;
  onAbort?: () => void;
  onQuit?: () => void;
  /** @brief Dipanggil sekali setelah mount: beri tahu loop ts push patch ke setState. */
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
}

/** @brief Root ink component. @since 0.1.0 */
export function ZhiApp({ initialState, threshold, onAbort, onQuit, onRegister }: AppProps) {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>(initialState);
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedCritics, setExpandedCritics] = useState(false);
  const [expandedPr, setExpandedPr] = useState(false);
  const [logScroll, setLogScroll] = useState(0);
  const [focusedPane, setFocusedPane] = useState<PaneId>('dag');
  const fmRef = useRef(createFocusManager('dag'));
  const fm = fmRef.current;
  const perfRef = useRef(createPerfTracker());
  const bridgeRef = useRef(createBridge(setState, perfRef.current));

  useEffect(() => {
    onRegister?.(bridgeRef.current.push.bind(bridgeRef.current));
  }, [onRegister]);
  useInput((input: string, key: { [k: string]: boolean }) => {
    const action = resolveKey(input, key);
    switch (action) {
      case 'quit':
        onQuit?.();
        exit();
        break;
      case 'abort':
        setState((s: AppState) => ({ ...s, aborted: true, finished: true }));
        onAbort?.();
        exit();
        break;
      case 'pauseResume':
        setPaused((p: boolean) => !p);
        break;
      case 'toggleCritics':
        setExpandedCritics((e: boolean) => !e);
        break;
      case 'togglePr':
        setExpandedPr((e: boolean) => !e);
        break;
      case 'toggleHelp':
        setShowHelp((h: boolean) => !h);
        break;
      case 'cycle':
        fm.focusNext();
        setFocusedPane(fm.focused);
        break;
      case 'nextLog':
        setLogScroll((s: number) => s + 1);
        break;
      case 'prevLog':
        setLogScroll((s: number) => Math.max(0, s - 1));
        break;
      case 'logTop':
        setLogScroll(0);
        break;
      case 'logBottom':
        setLogScroll(9999);
        break;
      default:
        break;
    }
  });

  const currentStep = state.steps.find((s) => s.id === state.currentStepId);
  const isFocused = (id: PaneId) => focusedPane === id;
  const ui = { paused, showHelp, expandedCritics, expandedPr, logScroll };

  /** @brief Wrap a pane in PaneErrorBoundary + focus border, render via shared renderPane. */
  const frame = (id: PaneId) => {
    const element = renderPane(id, state, threshold, currentStep, {
      ...ui,
      focused: isFocused(id),
    });
    if (!element) return null;
    const borderColor = isFocused(id) ? colors.accent : colors.fgDim;
    return (
      <PaneErrorBoundary key={id} paneName={id}>
        <Box borderStyle="single" borderColor={borderColor} flexDirection="column">
          {element}
        </Box>
      </PaneErrorBoundary>
    );
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      {frame('header')}
      <Box marginTop={1} gap={1}>
        {frame('dag')}
        {frame('detail')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('metrics')}
        {frame('agents')}
        {frame('network')}
        {frame('resources')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('files')}
        {frame('diff')}
        {frame('secrets')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('gate')}
        {frame('audit')}
        {frame('queue')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('stages')}
        {frame('timeline')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('critics')}
        {frame('pr')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('knowledge')}
        {frame('code')}
        {frame('config')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('eval')}
      </Box>
      <Box marginTop={1}>
        {frame('log')}
      </Box>
      <Box marginTop={1} gap={1}>
        {frame('notifications')}
        {frame('profile')}
      </Box>
      <Box marginTop={1}>
        {frame('help')}
      </Box>
      <Box marginTop={1}>
        <Text color={colors.fgDim}>Zhi (志) v0.1.1 · MIT · {paused ? 'PAUSED' : 'RUNNING'} · Tab: focus</Text>
        {state.finished && (
          <Text color={state.aborted ? colors.warn : colors.done} bold>
            {' '}
            {state.aborted ? '⚠ DONE (partial)' : '✓ DONE'}
            {' — '}
            {state.tokensUsed} tokens used
            {state.prCi.prUrl ? ` · ${state.prCi.prUrl}` : ''}
          </Text>
        )}
      </Box>
    </Box>
  );
}
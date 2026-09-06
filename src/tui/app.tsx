/**
 * @fileoverview App root — the main ink <App> for Zhi TUI. @since 0.1.2
 * @updated 0.2.0 — integrated Arranger, StatusBar, CommandPalette, useFocus
 */
import { Box, useApp, useInput } from 'ink';
import { useState } from 'react';
import { resolveKey } from './core/handlers/keymap';
import { applyKeyAction } from './core/handlers/keyhandler';
import { Arranger } from './core/arranger';
import { StatusBar } from './widgets/status-bar';
import { CommandPalette, type CommandItem } from './widgets/command-palette';
import { useFocus } from './core/hooks';
import {
  CodeViewer,
  FileTree,
  MetricsPane,
  DiffViewer,
  TerminalPane,
  NetworkPane,
  AgentsPane,
  HelpPane,
  Header,
  Dag,
  Detail,
  Critics,
  Eval,
  Pr as PrPane,
  Log,
  SessionsPane,
  MemoryPane,
  SettingsPane,
} from './panes';
import type { AppState } from './core/state';

export interface AppProps {
  initialState: AppState;
  threshold: number;
  onAbort?: () => void;
  onQuit?: () => void;
  /** @brief Dipanggil sekali setelah mount: beri tahu loop ts push patch ke setState. */
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
}
/** @brief Root ink component. @since 0.1.2 */
export function ZhiApp({ initialState, threshold, onAbort, onQuit, onRegister }: AppProps) {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>(initialState);
  const [, setPaused] = useState(false);
  const [, setShowHelp] = useState(false);
  const [, setFocusIdx] = useState(0);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false);
  const [criticsExpanded, setCriticsExpanded] = useState(false);
  const [prExpanded, setPrExpanded] = useState(false);
  const [logOffset, setLogOffset] = useState(0);
  const [redrawKey, setRedrawKey] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mode, setMode] = useState<'normal' | 'command' | 'search'>('normal');

  const arranger = useState(() => new Arranger())[0];
  const paneOrder = arranger.visiblePanes();
  const nav = useFocus(paneOrder, 0);

  // Register setState push callback for external loop integration
  onRegister?.((p: Partial<AppState>) => setState((s: AppState) => ({ ...s, ...p })));

  const pushState = (patch: Partial<AppState>) => setState((s: AppState) => ({ ...s, ...patch }));

  const commands: CommandItem[] = [
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

  useInput(
    (
      input: string,
      key: { ctrl?: boolean; meta?: boolean; shift?: boolean; return?: boolean; escape?: boolean },
    ) => {
      if (paletteOpen) return;
      const action = resolveKey(input, key);
      switch (action) {
        case 'quit':
          onQuit?.();
          exit();
          break;
        case 'openPalette':
          setPaletteOpen(true);
          setMode('command');
          break;
        case 'closePalette':
          setPaletteOpen(false);
          setMode('normal');
          break;
        case 'pauseResume':
          setPaused((p) => !p);
          break;
        case 'abort':
          onAbort?.();
          break;
        case 'nextPane':
          nav.move(1);
          break;
        case 'prevPane':
          nav.move(-1);
          break;
        case 'searchMode':
          setMode('search');
          break;
        case 'jumpMode':
          setMode('command');
          break;
        default:
          applyKeyAction(action, {
            setState: pushState,
            setPaused,
            setShowHelp,
            setDetailExpanded,
            setLogExpanded,
            setCriticsExpanded,
            setPrExpanded,
            setLogOffset,
            setFocusIdx,
            setRedrawKey,
            onAbort,
            onQuit,
            exit,
            log: state.log,
          });
      }
    },
  );

  const currentStep = state.steps.find((s) => s.id === state.currentStepId);
  const hints = ['Ctrl+K palette', 'Tab cycle', 'q quit', 'Space pause', 'h help'];

  return (
    <Box key={redrawKey} flexDirection="column" paddingX={1}>
      <Header
        loop={state.loop}
        goal={state.goal}
        startedAt={state.startedAt}
        finished={state.finished}
        aborted={state.aborted}
        partial={state.partial}
        prUrl={state.prUrl}
        tokensUsed={state.tokensUsed}
        tokensBudget={state.tokensBudget}
      />
      <Box marginTop={1} gap={1}>
        <FileTree files={state.files} selected={state.selectedFile} />
        <CodeViewer
          path={state.selectedFile}
          content={state.fileContent}
          language={state.fileLanguage}
        />
        <MetricsPane
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          elapsedMs={Date.now() - state.startedAt}
          stepsCompleted={state.steps.filter((s) => s.status === 'done').length}
          stepsTotal={state.steps.length}
          successRate={state.eval?.gatePass ? 1 : 0}
          sparkline={state.tokenSparkline}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <Dag steps={state.steps} currentStepId={state.currentStepId} currentLoop={state.loop} />
        <Detail
          step={currentStep ?? undefined}
          loop={state.loop}
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          recoverAttempts={state.metrics.recoverAttempts}
          expanded={detailExpanded}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <Critics
          critics={state.critics}
          weightedAvg={state.eval.weightedAvg}
          threshold={threshold}
          expanded={criticsExpanded}
        />
        <Eval evalReport={state.eval} />
        <DiffViewer diff={state.diff} />
        <PrPane prCi={state.prCi} expanded={prExpanded} />
      </Box>
      <Box marginTop={1} gap={1}>
        <TerminalPane lines={state.terminalLines} />
        <NetworkPane requests={state.networkRequests} online={state.networkOnline} />
        <AgentsPane agents={state.agents} />
      </Box>
      <Box marginTop={1}>
        <Log log={state.log} expanded={logExpanded} offset={logOffset} maxLines={40} />
      </Box>
      <Box marginTop={1} gap={1}>
        <SessionsPane sessions={state.sessions} activeId={state.activeSessionId} />
        <MemoryPane facts={state.memoryFacts} />
        <SettingsPane entries={state.configEntries} />
      </Box>
      <Box marginTop={1}>
        <HelpPane />
      </Box>
      <StatusBar
        tokensUsed={state.tokensUsed}
        tokensBudget={state.tokensBudget}
        elapsedMs={Date.now() - state.startedAt}
        step={currentStep?.kind}
        stepCount={state.steps.filter((s) => s.status === 'done').length}
        stepTotal={state.steps.length}
        gitBranch={state.git?.branch}
        gitAhead={state.git?.ahead}
        gitBehind={state.git?.behind}
        focusLabel={nav.current}
        mode={mode}
        hints={hints}
      />
      <CommandPalette
        open={paletteOpen}
        commands={commands}
        onClose={() => {
          setPaletteOpen(false);
          setMode('normal');
        }}
        onExecute={(cmd) => cmd.action()}
      />
    </Box>
  );
}

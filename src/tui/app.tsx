/** @brief App root — the main ink <App> for Zhi TUI. @since 0.1.0 */
import { Box, Text, useApp, useInput } from 'ink';
import { useState, useEffect } from 'react';
import { colors } from './core/style/colors';
import { resolveKey } from './core/keymap';
import { Header, Dag, Detail, Critics, Timeline, Eval, Pr as PrPane, Log, Help } from './panes';
import type { AppState } from './core/state';

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

  useEffect(() => {
    onRegister?.((p: Partial<AppState>) => setState((s: AppState) => ({ ...s, ...p })));
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
        setExpandedCritics(false);
        setExpandedPr(false);
        setLogScroll(0);
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
  return (
    <Box flexDirection="column" paddingX={1}>
      <Header
        loop={state.loop}
        goal={state.goal}
        startedAt={state.startedAt}
        finished={state.finished}
        aborted={state.aborted}
      />
      <Box marginTop={1} gap={1}>
        <Dag steps={state.steps} currentStepId={state.currentStepId} currentLoop={state.loop} />
        <Detail
          step={currentStep}
          loop={state.loop}
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          recoverAttempts={state.metrics.recoverAttempts}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <Timeline entries={state.timeline} />
      </Box>
      <Box marginTop={1} gap={1}>
        <Critics
          critics={state.critics}
          weightedAvg={state.eval.weightedAvg}
          threshold={threshold}
          expanded={expandedCritics}
        />
        <PrPane prCi={state.prCi} expanded={expandedPr} />
      </Box>
      <Box marginTop={1} gap={1}>
        <Eval evalReport={state.eval} />
      </Box>
      <Box marginTop={1}>
        <Log log={state.log} maxLines={40} scroll={logScroll} />
      </Box>
      <Box marginTop={1}>
        <Help paused={paused} showHelp={showHelp} />
      </Box>
      <Box marginTop={1}>
        <Text color={colors.fgDim}>Zhi (志) v0.1.1 · MIT · {paused ? 'PAUSED' : 'RUNNING'}</Text>
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

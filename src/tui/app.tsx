/** @brief App root — the main ink <App> for Zhi TUI. @since 0.1.2 */
import { Box, Text, useApp, useInput } from 'ink';
import { useState, useEffect } from 'react';
import { colors } from './core/colors';
import { resolveKey } from './core/keymap';
import { applyKeyAction } from './core/keyhandler';
import { Header, Dag, Detail, Critics, Eval, Pr as PrPane, Log, Help } from './panes';
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
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false);
  const [criticsExpanded, setCriticsExpanded] = useState(false);
  const [prExpanded, setPrExpanded] = useState(false);
  const [logOffset, setLogOffset] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const [redrawKey, setRedrawKey] = useState(0);

  useEffect(() => {
    onRegister?.((p: Partial<AppState>) => setState((s: AppState) => ({ ...s, ...p })));
  }, [onRegister]);

  useInput((input: string, key: { [k: string]: boolean }) => {
    const action = resolveKey(input, key);
    applyKeyAction(action, {
      setState,
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
  });

  const currentStep = state.steps.find((s) => s.id === state.currentStepId);
  return (
    <Box key={redrawKey} flexDirection="column" paddingX={1}>
      <Header
        loop={state.loop}
        goal={state.goal}
        startedAt={state.startedAt}
        finished={state.finished}
        aborted={state.aborted}
        partial={state.partial}
        prUrl={state.prCi.prUrl}
        tokensUsed={state.tokensUsed}
        tokensBudget={state.tokensBudget}
      />
      <Box marginTop={1} gap={1}>
        <Dag
          steps={state.steps}
          currentStepId={state.currentStepId}
          currentLoop={state.loop}
        />
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
      </Box>
      <Box marginTop={1} gap={1}>
        <PrPane prCi={state.prCi} expanded={prExpanded} />
      </Box>
      <Box marginTop={1}>
        <Log log={state.log} expanded={logExpanded} offset={logOffset} maxLines={40} />
      </Box>
      <Box marginTop={1}>
        <Help paused={paused} showHelp={showHelp} />
      </Box>
      <Box marginTop={1}>
        <Text color={colors.fgDim}>focus: dag·detail·critics·eval·pr·log [{focusIdx % 6}]</Text>
      </Box>
    </Box>
  );
}
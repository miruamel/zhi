/** @brief App root — the main ink <App> for Zhi TUI. @since 0.1.0 */
import { Box, Text, useApp, useInput } from 'ink';
import { useState, useEffect } from 'react';
import { colors } from './core/colors';
import { resolveKey } from './core/keymap';
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

/** @brief Root ink component. @since 0.1.0 */
export function ZhiApp({ initialState, threshold, onAbort, onQuit, onRegister }: AppProps) {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>(initialState);
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    onRegister?.((p) => setState((s) => ({ ...s, ...p })));
  }, [onRegister]);

  useInput((input, key) => {
    const action = resolveKey(input, key);
    switch (action) {
      case 'quit':
        onQuit?.();
        exit();
        break;
      case 'abort':
        setState((s) => ({ ...s, aborted: true, finished: true }));
        onAbort?.();
        exit();
        break;
      case 'pauseResume':
        setPaused((p) => !p);
        break;
      case 'toggleHelp':
        setShowHelp((h) => !h);
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
        <Critics
          critics={state.critics}
          weightedAvg={state.eval.weightedAvg}
          threshold={threshold}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <Eval evalReport={state.eval} />
        <PrPane prCi={state.prCi} />
      </Box>
      <Box marginTop={1}>
        <Log log={state.log} expanded={false} maxLines={40} />
      </Box>
      <Box marginTop={1}>
        <Help paused={paused} showHelp={showHelp} />
      </Box>
      <Box marginTop={1}>
        <Text color={colors.fgDim}>Zhi (志) v0.1.1 · MIT · {paused ? 'PAUSED' : 'RUNNING'}</Text>
      </Box>
    </Box>
  );
}

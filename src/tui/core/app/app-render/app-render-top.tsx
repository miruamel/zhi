/**
 * @fileoverview App render top section — header + file tree / code viewer / metrics row.
 * @since 0.1.2
 * @updated 0.2.6 — extracted from app-render.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Box } from 'ink';
import { Header } from '../../../panes/top/header/header';
import { FileTree } from '../../../panes/top/file-tree/file-tree';
import { CodeViewer } from '../../../panes/top/code-viewer/code-viewer';
import { MetricsPane } from '../../../panes/top/metrics/metrics';
import { AppState } from '../../state';

export interface TopProps {
  state: AppState;
  doneCount: number;
}

/**
 * @brief Render header + file/code/metrics row.
 * @since 0.1.2
 */
export function AppRenderTop({ state, doneCount }: TopProps): React.ReactNode {
  return (
    <>
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
        <CodeViewer path={state.selectedFile} content={state.fileContent} />
        <MetricsPane
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          elapsedMs={Date.now() - state.startedAt}
          stepsCompleted={doneCount}
          stepsTotal={state.steps.length}
          successRate={state.eval?.gatePass ? 1 : 0}
          sparkline={state.tokenSparkline}
        />
      </Box>
    </>
  );
}

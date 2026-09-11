/**
 * @fileoverview App render tree — JSX for ZhiApp pane layout.
 * @since 0.1.2
 * @updated 0.1.12 — pane grid extracted to app-render-panes.tsx; this file is now a thin wrapper
 * @package zhi
 */
import { Box } from 'ink';
import { StatusBar } from '../../../widgets/status-bar';
import { ConflictResolver } from '../../../panes';
import { DagStep } from '../../state';
import type { AppControllerResult } from '../app-controller';
import { AppRenderTop } from './app-render-top';
import { AppRenderPanes } from './app-render-panes';

/**
 * @brief Render the full pane tree from controller state.
 * @param controller controller result from useAppController
 * @param threshold quality threshold
 * @since 0.1.2
 */
export function AppRender({
  controller,
  threshold,
}: {
  controller: AppControllerResult;
  threshold: number;
}): React.ReactNode {
  const { state, nav } = controller;
  const currentStep = state.steps.find((s: DagStep) => s.id === state.currentStepId);
  const hints = ['Ctrl+K palette', 'Tab cycle', 'q quit', 'Space pause', 'h help'];
  const doneCount = state.steps.filter((s: DagStep) => s.status === 'done').length;

  return (
    <Box key={controller.redrawKey + controller.layoutVersion} flexDirection="column" paddingX={1}>
      <AppRenderTop state={state} doneCount={doneCount} />
      <AppRenderPanes controller={controller} threshold={threshold} />
      <ConflictResolver
        open={state.conflictResolverOpen}
        conflicts={state.conflicts}
        selectedId={state.selectedConflictId}
        onResolve={(id) => controller.resolveConflict?.(id)}
        onDismiss={() => controller.setConflictResolverOpen?.(false)}
        onClose={() => controller.setConflictResolverOpen?.(false)}
      />
      <StatusBar
        tokensUsed={state.tokensUsed}
        tokensBudget={state.tokensBudget}
        elapsedMs={Date.now() - state.startedAt}
        step={currentStep?.kind}
        stepCount={doneCount}
        stepTotal={state.steps.length}
        gitBranch={state.git?.branch}
        gitAhead={state.git?.ahead}
        gitBehind={state.git?.behind}
        focusLabel={nav.current}
        mode={controller.mode}
        hints={hints}
      />
    </Box>
  );
}

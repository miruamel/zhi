/**
 * @fileoverview Metrics panes — dashboard, release, orch, budget, loop, sessions, memory, config, help.
 * @since 0.1.12
 * @updated 0.1.12 — extracted from app-render-panes.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { Box } from 'ink';
import {
  DashboardPane,
  ReleasePane,
  OrchPane,
  BudgetPane,
  LoopPane,
  SessionsPane,
  MemoryPane,
  SettingsPane,
  InspectorPane,
  NotificationsPane,
  KnowledgeInspector,
  HelpPane,
} from '../../../panes';
import { DagStep } from '../../state';
import type { AppControllerResult } from '../app-controller';
/**
 * @brief Render metrics/status panes from controller state.
 * @param controller controller result from useAppController
 * @since 0.1.12
 */
export function AppRenderPanesMetrics({
  controller,
}: {
  controller: AppControllerResult;
}): React.ReactNode {
  const { state, arranger } = controller;
  const visiblePanes = arranger.visiblePanes();
  const doneCount = state.steps.filter((s: DagStep) => s.status === 'done').length;

  return (
    <>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('dashboard') && (
          <DashboardPane
            dora={
              state.eval.dora ?? { deployFrequency: 0, leadTime: 0, changeFailureRate: 0, mttr: 0 }
            }
            qualityScore={state.eval.weightedAvg}
            testCoverage={state.eval.testCoverage ?? 0}
            costTrend={state.costTrend ?? 0}
            tokensUsed={state.tokensUsed}
            tokensBudget={state.tokensBudget}
            tokenSparkline={state.tokenSparkline}
            stepsTotal={state.steps.length}
            stepsCompleted={doneCount}
            sessions={state.sessions}
          />
        )}
        {visiblePanes.includes('release') && <ReleasePane builds={[]} releases={[]} />}
        {visiblePanes.includes('orch') && (
          <OrchPane
            steps={state.steps.map((s) => ({
              id: s.id,
              kind: s.kind,
              title: s.detail ?? s.id,
              status: s.status,
              tokens: s.tokensUsed,
              children: s.children,
              parent: s.parent,
            }))}
            currentStepId={state.currentStepId}
          />
        )}
        {visiblePanes.includes('budget') && (
          <BudgetPane
            tokensUsed={state.tokensUsed}
            tokensBudget={state.tokensBudget}
            costEstimate={state.costEstimate}
            costBudget={state.costBudget}
            stepsCompleted={doneCount}
            stepsTotal={state.steps.length}
            elapsedMs={Date.now() - state.startedAt}
          />
        )}
        {visiblePanes.includes('loop') && (
          <LoopPane
            loop={state.loop}
            paused={false}
            aborted={state.aborted}
            finished={state.finished}
            partial={state.partial}
            stepsCompleted={doneCount}
            stepsTotal={state.steps.length}
          />
        )}
      </Box>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('notifications') && (
          <NotificationsPane notifications={state.notifications} unreadCount={state.unreadCount} />
        )}
        {visiblePanes.includes('sessions') && (
          <SessionsPane sessions={state.sessions} activeId={state.activeSessionId} />
        )}
        {visiblePanes.includes('memory') && (
          <MemoryPane
            facts={state.memoryFacts}
            query={state.memoryQuery}
            activeTag={state.memoryActiveTag}
          />
        )}
        {visiblePanes.includes('knowledge') && (
          <KnowledgeInspector
            facts={state.memoryFacts}
            query={state.memoryQuery}
            embeddingDims={state.embeddingDims}
          />
        )}
        {visiblePanes.includes('config') && <SettingsPane entries={state.configEntries} />}
        {visiblePanes.includes('inspector') && (
          <InspectorPane
            nodes={state.inspectorNodes}
            selected={state.inspectorSelected}
            search={state.inspectorQuery}
            isFocused={visiblePanes.includes('inspector')}
          />
        )}
      </Box>
      <Box marginTop={1}>{visiblePanes.includes('help') && <HelpPane />}</Box>
    </>
  );
}

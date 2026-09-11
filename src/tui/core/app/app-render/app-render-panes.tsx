/**
 * @fileoverview Pane grid — all visible pane components rendered from controller state.
 * @since 0.1.12
 * @updated 0.1.12 — extracted from app-render.tsx; metrics panes split to app-render-panes-metrics.tsx
 * @package zhi
 */
import { Box } from 'ink';
import {
  Dag,
  Detail,
  Critics,
  Eval,
  TerminalPane,
  NetworkPane,
  Log,
  AgentRosterPane,
  SkillBrowserPane,
  McpPane,
  ReviewPane,
  TracePane,
  AgentPane,
  Pr as PrPane,
} from '../../../panes';
import { DagStep } from '../../state';
import type { AppControllerResult } from '../app-controller';
import { AppRenderPanesMetrics } from './app-render-panes-metrics';

/**
 * @brief Render all visible panes from controller state.
 * @param controller controller result from useAppController
 * @param threshold quality threshold
 * @since 0.1.12
 */
export function AppRenderPanes({
  controller,
  threshold,
}: {
  controller: AppControllerResult;
  threshold: number;
}): React.ReactNode {
  const { state, arranger } = controller;
  const visiblePanes = arranger.visiblePanes();
  const currentStep = state.steps.find((s: DagStep) => s.id === state.currentStepId);

  return (
    <>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('dag') && (
          <Dag steps={state.steps} currentStepId={state.currentStepId} currentLoop={state.loop} />
        )}
        {visiblePanes.includes('detail') && (
          <Detail
            step={currentStep ?? undefined}
            loop={state.loop}
            tokensUsed={state.tokensUsed}
            tokensBudget={state.tokensBudget}
            recoverAttempts={state.metrics.recoverAttempts}
            expanded={controller.detailExpanded}
          />
        )}
      </Box>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('critics') && (
          <Critics
            critics={state.critics}
            weightedAvg={state.eval.weightedAvg}
            threshold={threshold}
            expanded={controller.criticsExpanded}
            items={state.criticItems}
            criticsFilter={controller.criticsFilter}
            showFixedCritics={controller.showFixedCritics}
            onFix={(id: string) =>
              controller.pushState({
                criticItems: state.criticItems.map((ci) =>
                  ci.id === id ? { ...ci, fixed: true } : ci,
                ),
              })
            }
            onFilter={controller.setCriticsFilter}
            onToggleFixed={() => controller.setShowFixedCritics((p) => !p)}
          />
        )}
        {visiblePanes.includes('eval') && <Eval evalReport={state.eval} />}
        {visiblePanes.includes('pr') && (
          <PrPane prCi={state.prCi} expanded={controller.prExpanded} />
        )}
      </Box>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('terminal') && <TerminalPane lines={state.terminalLines} />}
        {visiblePanes.includes('network') && (
          <NetworkPane requests={state.networkRequests} online={state.networkOnline} />
        )}
        {visiblePanes.includes('agents') && (
          <AgentRosterPane
            agents={state.agents.map((a) => ({
              id: a.id,
              name: a.name,
              status: a.status,
              tasksCompleted: a.tasksCompleted,
              currentTask: a.currentTask,
            }))}
          />
        )}
        {visiblePanes.includes('agent') && (
          <AgentPane
            agents={state.agents.map((a) => ({
              id: a.id,
              name: a.name,
              status: a.status === 'done' ? 'terminated' : a.status,
              capabilities: a.capabilities ?? [],
              tasksCompleted: a.tasksCompleted,
              tasksFailed: a.tasksFailed ?? 0,
              tokensUsed: a.tokensUsed ?? 0,
              lastActive: a.lastActive,
            }))}
            runtimeLog={state.runtimeLog ?? []}
            selectedAgent={state.selectedAgent}
            onDispatch={(agentId: string, task: string) => {
              if (task.trim()) controller.pushState({ dispatch: { agentId, task } });
            }}
            onRefresh={() => controller.pushState({ refresh: true })}
          />
        )}
      </Box>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('skills') && <SkillBrowserPane skills={[]} />}
        {visiblePanes.includes('mcp') && <McpPane servers={[]} />}
      </Box>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('review') && <ReviewPane hunks={[]} comments={[]} />}
        {visiblePanes.includes('trace') && <TracePane entries={state.log} />}
      </Box>
      <Box marginTop={1}>
        {visiblePanes.includes('log') && (
          <Log
            log={state.log}
            expanded={controller.logExpanded}
            offset={controller.logOffset}
            maxLines={40}
          />
        )}
      </Box>
      <AppRenderPanesMetrics controller={controller} />
    </>
  );
}

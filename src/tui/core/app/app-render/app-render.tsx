/**
 * @fileoverview App render tree — JSX for ZhiApp pane layout.
 * @since 0.1.2
<<<<<<< HEAD
 * @updated 0.1.11 — extracted from app.tsx to enforce 150-SLOC guard
=======
 * @updated 0.2.6 — extracted from app.tsx to enforce 150-SLOC guard
>>>>>>> b4c1dda (merge: resolve conflicts with origin/main)
 * @package zhi
 */
import { Box } from 'ink';
import {
  Dag,
  Detail,
  Critics,
  Eval,
<<<<<<< HEAD
=======
  DiffViewer,
>>>>>>> b4c1dda (merge: resolve conflicts with origin/main)
  TerminalPane,
  NetworkPane,
  HelpPane,
  Log,
  SessionsPane,
  MemoryPane,
  SettingsPane,
  OrchPane,
  BudgetPane,
  LoopPane,
  AgentRosterPane,
  SkillBrowserPane,
  McpPane,
  ReviewPane,
  TracePane,
  DashboardPane,
  AgentPane,
  ReleasePane,
  Pr as PrPane,
} from '../../../panes';
import { StatusBar } from '../../../widgets/status-bar';
import { DagStep } from '../../state';
import type { AppControllerResult } from '../app-controller';
import { AppRenderTop } from './app-render-top';

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
<<<<<<< HEAD
  const { state, nav, arranger, layoutVersion } = controller;
  const visiblePanes = arranger.visiblePanes();
=======
  const { state, nav } = controller;
>>>>>>> b4c1dda (merge: resolve conflicts with origin/main)
  const currentStep = state.steps.find((s: DagStep) => s.id === state.currentStepId);
  const hints = ['Ctrl+K palette', 'Tab cycle', 'q quit', 'Space pause', 'h help'];
  const doneCount = state.steps.filter((s: DagStep) => s.status === 'done').length;

  return (
<<<<<<< HEAD
    <Box key={controller.redrawKey + layoutVersion} flexDirection="column" paddingX={1}>
      <AppRenderTop state={state} doneCount={doneCount} />
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
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('dashboard') && (
          <DashboardPane
            dora={
              state.eval.dora ?? { deployFrequency: 0, leadTime: 0, changeFailureRate: 0, mttr: 0 }
            }
            qualityScore={state.eval.weightedAvg}
            testCoverage={0.85}
            costTrend={0}
            tokensUsed={state.tokensUsed}
            tokensBudget={state.tokensBudget}
            stepsCompleted={doneCount}
            stepsTotal={state.steps.length}
          />
        )}
        {visiblePanes.includes('release') && <ReleasePane builds={[]} releases={[]} />}
      </Box>
      <Box marginTop={1} gap={1}>
        {visiblePanes.includes('orch') && (
          <OrchPane
            steps={state.steps.map((s) => ({
              id: s.id,
              kind: s.kind,
              title: s.detail ?? s.id,
              status: s.status,
              tokens: s.tokensUsed,
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
        {visiblePanes.includes('sessions') && (
          <SessionsPane sessions={state.sessions} activeId={state.activeSessionId} />
        )}
        {visiblePanes.includes('memory') && <MemoryPane facts={state.memoryFacts} />}
        {visiblePanes.includes('config') && <SettingsPane entries={state.configEntries} />}
      </Box>
      <Box marginTop={1}>{visiblePanes.includes('help') && <HelpPane />}</Box>
=======
    <Box key={controller.redrawKey} flexDirection="column" paddingX={1}>
      <AppRenderTop state={state} doneCount={doneCount} />
      <Box marginTop={1} gap={1}>
        <Dag steps={state.steps} currentStepId={state.currentStepId} currentLoop={state.loop} />
        <Detail
          step={currentStep ?? undefined}
          loop={state.loop}
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          recoverAttempts={state.metrics.recoverAttempts}
          expanded={controller.detailExpanded}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <Critics
          critics={state.critics}
          weightedAvg={state.eval.weightedAvg}
          threshold={threshold}
          expanded={controller.criticsExpanded}
        />
        <Eval evalReport={state.eval} />
        <DiffViewer diff={state.diff} />
        <PrPane prCi={state.prCi} expanded={controller.prExpanded} />
      </Box>
      <Box marginTop={1} gap={1}>
        <TerminalPane lines={state.terminalLines} />
        <NetworkPane requests={state.networkRequests} online={state.networkOnline} />
        <AgentRosterPane
          agents={state.agents.map((a) => ({
            id: a.id,
            name: a.name,
            status: a.status,
            tasksCompleted: a.tasksCompleted,
            currentTask: a.currentTask,
          }))}
        />
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
      </Box>
      <Box marginTop={1} gap={1}>
        <SkillBrowserPane skills={[]} />
        <McpPane servers={[]} />
      </Box>
      <Box marginTop={1} gap={1}>
        <ReviewPane hunks={[]} comments={[]} />
        <TracePane entries={state.log} />
      </Box>
      <Box marginTop={1}>
        <Log
          log={state.log}
          expanded={controller.logExpanded}
          offset={controller.logOffset}
          maxLines={40}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <DashboardPane
          dora={
            state.eval.dora ?? { deployFrequency: 0, leadTime: 0, changeFailureRate: 0, mttr: 0 }
          }
          qualityScore={state.eval.weightedAvg}
          testCoverage={0.85}
          costTrend={0}
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          stepsCompleted={doneCount}
          stepsTotal={state.steps.length}
        />
        <ReleasePane builds={[]} releases={[]} />
      </Box>
      <Box marginTop={1} gap={1}>
        <OrchPane
          steps={state.steps.map((s) => ({
            id: s.id,
            kind: s.kind,
            title: s.detail ?? s.id,
            status: s.status,
            tokens: s.tokensUsed,
          }))}
          currentStepId={state.currentStepId}
        />
        <BudgetPane
          tokensUsed={state.tokensUsed}
          tokensBudget={state.tokensBudget}
          costEstimate={state.costEstimate}
          costBudget={state.costBudget}
          stepsCompleted={doneCount}
          stepsTotal={state.steps.length}
          elapsedMs={Date.now() - state.startedAt}
        />
        <LoopPane
          loop={state.loop}
          paused={false}
          aborted={state.aborted}
          finished={state.finished}
          partial={state.partial}
          stepsCompleted={doneCount}
          stepsTotal={state.steps.length}
        />
      </Box>
      <Box marginTop={1} gap={1}>
        <SessionsPane sessions={state.sessions} activeId={state.activeSessionId} />
        <MemoryPane facts={state.memoryFacts} />
        <SettingsPane entries={state.configEntries} />
      </Box>
      <Box marginTop={1}>
        <HelpPane />
      </Box>
>>>>>>> b4c1dda (merge: resolve conflicts with origin/main)
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

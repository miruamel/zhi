/** @brief Layout-aware renderer: filters visible panes via resolveLayout, focuses the active pane. @since 0.1.2 */
import React from 'react';
import { Box } from 'ink';
import { colors } from '../core/style/colors';
import { resolveLayout, type LayoutConfig } from '../engine/builder.ts';
import type { PaneId } from '../engine/focus.ts';
import type { AppState } from '../core/state.ts';
import { PaneErrorBoundary } from './error-boundary';
import {
  Header,
  Dag,
  Detail,
  Metrics,
  Critics,
  Timeline,
  Stages,
  Eval,
  Pr as PrPane,
  Knowledge,
  Log,
  CodeViewer,
  Config,
  Help,
  Terminal,
  Agents,
  Files,
  Diff,
  Secrets,
  Notifications,
  Network,
  Resources,
  Gate,
  Audit,
  Queue,
  Profile,
} from '../panes/index.ts';
/** @brief Props for the integration-layer renderer. @since 0.1.2 */
export interface LayoutRendererProps {
  config: LayoutConfig;
  state: AppState;
  threshold: number;
  onAbort?: () => void;
  onQuit?: () => void;
  onRegister?: (push: (p: Partial<AppState>) => void) => void;
  focusedPane?: PaneId;
  onPaneFocus?: (id: PaneId) => void;
  onTogglePane?: (id: PaneId) => void;
}


/** @brief Derive the visible set from a LayoutConfig (panes whose flag is true). */
function visibleSet(config: LayoutConfig): Set<PaneId> {
  const set = new Set<PaneId>();
  for (const p of config.panes) {
    if (p.visible) set.add(p.id);
  }
  return set;
}

/**
 * @brief Layout-driven, focus-aware renderer. Wires panes, focus border,
 *        and the error boundary; skips panes flagged invisible.
 * @since 0.1.2
 */
export function LayoutRenderer(props: LayoutRendererProps): React.ReactElement {
  const { config, state, threshold, focusedPane } = props;
  const visible = visibleSet(config);
  const resolved = resolveLayout(config, visible);
  const currentStep = state.steps.find((s) => s.id === state.currentStepId);

  return (
    <Box flexDirection="column">
      {resolved.panes.map((pane) => {
        const element = renderPane(pane.id, state, threshold, currentStep);
        if (!element) return null;
        const isFocused = focusedPane === pane.id;
        const borderColor = isFocused ? colors.accent : colors.fgDim;
        return (
          <PaneErrorBoundary key={pane.id} paneName={pane.id}>
            <Box borderStyle="single" borderColor={borderColor} flexDirection="column">
              {element}
            </Box>
          </PaneErrorBoundary>
        );
      })}
    </Box>
  );
}

/** @brief Render a single pane with the props it expects, derived from AppState + threshold. */
function renderPane(
  id: PaneId,
  state: AppState,
  threshold: number,
  currentStep: AppState['steps'][number] | undefined,
): React.ReactElement | null {
  switch (id) {
    case 'header':
      return <Header loop={state.loop} goal={state.goal} startedAt={state.startedAt} finished={state.finished} aborted={state.aborted} />;
    case 'dag':
      return <Dag steps={state.steps} currentStepId={state.currentStepId} currentLoop={state.loop} />;
    case 'detail':
      return <Detail step={currentStep} tokensUsed={state.tokensUsed} loop={state.loop} tokensBudget={state.tokensBudget} recoverAttempts={state.metrics.recoverAttempts} />;
    case 'metrics':
      return <Metrics state={state} />;
    case 'critics':
      return <Critics critics={state.critics} weightedAvg={state.eval.weightedAvg} threshold={threshold} />;
    case 'timeline':
      return <Timeline entries={state.timeline} />;
    case 'stages':
      return <Stages state={state} />;
    case 'eval':
      return <Eval evalReport={state.eval} />;
    case 'pr':
      return <PrPane prCi={state.prCi} />;
    case 'knowledge':
      return <Knowledge state={state} />;
    case 'code':
      return <CodeViewer state={state} />;
    case 'config':
      return <Config state={state} />;
    case 'help':
      return <Help paused={false} showHelp={false} />;
    case 'log':
      return <Log log={state.log} maxLines={40} />;
    case 'terminal':
      return <Terminal lines={[]} />;
    case 'agents':
      return <Agents agents={[]} />;
    case 'files':
      return <Files files={[]} />;
    case 'diff':
      return <Diff diff={[]} />;
    case 'secrets':
      return <Secrets secrets={[]} />;
    case 'notifications':
      return <Notifications notifications={[]} />;
    case 'network':
      return <Network connections={[]} />;
    case 'resources':
      return <Resources resources={{ cpu: 0, memory: { used: 0, total: 0 }, disk: { used: 0, total: 0 }, network: { bytesIn: 0, bytesOut: 0 } }} />;
    case 'gate':
      return <Gate gates={[]} />;
    case 'audit':
      return <Audit entries={[]} />;
    case 'queue':
      return <Queue tasks={[]} />;
    case 'profile':
      return <Profile profile={{ name: 'zhi', model: 'unknown', version: '0.1.2', uptime: 0, tokensUsed: 0, tokensBudget: 0, features: [], endpoints: { api: '', ws: '' } }} />;
    default:
      return null;
  }
}
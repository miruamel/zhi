/**
 * @brief Shared renderPane: maps PaneId to its component with the props it expects.
 *
 * Extracted from layout-render.tsx so app.tsx and LayoutRenderer can share a
 * single source of truth for pane-to-component mapping. Accepts app-level
 * UI state (paused, showHelp, expandedCritics, expandedPr, logScroll) as
 * optional params so the same function serves both the live app and the
 * LayoutRenderer test fixture.
 *
 * @since 0.2.0
 */
import React from 'react';
import type { AppState } from '../../core/state';
import type { PaneId } from '../../engine/focus/index';
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
} from '../../panes';

/** @brief App-level UI state threaded into panes that consume it. */
export interface PaneRenderState {
  paused?: boolean;
  showHelp?: boolean;
  expandedCritics?: boolean;
  expandedPr?: boolean;
  logScroll?: number;
  maxLines?: number;
  focused?: boolean;
  version?: string;
}

/** @brief Render a single pane with the props it expects, derived from AppState + threshold. */
export function renderPane(
  id: PaneId,
  state: AppState,
  threshold: number,
  currentStep: AppState['steps'][number] | undefined,
  ui: PaneRenderState = {},
): React.ReactElement | null {
  const {
    paused = false,
    showHelp = false,
    expandedCritics = false,
    expandedPr = false,
    logScroll = 0,
    maxLines = 40,
    focused = true,
    version = '0.1.1',
  } = ui;
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
      return <Critics critics={state.critics} weightedAvg={state.eval.weightedAvg} threshold={threshold} expanded={expandedCritics} />;
    case 'timeline':
      return <Timeline entries={state.timeline} />;
    case 'stages':
      return <Stages state={state} />;
    case 'eval':
      return <Eval evalReport={state.eval} />;
    case 'pr':
      return <PrPane prCi={state.prCi} expanded={expandedPr} />;
    case 'knowledge':
      return <Knowledge state={state} />;
    case 'code':
      return <CodeViewer state={state} />;
    case 'config':
      return <Config state={state} />;
    case 'help':
      return <Help paused={paused} showHelp={showHelp} />;
    case 'log':
      return <Log log={state.log} maxLines={maxLines} scroll={logScroll} />;
    case 'terminal':
      return <Terminal lines={[]} />;
    case 'agents':
      return <Agents agents={[]} focused={focused} />;
    case 'files':
      return <Files files={[]} focused={focused} />;
    case 'diff':
      return <Diff diff={[]} focused={focused} />;
    case 'secrets':
      return <Secrets secrets={[]} focused={focused} />;
    case 'notifications':
      return <Notifications notifications={[]} focused={focused} />;
    case 'network':
      return <Network connections={[]} focused={focused} />;
    case 'resources':
      return <Resources
        resources={{ cpu: 0, memory: { used: 0, total: 0 }, disk: { used: 0, total: 0 }, network: { bytesIn: 0, bytesOut: 0 } }}
        focused={focused}
      />;
    case 'gate':
      return <Gate gates={[]} focused={focused} />;
    case 'audit':
      return <Audit entries={[]} focused={focused} />;
    case 'queue':
      return <Queue tasks={[]} focused={focused} />;
    case 'profile':
      return <Profile
        profile={{
          name: 'zhi',
          model: 'unknown',
          version,
          uptime: 0,
          tokensUsed: 0,
          tokensBudget: 0,
          features: [],
          endpoints: { api: '', ws: '' },
        }}
        focused={focused}
      />;
    default:
      return null;
  }
}
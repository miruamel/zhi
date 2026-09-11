/**
 * @fileoverview Orchestrator pane — DAG visualizer, step scheduling.
 * @since 0.1.11 @updated 0.1.12 — M4a: add tree topology rendering
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Tree, type TreeNode } from '../../../widgets/tree';
import type { DagStep } from '../../../core/state';

/** @brief One step summary row. @since 0.1.11 */
export interface OrchStep {
  id: string;
  kind: string;
  title: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  tokens?: number;
  /** @brief Child step IDs (DAG topology). @since 0.1.12 */
  children?: string[];
  /** @brief Parent step ID (DAG topology). @since 0.1.12 */
  parent?: string;
}

export interface OrchPaneProps {
  steps: OrchStep[];
  currentStepId?: string;
  onStepAbort?: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  pending: colors.fgDim,
  running: colors.forward,
  done: colors.complete,
  failed: colors.error,
  skipped: colors.warn,
};

const STATUS_ICON: Record<string, string> = {
  pending: '○',
  running: '◐',
  done: '●',
  failed: '✗',
  skipped: '⊘',
};

/** @brief Build TreeNode[] from OrchStep[] using parent/children topology. @since 0.1.12 */
function buildOrchTree(steps: OrchStep[]): TreeNode[] {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const roots: OrchStep[] = [];
  const visited = new Set<string>();
  for (const s of steps) {
    if (s.parent && byId.has(s.parent)) continue;
    roots.push(s);
  }
  const build = (step: OrchStep): TreeNode => {
    visited.add(step.id);
    const color = STATUS_COLOR[step.status] ?? colors.fg;
    const icon = STATUS_ICON[step.status] ?? '?';
    const children: TreeNode[] = (step.children ?? [])
      .map((cid) => byId.get(cid))
      .filter((s): s is OrchStep => s !== undefined && !visited.has(s.id))
      .map(build);
    return {
      id: step.id,
      label: `${icon} ${step.title}`,
      value: step.id,
      icon: color,
      children: children.length > 0 ? children : undefined,
    };
  };
  return roots.map(build);
}

/** @brief Flat step list (fallback when no topology). @since 0.1.12 */
function OrchFlatList({ steps, currentStepId }: { steps: OrchStep[]; currentStepId?: string }) {
  return (
    <>
      {steps.map((s) => {
        const isCurrent = s.id === currentStepId;
        const color = isCurrent ? colors.forward : (STATUS_COLOR[s.status] ?? colors.fg);
        const icon = STATUS_ICON[s.status] ?? '?';
        const tokenStr = s.tokens != null ? ` ${s.tokens}t` : '';
        return (
          <Box key={s.id} gap={1}>
            <Text color={color}>
              {isCurrent ? '▸ ' : '  '}
              {icon} {s.title.length > 28 ? s.title.slice(0, 27) + '…' : s.title}
              <Text color={colors.fgDim}>{tokenStr}</Text>
            </Text>
          </Box>
        );
      })}
    </>
  );
}

/** @brief Render the orchestrator pane — tree topology when parent/children present, flat list otherwise. @since 0.1.11 @updated 0.1.12 */
export function OrchPane({ steps, currentStepId, onStepAbort }: OrchPaneProps) {
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const failedCount = steps.filter((s) => s.status === 'failed').length;
  const runningCount = steps.filter((s) => s.status === 'running').length;
  const hasTopology = steps.some((s) => s.parent || (s.children?.length ?? 0) > 0);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _ORCH ({steps.length} · {doneCount}✓ {runningCount}▶ {failedCount}✗
        {hasTopology ? ' · tree' : ''})
      </Text>
      {steps.length === 0 ? (
        <Text color={colors.fgDim}>No steps yet.</Text>
      ) : hasTopology ? (
        <Tree nodes={buildOrchTree(steps)} selected={currentStepId} maxDepth={6} />
      ) : (
        <OrchFlatList steps={steps} currentStepId={currentStepId} />
      )}
      {onStepAbort && (
        <Box marginTop={1}>
          <Text color={colors.error}>[x] abort</Text>
        </Box>
      )}
    </Box>
  );
}

/** @brief Convert DagStep to OrchStep. @since 0.1.11 @updated 0.1.12 — preserve topology fields */
export function toOrchStep(s: DagStep): OrchStep {
  return {
    id: s.id,
    kind: s.kind,
    title: s.detail ?? s.id,
    status: s.status,
    tokens: s.tokensUsed,
    children: s.children,
    parent: s.parent,
  };
}

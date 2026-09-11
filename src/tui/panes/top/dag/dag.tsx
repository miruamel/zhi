/** @brief DAG pane: step list with topology visualization. @since 0.1.2 @updated 0.1.12 — M4a: add tree topology */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { glyphs } from '../../../core/icons';
import { Tree, type TreeNode } from '../../../widgets/tree';
import type { DagStep } from '../../../core/state';

function statusIcon(s: DagStep['status']): { g: string; c: string } {
  switch (s) {
    case 'running':
      return { g: glyphs.running, c: colors.running };
    case 'done':
      return { g: glyphs.done, c: colors.done };
    case 'failed':
      return { g: glyphs.failed, c: colors.failed };
    case 'skipped':
      return { g: '·', c: colors.fgDim };
    case 'pending':
    default:
      return { g: glyphs.pending, c: colors.pending };
  }
}

/** @brief Build a flat step list (fallback when no topology). @since 0.1.2 */
function FlatList({ steps, currentStepId }: { steps: DagStep[]; currentStepId?: string }) {
  return (
    <>
      {steps.map((s) => {
        const { g, c } = statusIcon(s.status);
        const isCurrent = s.id === currentStepId;
        const marker = isCurrent ? '▸' : ' ';
        return (
          <Box key={s.id} gap={1}>
            <Text color={c}>
              {marker} {g} {s.kind.padEnd(9)}
            </Text>
            <Text color={isCurrent ? colors.fg : colors.fgDim}>{s.id}</Text>
            {s.tokensUsed !== undefined && s.tokensUsed > 0 && (
              <Text color={colors.fgDim}> {s.tokensUsed} tok</Text>
            )}
          </Box>
        );
      })}
    </>
  );
}

/** @brief Build TreeNode[] from DagStep[] using parent/children topology. @since 0.1.12 */
function buildTreeNodes(steps: DagStep[]): TreeNode[] {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const roots: DagStep[] = [];
  const childSet = new Set<string>();
  for (const s of steps) {
    if (s.parent && byId.has(s.parent)) {
      childSet.add(s.id);
    } else {
      roots.push(s);
    }
  }
  const visited = new Set<string>();
  const build = (step: DagStep): TreeNode => {
    visited.add(step.id);
    const { g, c } = statusIcon(step.status);
    const children: TreeNode[] = (step.children ?? [])
      .map((cid) => byId.get(cid))
      .filter((s): s is DagStep => s !== undefined && !visited.has(s.id))
      .map(build);
    return {
      id: step.id,
      label: `${g} ${step.kind}`,
      value: step.id,
      icon: c,
      children: children.length > 0 ? children : undefined,
    };
  };
  return roots.map(build);
}

export interface DagProps {
  steps: DagStep[];
  currentStepId?: string;
  currentLoop: string;
}

/** @brief Render the DAG pane — tree topology when parent/children present, flat list otherwise. @since 0.1.2 @updated 0.1.12 */
export function Dag({ steps, currentStepId, currentLoop }: DagProps) {
  if (steps.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.fgDim}
        paddingX={1}
        flexGrow={1}
      >
        <Text color={colors.accent} bold>
          ⟶ DAG
        </Text>
        <Text color={colors.fgDim}> (no plan yet — current: {currentLoop})</Text>
      </Box>
    );
  }
  const hasTopology = steps.some((s) => s.parent || (s.children?.length ?? 0) > 0);
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        ⟶ DAG ({steps.length} steps{hasTopology ? ' · tree' : ''})
      </Text>
      {hasTopology ? (
        <Tree nodes={buildTreeNodes(steps)} selected={currentStepId} maxDepth={6} />
      ) : (
        <FlatList steps={steps} currentStepId={currentStepId} />
      )}
    </Box>
  );
}

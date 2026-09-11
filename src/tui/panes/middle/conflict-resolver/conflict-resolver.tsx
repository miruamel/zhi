/**
 * @fileoverview Conflict resolver pane — DAG cycle/edge conflict display + resolution.
 * @since 0.1.11 @updated 0.1.12 — M4c: conflict resolver UI
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Modal, Tree, type TreeNode } from '../../../widgets';
import type { ConflictEntry } from '../../../core/state';
export type { ConflictEntry } from '../../../core/state';
export interface ConflictResolverProps {
  open: boolean;
  conflicts: ConflictEntry[];
  selectedId?: string;
  onResolve?: (id: string) => void;
  onDismiss?: () => void;
  onClose: () => void;
}

/** @brief Build TreeNode[] from conflict entries. @since 0.1.12 */
function buildConflictTree(entries: ConflictEntry[]): TreeNode[] {
  return entries.map((e) => ({
    id: e.id,
    label: `${e.resolved ? '✓ ' : '⚠ '}${e.cycle.join(' → ')}`,
    value: e.id,
    icon: e.resolved ? colors.complete : colors.error,
    children:
      e.steps.length > 0 ? e.steps.map((s) => ({ label: s, icon: colors.fgDim })) : undefined,
  }));
}

/** @brief Render the conflict resolver modal. @since 0.1.12 */
export function ConflictResolver({
  open,
  conflicts,
  selectedId,
  onResolve,
  onDismiss,
  onClose,
}: ConflictResolverProps): React.ReactElement | null {
  const unresolved = conflicts.filter((c) => !c.resolved).length;
  const hasConflicts = conflicts.length > 0;

  return (
    <Modal
      open={open}
      title={`_CONFLICTS${hasConflicts ? ` (${conflicts.length} · ${unresolved} open)` : ''}`}
      footer={onDismiss ? '[enter] resolve · [esc] close' : undefined}
      onClose={onClose}
    >
      {!hasConflicts ? (
        <Text color={colors.complete}>No conflicts detected.</Text>
      ) : (
        <Box flexDirection="column">
          <Tree nodes={buildConflictTree(conflicts)} selected={selectedId} maxDepth={4} />
          {onResolve && (
            <Box marginTop={1}>
              <Text color={colors.fgDim}>
                {unresolved > 0
                  ? `${unresolved} conflict(s) need resolution.`
                  : 'All conflicts resolved.'}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Modal>
  );
}

/**
 * @fileoverview Inspector pane — component tree + props/state inspection.
 * @since 0.1.13 @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Tree, type TreeNode } from '../../../widgets';
import { Pane } from '../../primitives/base/pane-base';

/** @brief Inspector node — tree node with optional props/state. @since 0.1.13 */
export interface InspectorNode extends TreeNode {
  props?: Record<string, unknown>;
  state?: Record<string, unknown>;
}

/** @brief Inspector pane props. @since 0.1.13 */
export interface InspectorPaneProps {
  nodes: InspectorNode[];
  selected?: string;
  onSelect?: (value: string) => void;
  search?: string;
  onSearch?: (q: string) => void;
  isFocused?: boolean;
}

/** @brief Render key-value row. @since 0.1.13 */
function Row({ k, v }: { k: string; v: unknown }) {
  const val = v === null ? 'null' : v === undefined ? 'undefined' : String(v);
  return (
    <Text>
      <Text color={colors.fgDim}>{k}: </Text>
      <Text color={colors.fg}>{val}</Text>
    </Text>
  );
}

/** @brief Render props/state section. @since 0.1.13 */
function Section({ title, data }: { title: string; data?: Record<string, unknown> }) {
  const entries = data ? Object.entries(data) : [];
  if (entries.length === 0) return null;
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.fgDim} bold>
        {title}
      </Text>
      {entries.map(([k, v]) => (
        <Row key={k} k={k} v={v} />
      ))}
    </Box>
  );
}

/** @brief Inspector pane — presentational, no hooks. @since 0.1.13 */
export function InspectorPane({
  nodes,
  selected,
  onSelect,
  search,
  onSearch,
  isFocused = false,
}: InspectorPaneProps) {
  const selectedNode = nodes.find((n) => n.value === selected);
  return (
    <Pane title="_INSPECTOR" focused={isFocused}>
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width="50%" paddingX={1}>
          <Text color={colors.fgDim} bold>
            COMPONENTS ({nodes.length})
          </Text>
          {onSearch && (
            <Text color={colors.fgDim}>{search ? `find: ${search}` : 'type to filter'}</Text>
          )}
          <Box marginTop={1} overflow="hidden">
            <Tree
              nodes={nodes}
              selected={selected}
              onSelect={onSelect ?? (() => {})}
              maxDepth={8}
            />
          </Box>
        </Box>
        <Box
          flexDirection="column"
          width="50%"
          paddingX={1}
          borderLeftStyle="single"
          borderLeftColor={colors.fgDim}
        >
          {selectedNode ? (
            <>
              <Text color={colors.accent} bold>
                {selectedNode.label}
              </Text>
              <Section title="props" data={selectedNode.props} />
              <Section title="state" data={selectedNode.state} />
            </>
          ) : (
            <Text color={colors.fgDim}>Select a component.</Text>
          )}
        </Box>
      </Box>
    </Pane>
  );
}

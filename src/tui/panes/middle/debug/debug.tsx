/**
 * @fileoverview Debug pane — breakpoints, variables, call stack.
 * @since 0.1.13 @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';
import { Tree, type TreeNode } from '../../../widgets';
import { Pane } from '../../primitives/base/pane-base';

/** @brief Debug pane props. @since 0.1.13 */
export interface DebugPaneProps {
  breakpoints?: DebugBreakpoint[];
  variables?: DebugVariable[];
  callStack?: DebugFrame[];
  selectedFrame?: string;
  onToggleBreakpoint?: (id: string) => void;
  onStepFrame?: (id: string) => void;
  isFocused?: boolean;
}

/** @brief Breakpoint entry. @since 0.1.13 */
export interface DebugBreakpoint extends TreeNode {
  file?: string;
  line?: number;
  enabled?: boolean;
  hitCount?: number;
}

/** @brief Variable entry. @since 0.1.13 */
export interface DebugVariable {
  name: string;
  value: string;
  type?: string;
}

/** @brief Call stack frame. @since 0.1.13 */
export interface DebugFrame extends TreeNode {
  file?: string;
  line?: number;
}

/** @brief Render a variable row. @since 0.1.13 */
function VarRow({ v }: { v: DebugVariable }) {
  return (
    <Box flexDirection="row" gap={1}>
      <Text color={colors.accent}>{v.name}</Text>
      <Text color={colors.fgDim}>:</Text>
      <Text color={colors.fg}>{v.value}</Text>
      {v.type && (
        <>
          <Text color={colors.fgDim}>:</Text>
          <Text color={colors.fgDim}>{v.type}</Text>
        </>
      )}
    </Box>
  );
}

/** @brief Debug pane — presentational, no hooks. @since 0.1.13 */
export function DebugPane({
  breakpoints = [],
  variables = [],
  callStack = [],
  selectedFrame,
  onToggleBreakpoint,
  onStepFrame,
  isFocused = false,
}: DebugPaneProps) {
  const activeBreakpoints = breakpoints.filter((b) => b.enabled !== false);
  const hitTotal = breakpoints.reduce((s, b) => s + (b.hitCount ?? 0), 0);

  return (
    <Pane title="_DEBUG" focused={isFocused}>
      <Box flexDirection="row" flexGrow={1} overflow="hidden">
        <Box flexDirection="column" width="50%" paddingX={1} gap={1}>
          <Box flexDirection="column">
            <Text color={colors.warn} bold>
              BREAKPOINTS ({activeBreakpoints.length}/{breakpoints.length})
            </Text>
            {hitTotal > 0 && <Text color={colors.fgDim}>hits: {hitTotal}</Text>}
            {breakpoints.length === 0 ? (
              <Text color={colors.fgDim}>No breakpoints set.</Text>
            ) : (
              <Box marginTop={1} overflow="hidden">
                <Tree
                  nodes={breakpoints}
                  selected={undefined}
                  onSelect={onToggleBreakpoint ?? (() => {})}
                  maxDepth={4}
                />
              </Box>
            )}
          </Box>
          <Box flexDirection="column" marginTop={1}>
            <Text color={colors.accent} bold>
              CALL STACK ({callStack.length})
            </Text>
            {callStack.length === 0 ? (
              <Text color={colors.fgDim}>No active session.</Text>
            ) : (
              <Box marginTop={1} overflow="hidden">
                <Tree
                  nodes={callStack}
                  selected={selectedFrame}
                  onSelect={onStepFrame ?? (() => {})}
                  maxDepth={6}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box flexDirection="column" width="50%" paddingX={1}>
          <Text color={colors.complete} bold>
            VARIABLES ({variables.length})
          </Text>
          {variables.length === 0 ? (
            <Text color={colors.fgDim}>No variables in scope.</Text>
          ) : (
            <Box flexDirection="column" marginTop={1} overflow="hidden">
              {variables.map((v, i) => (
                <VarRow key={v.name ?? `var-${i}`} v={v} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Pane>
  );
}

/**
 * @fileoverview Pane primitives — base layout components (Pane, SplitPane, ScrollablePane).
 * @since 0.1.11
 * @updated 0.2.6 — extracted from panes/index.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import React, { useState } from 'react';
import { Box, Text } from 'ink';

/** @brief Pane props. @since 0.1.11 */
export interface PaneProps {
  title?: string;
  focused?: boolean;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  onResize?: (width: number, height: number) => void;
}

/** @brief Pane component. @since 0.1.11 */
export function Pane({ title, focused = false, width, height, children }: PaneProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle={focused ? 'round' : 'single'}
      borderColor={focused ? 'cyan' : 'gray'}
      paddingX={1}
      paddingY={0}
      width={width as any}
      height={height as any}
    >
      {title && (
        <Text bold color={focused ? 'cyan' : 'white'}>
          {title}
        </Text>
      )}
      <Box marginTop={title ? 0 : 0} flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}

/** @brief Split pane — divides space horizontally or vertically. @since 0.1.11 */
export function SplitPane({
  direction = 'horizontal',
  children,
  gap = 0,
}: {
  direction?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  gap?: number;
}) {
  return (
    <Box flexDirection={direction === 'horizontal' ? 'row' : 'column'} gap={gap}>
      {children}
    </Box>
  );
}

/** @brief Scrollable pane. @since 0.1.11 */
export function ScrollablePane({
  children,
  height = 20,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  const [scroll] = useState(0);
  return (
    <Box flexDirection="column" height={height} overflow="hidden">
      <Box marginTop={-scroll}>{children}</Box>
    </Box>
  );
}

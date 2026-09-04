/**
 * @brief Tooltip widget: hover/focus overlay with positioned content and arrow indicator.
 * @since 0.1.1
 */
import { Box, Text } from 'ink';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../../core/style/colors';
import type { TimeoutHandle } from '../../core/types';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  width?: number;
  visible?: boolean;
}

/** @brief Arrow glyph rendered next to the trigger based on overlay side. @since 0.1.1 */
const ARROW_BY_POSITION: Record<TooltipPosition, string> = {
  top: '▼',
  bottom: '▲',
  left: '▶',
  right: '◀',
};

/** @brief Render a hover/focus tooltip overlay around the given trigger element. @since 0.1.1 */
export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 0,
  width,
  visible: visibleProp,
}: TooltipProps) {
  const [internalVisible, setVisible] = useState(false);
  const visible = visibleProp ?? internalVisible;
  const timerRef = useRef<TimeoutHandle | null>(null);

  useEffect(() => () => {
    clearTimeout(timerRef.current ?? undefined);
  }, []);

  const onShow = () => {
    clearTimeout(timerRef.current ?? undefined);
    if (delay <= 0) { setVisible(true); return; }
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const onHide = () => {
    clearTimeout(timerRef.current ?? undefined);
    timerRef.current = null;
    setVisible(false);
  };

  return (
    <Box flexDirection="column">
      {/* @ts-expect-error Ink Box lacks onMouseEnter/onFocus props; runtime no-op until Ink 5+ */}
      <Box onMouseEnter={onShow} onMouseLeave={onHide} onFocus={onShow} onBlur={onHide}>
        {children}
      </Box>
      {visible && (
        <Box
          width={width}
          borderStyle="round"
          borderColor={colors.border}
          flexDirection="column"
          paddingX={1}
        >
          <Text color={colors.fg}>{content}</Text>
          <Text color={colors.border}>{ARROW_BY_POSITION[position]}</Text>
        </Box>
      )}
    </Box>
  );
}

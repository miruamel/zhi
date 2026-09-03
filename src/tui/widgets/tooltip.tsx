/** @brief Tooltip widget: hover/focus overlay with positioned content and arrow indicator. @since 0.1.1 */
import { Box, Text } from 'ink';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../core/style/colors';

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
  const timerRef = useRef<Timeout | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const onShow = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (delay <= 0) { setVisible(true); return; }
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const onHide = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setVisible(false);
  };

  return (
    <Box flexDirection="column">
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
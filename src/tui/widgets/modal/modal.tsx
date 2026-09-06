/**
 * @fileoverview Modal — overlay container.
 * @since 0.2.0
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

export interface ModalProps {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

/** @brief Render a centered modal overlay. @since 0.2.0 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.accentBlue} paddingX={2} paddingY={1}>
      {title && (
        <Text bold color={colors.accent}>
          {title}
          {onClose && <Text dimColor> [esc]</Text>}
        </Text>
      )}
      {children}
    </Box>
  );
}
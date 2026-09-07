/**
 * @fileoverview Modal widget — overlay dialog with backdrop and footer. @since 0.2.6
 * @package zhi
 */
import { Box, Text } from 'ink';

/** @brief Modal props. @since 0.2.6 */
export interface ModalProps {
  open: boolean;
  title?: string;
  footer?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

/** @brief Modal component — pure presentational, no hooks for testability. @since 0.2.6 */
export function Modal({
  open,
  title,
  footer,
  onClose,
  children,
}: ModalProps): React.ReactElement | null {
  if (!open) return null;
  void onClose;
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box borderStyle="round" borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
        {title && (
          <Text color="cyan" bold>
            {title}
          </Text>
        )}
        <Box marginTop={1}>{children}</Box>
        {footer && (
          <Box marginTop={1}>
            <Text color="gray">{footer}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

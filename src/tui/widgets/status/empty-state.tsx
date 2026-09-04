/** @brief EmptyState widget: centered placeholder with icon, title, optional description, action and hint. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../core/style/colors';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  hint?: string;
  centered?: boolean;
}

/** @brief Render a centered empty/placeholder state. @since 0.1.1 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  hint,
  centered = true,
}: EmptyStateProps) {
  return (
    <Box
      flexDirection="column"
      alignItems={centered ? 'center' : 'flex-start'}
      paddingY={1}
    >
      {icon !== undefined && (
        <Text color={colors.fgDim}>{icon}</Text>
      )}
      <Text bold>{title}</Text>
      {description !== undefined && (
        <Text dimColor>{description}</Text>
      )}
      {action !== undefined && (
        <Box marginTop={1} borderStyle="round" borderColor={colors.accent} paddingX={1}>
          <Text color={action.disabled ? colors.fgDim : colors.accent}>{action.label}</Text>
        </Box>
      )}
      {hint !== undefined && (
        <Text dimColor>{hint}</Text>
      )}
    </Box>
  );
}
/** @brief Queue pane: task queue with priority colors, progress, and retry/cancel keys. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../../core/style/colors';
import { glyphs } from '../../core/style/icons';
import { ProgressBar } from '../../widgets';

export type QueueStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
export type QueuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface QueueTask {
  id: string;
  title: string;
  status: QueueStatus;
  priority: QueuePriority;
  progress: number;
  eta?: number;
  worker?: string;
}

export interface QueueProps {
  tasks: QueueTask[];
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  maxLines?: number;
  focused?: boolean;
}

const PRIORITY_COLOR: Record<QueuePriority, string> = {
  low: 'gray',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

const STATUS_ICON: Record<QueueStatus, string> = {
  queued: glyphs.pending,
  running: glyphs.running,
  done: glyphs.done,
  failed: glyphs.failed,
  cancelled: '⊘',
};

const STATUS_COLOR: Record<QueueStatus, string> = {
  queued: colors.pending,
  running: colors.running,
  done: colors.done,
  failed: colors.failed,
  cancelled: colors.fgDim,
};

const DEFAULT_MAX = 12;

/** @brief Handle a keypress in the queue pane: retry or cancel the first visible task. @since 0.1.1 */
export function handleQueueKey(
  input: string,
  tasks: QueueTask[],
  onRetry?: (id: string) => void,
  onCancel?: (id: string) => void,
): { retry?: string; cancel?: string } {
  const first = tasks[0];
  if (!first) return {};
  if (input === 'r' && onRetry) return { retry: first.id };
  if (input === 'x' && onCancel) return { cancel: first.id };
  return {};
}

/** @brief Render the task queue pane with priority colors, progress, and key bindings. @since 0.1.1 */
export function Queue({ tasks, onRetry, onCancel, maxLines = DEFAULT_MAX , focused = true }: QueueProps) {
  const visible = tasks.slice(0, maxLines);

  useInput((input) => {
    if (!focused) return;
    const { retry, cancel } = handleQueueKey(input, tasks, onRetry, onCancel);
    if (retry && onRetry) onRetry(retry);
    if (cancel && onCancel) onCancel(cancel);
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accent}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accent} bold>
        {glyphs.info} QUEUE ({tasks.length})
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}> (queue empty)</Text>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {visible.map((t) => (
            <Box key={t.id} flexDirection="column">
              <Box gap={1}>
                <Text color={PRIORITY_COLOR[t.priority]} bold>
                  {t.priority.toUpperCase().padEnd(8)}
                </Text>
                <Text color={STATUS_COLOR[t.status]}>{STATUS_ICON[t.status]}</Text>
                <Text color={colors.fg}>{t.title}</Text>
                {t.worker ? <Text color={colors.fgDim}>@{t.worker}</Text> : null}
                {t.eta !== undefined ? (
                  <Text color={colors.fgDim}>eta {t.eta}s</Text>
                ) : null}
              </Box>
              <ProgressBar
                label=" "
                value={t.progress}
                max={100}
                width={20}
                color={STATUS_COLOR[t.status]}
              />
            </Box>
          ))}
          {tasks.length > visible.length ? (
            <Text color={colors.fgDim}>+{tasks.length - visible.length} more</Text>
          ) : null}
        </Box>
      )}
      <Box marginTop={1} gap={1}>
        <Text color={colors.fgDim}>r</Text>
        <Text color={colors.fg}>retry</Text>
        <Text color={colors.fgDim}>x</Text>
        <Text color={colors.fg}>cancel</Text>
      </Box>
    </Box>
  );
}
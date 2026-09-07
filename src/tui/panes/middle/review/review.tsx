/**
 * @fileoverview Review pane — side-by-side diff, comments, approve/reject.
 * @since 0.2.4
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief A single diff hunk. @since 0.2.4 */
export interface DiffHunk {
  file: string;
  lines: Array<{ prefix: '+' | '-' | ' '; content: string }>;
}

/** @brief A review comment. @since 0.2.4 */
export interface ReviewComment {
  id: string;
  file: string;
  line: number;
  author: string;
  body: string;
  resolved: boolean;
}

/** @brief Review pane props. @since 0.2.4 */
export interface ReviewPaneProps {
  hunks: DiffHunk[];
  comments: ReviewComment[];
  selectedHunk?: number;
  onApprove?: () => void;
  onReject?: () => void;
  onAddComment?: (file: string, line: number, body: string) => void;
}

const PREFIX_COLOR: Record<string, string> = {
  '+': colors.complete,
  '-': colors.error,
  ' ': colors.fgDim,
};

/** @brief Render the review pane. @since 0.2.4 */
export function ReviewPane({
  hunks,
  comments,
  selectedHunk,
  onApprove,
  onReject,
}: ReviewPaneProps) {
  const unresolved = comments.filter((c) => !c.resolved).length;
  const current = hunks[selectedHunk ?? 0];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _REVIEW ({hunks.length} hunks · {unresolved} open)
      </Text>
      {current ? (
        <>
          <Text color={colors.fgDim}>{current.file}</Text>
          {current.lines.slice(0, 20).map((l, i) => (
            <Text key={i} color={PREFIX_COLOR[l.prefix] ?? colors.fg}>
              {l.prefix} {l.content.slice(0, 60)}
            </Text>
          ))}
        </>
      ) : (
        <Text color={colors.fgDim}>No diff to review.</Text>
      )}
      <Box gap={2} marginTop={1}>
        {onApprove && <Text color={colors.complete}>[a] approve</Text>}
        {onReject && <Text color={colors.error}>[r] reject</Text>}
      </Box>
    </Box>
  );
}

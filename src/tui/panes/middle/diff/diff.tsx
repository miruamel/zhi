/** @brief Diff pane: unified diff viewer with colored +/- lines. @since 0.1.1 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/style/colors';

export interface DiffLine {
  type: 'context' | 'added' | 'removed';
  content: string;
  lineNumber: number;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffFile {
  file: string;
  hunks: DiffHunk[];
}

export interface DiffProps {
  diff: DiffFile[];
  maxLines?: number;
  showLineNumbers?: boolean;
  focused?: boolean;
}

const DEFAULT_MAX_LINES = 200;

/** @brief Render the diff viewer pane. @since 0.1.1 */
export function Diff({ diff, maxLines = DEFAULT_MAX_LINES, showLineNumbers = true }: DiffProps) {
  const limit = Math.max(0, maxLines);
  let budget = limit;
  const out: React.ReactNode[] = [];
  let consumed = 0;
  let truncated = false;

  for (const file of diff) {
    if (budget <= 0) {
      truncated = true;
      break;
    }
    out.push(
      <Box key={`f-${file.file}`}>
        <Text color={colors.warn} bold>
          {file.file}
        </Text>
      </Box>,
    );
    consumed += 1;
    budget -= 1;
    for (const hunk of file.hunks) {
      if (budget <= 0) {
        truncated = true;
        break;
      }
      out.push(
        <Box key={`h-${file.file}-${hunk.oldStart}`}>
          <Text color={colors.fgDim}>
            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
          </Text>
        </Box>,
      );
      consumed += 1;
      budget -= 1;
      for (const line of hunk.lines) {
        if (budget <= 0) {
          truncated = true;
          break;
        }
        const lineKey = `l-${file.file}-${hunk.oldStart}-${line.lineNumber}-${line.type}`;
        out.push(
          <Box key={lineKey}>

            {showLineNumbers ? (
              <Text color={colors.fgDim}>{String(line.lineNumber).padStart(4)} </Text>
            ) : null}
            {line.type === 'added' ? (
              <Text color={colors.done} backgroundColor={colors.bg}>
                + {line.content}
              </Text>
            ) : line.type === 'removed' ? (
              <Text color={colors.failed} backgroundColor={colors.bg}>
                - {line.content}
              </Text>
            ) : (
              <Text color={colors.fgDim}>  {line.content}</Text>
            )}
          </Box>,
        );
        consumed += 1;
        budget -= 1;
      }
      if (truncated) break;
    }
    if (truncated) break;
  }

  if (diff.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.warn}
        paddingX={1}
        flexGrow={1}
      >
        <Text color={colors.warn} bold>DIFF</Text>
        <Box marginTop={1}>
          <Text color={colors.fgDim}>no changes</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.warn}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.warn} bold>DIFF ({diff.length} file{diff.length === 1 ? '' : 's'})</Text>
      <Box flexDirection="column" marginTop={1}>
        {out}
        {truncated ? <Text color={colors.fgDim}>… {consumed}+ lines, truncated at {limit}</Text> : null}
      </Box>
    </Box>
  );
}
/** @brief Files pane: flat file list with size, lang badge, status icon. @since 0.1.1 */
import { Box, Text, useInput } from 'ink';
import { colors } from '../../../core/style/colors';

const KB = 1024;
const MB = KB * 1024;

/** @brief Single file row. @since 0.1.1 */
export interface FileEntry {
  path: string;
  size: number;
  lang: string;
  status?: 'modified' | 'added' | 'deleted' | 'unchanged';
}

/** @brief Files pane props. @since 0.1.1 */
export interface FilesProps {
  files: FileEntry[];
  onFileClick?: (path: string) => void;
  maxLines?: number;
  title?: string;
  focused?: boolean;
}

const LANG_COLOR: Record<string, string> = {
  ts: colors.accentBlue,
  tsx: colors.accentBlue,
  js: colors.warn,
  json: 'orange' as const,
  md: colors.done,
  py: colors.done,
};

const STATUS_ICON: Record<NonNullable<FileEntry['status']>, string> = {
  modified: '●',
  added: '+',
  deleted: '-',
  unchanged: ' ',
};

/** @brief Render bytes as "512 B" / "4.2 KB" / "1.7 MB". @since 0.1.1 */
export function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

/** @brief Render the files pane. @since 0.1.1 */
export function Files({ files, onFileClick, maxLines, title , focused = true }: FilesProps) {
  const visible = maxLines !== undefined ? files.slice(0, maxLines) : files;

  useInput((_input, key) => {
    if (!focused) return;
    if (key.return && onFileClick && visible[0]) onFileClick(visible[0].path);
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.accentBlue}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.accentBlue} bold>
        {title ?? `◰ FILES (${files.length})`}
      </Text>
      {visible.length === 0 ? (
        <Text color={colors.fgDim}>no files</Text>
      ) : (
        visible.map((f) => {
          const langColor = LANG_COLOR[f.lang] ?? colors.fgDim;
          const status = f.status ? STATUS_ICON[f.status] : ' ';
          return (
            <Box key={f.path} gap={1}>
              <Text color={colors.fgDim}>{status}</Text>
              <Text color={colors.fg}>{f.path}</Text>
              <Text color={langColor}>{`[${f.lang}]`}</Text>
              <Text color={colors.fgDim}>{formatSize(f.size)}</Text>
            </Box>
          );
        })
      )}
    </Box>
  );
}
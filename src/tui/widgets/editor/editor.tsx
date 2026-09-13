/**
 * @fileoverview Rich text editor widget — markdown editing surface with live preview.
 * @since 0.1.13
 * @package zhi
 */
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { colors } from '../../core/colors';
import { deleteAt, insertAt, moveCursor, type Cursor } from './actions/editor-actions';
import { MarkdownPreview } from './markdown-preview';
import { Toolbar } from './toolbar';

/** @brief Editor props. @since 0.1.13 */
export interface EditorProps {
  initialValue?: string;
  onChange?: (v: string) => void;
  onExport?: (v: string) => void;
  onCopy?: (v: string) => void;
  height?: number;
  preview?: boolean;
}

/** @brief Rich text editor. @since 0.1.13 */
export function Editor({
  initialValue = '',
  onChange,
  onExport,
  onCopy,
  height = 20,
  preview = true,
}: EditorProps) {
  const [value, setValue] = useState(initialValue);
  const [cursor, setCursor] = useState<Cursor>({ line: 0, col: 0 });
  const [showPreview, setShowPreview] = useState(preview);

  const lines = value.split('\n');
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const commit = (v: string, c: Cursor) => {
    setValue(v);
    setCursor(c);
    onChange?.(v);
  };

  const apply = (text: string) => {
    const [v, c] = insertAt(value, cursor, text);
    commit(v, c);
  };

  useInput((input, key) => {
    if (key.ctrl || key.meta) {
      if (input === 'a') setCursor(moveCursor(value, cursor, 0, -999));
      else if (input === 'e') setCursor(moveCursor(value, cursor, 0, 999));
      else if (input === 's') {
        onExport?.(value);
        return;
      } else if (input === 'c') {
        onCopy?.(value);
        return;
      } else if (input === 'v') setShowPreview((p) => !p);
      return;
    }
    if (key.return) {
      apply('\n');
      return;
    }
    if (key.backspace) {
      const [v, c] = deleteAt(value, cursor);
      commit(v, c);
      return;
    }
    if (input === '\u001b[C') {
      setCursor(moveCursor(value, cursor, 0, 1));
      return;
    }
    if (input === '\u001b[D') {
      setCursor(moveCursor(value, cursor, 0, -1));
      return;
    }
    if (input === '\u001b[A') {
      setCursor(moveCursor(value, cursor, -1, 0));
      return;
    }
    if (input === '\u001b[B') {
      setCursor(moveCursor(value, cursor, 1, 0));
      return;
    }
    if (key.tab) {
      apply('  ');
      return;
    }
    if (input && input.length === 1 && !key.escape) apply(input);
  });

  const toolbarActions = {
    bold: () => apply('**' + '**'),
    italic: () => apply('*' + '*'),
    heading: () => apply('# '),
    list: () => apply('- '),
    code: () => apply('`' + '`'),
    link: () => apply('[text](url)'),
    togglePreview: () => setShowPreview((p) => !p),
  };

  const cursorLine = lines[cursor.line] ?? '';
  const displayLine = cursorLine.slice(0, cursor.col) + '█' + cursorLine.slice(cursor.col);

  return (
    <Box flexDirection="column" height={height} overflow="hidden">
      <Toolbar {...toolbarActions} />
      <Box flexDirection="row" flexGrow={1} overflow="hidden">
        <Box
          flexDirection="column"
          width={showPreview ? '50%' : '100%'}
          paddingX={1}
          overflow="hidden"
        >
          <Text color={colors.fgDim}>EDITOR</Text>
          {lines.map((_, i) => {
            const isCursor = i === cursor.line;
            const text = isCursor ? displayLine : (lines[i] ?? '');
            return (
              <Text key={i} color={isCursor ? colors.fg : colors.fgDim}>
                {text || ' '}
              </Text>
            );
          })}
        </Box>
        {showPreview && (
          <Box flexDirection="column" width="50%" paddingX={1} overflow="hidden">
            <Text color={colors.fgDim}>PREVIEW</Text>
            <MarkdownPreview markdown={value} />
          </Box>
        )}
        <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
          <Text color={colors.fgDim}>
            {wordCount}w / {charCount}c
          </Text>
          <Text color={colors.fgDim}>Ctrl+V preview · Ctrl+S export · Ctrl+C copy</Text>
        </Box>
      </Box>
    </Box>
  );
}

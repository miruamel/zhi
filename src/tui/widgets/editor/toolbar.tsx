/**
 * @fileoverview Editor toolbar — formatting buttons for the rich text editor.
 * @since 0.1.13
 * @package zhi
 */
import { Box, Text } from 'ink';
import { colors } from '../../core/colors';

/** @brief Toolbar props. @since 0.1.13 */
export interface ToolbarProps {
  bold?: () => void;
  italic?: () => void;
  heading?: () => void;
  list?: () => void;
  code?: () => void;
  link?: () => void;
  togglePreview?: () => void;
}

/** @brief Toolbar button. @since 0.1.13 */
function Btn({ label, onClick }: { label: string; onClick?: () => void }) {
  void onClick;
  return (
    <Text color={colors.accent}>
      {'['}
      {label}
      {']'}
    </Text>
  );
}

/** @brief Formatting toolbar. @since 0.1.13 */
export function Toolbar({ bold, italic, heading, list, code, link, togglePreview }: ToolbarProps) {
  void bold;
  void italic;
  void heading;
  void list;
  void code;
  void link;
  void togglePreview;
  return (
    <Box gap={1} paddingX={1}>
      <Text color={colors.fgDim}>TOOLBAR</Text>
      <Btn label="B" onClick={bold} />
      <Btn label="I" onClick={italic} />
      <Btn label="H" onClick={heading} />
      <Btn label="•" onClick={list} />
      <Btn label="</>" onClick={code} />
      <Btn label="🔗" onClick={link} />
      <Btn label="Preview" onClick={togglePreview} />
    </Box>
  );
}

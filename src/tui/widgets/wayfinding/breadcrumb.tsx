/** @brief Breadcrumb widget: clickable navigation trail with truncation. @since 0.1.1 */
import { Box, Text, useFocus, useInput } from 'ink';
import React, { useState } from 'react';
import { colors } from '../../core/style/colors';

/** @brief Single breadcrumb entry. @since 0.1.1 */
export interface BreadcrumbItem {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: string;
}

/** @brief Breadcrumb props. @since 0.1.1 */
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  maxItems?: number;
  onSeparate?: (item: BreadcrumbItem, index: number) => void;
}

/** @brief Truncate middle when items exceed maxItems. Keeps first and last, inserts ellipsis. @since 0.1.1 */
function truncateMiddle(items: BreadcrumbItem[], max: number): BreadcrumbItem[] {
  if (items.length <= max || max < 3) return items;
  const head = items.slice(0, Math.floor((max - 1) / 2));
  const tail = items.slice(items.length - Math.ceil((max - 1) / 2));
  return [...head, { label: '...' }, ...tail];
}

/** @brief Clickable, focusable breadcrumb segment. @since 0.1.1 */
function Segment({
  item,
  isFocused,
}: {
  item: BreadcrumbItem;
  isFocused: boolean;
}): React.ReactElement {
  const { isFocused: focused } = useFocus({ isActive: !item.active });
  useInput(
    (_input, key) => {
      if (key.return && item.onClick) item.onClick();
    },
    { isActive: !item.active && (isFocused || focused) },
  );
  const labelNode = item.active ? (
    <Text bold color={colors.accent}>
      {item.icon ? `${item.icon} ` : ''}{item.label}
    </Text>
  ) : (
    <Text color={colors.accentBlue} underline={focused || isFocused}>
      {item.icon ? `${item.icon} ` : ''}{item.label}
    </Text>
  );
  return labelNode;
}

/** @brief Render a breadcrumb trail. @since 0.1.1 */
export function Breadcrumb({
  items,
  separator = ' > ',
  maxItems,
  onSeparate,
}: BreadcrumbProps): React.ReactElement {
  const [focusIndex, setFocusIndex] = useState(0);
  const rendered = maxItems ? truncateMiddle(items, maxItems) : items;
  const clickableCount = rendered.filter((i) => !i.active).length;

  useInput(
    (_input, key) => {
      if (clickableCount === 0) return;
      if (key.leftArrow) {
        setFocusIndex((i) => (i - 1 + clickableCount) % clickableCount);
      } else if (key.rightArrow) {
        setFocusIndex((i) => (i + 1) % clickableCount);
      }
    },
    { isActive: clickableCount > 0 },
  );

  let clickableSeen = 0;
  return (
    <Box>
      {rendered.map((item, idx) => {
        const isLast = idx === rendered.length - 1;
        if (!item.active && item.onClick) {
          const myIdx = clickableSeen++;
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <Segment item={item} isFocused={myIdx === focusIndex} />
              {!isLast && (
                <Text dimColor>
                  {onSeparate ? '' : separator}
                </Text>
              )}
              {onSeparate && onSeparate(item, idx)}
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            <Segment item={item} isFocused={false} />
            {!isLast && (
              <Text dimColor>
                {onSeparate ? '' : separator}
              </Text>
            )}
            {onSeparate && onSeparate(item, idx)}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

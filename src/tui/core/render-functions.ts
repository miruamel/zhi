/**
 * @fileoverview Render functions — standalone box/text/list/table/progress/spinner/badge/divider/help helpers.
 * @since 0.1.11
 * @updated 0.2.6 — extracted from render.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import React from 'react';
import { Box, Text } from 'ink';
import { RenderOptions } from './render-types';

/** @brief Render a box with options. @since 0.1.11 */
export function renderBox(options: RenderOptions, children: React.ReactNode): React.ReactNode {
  const {
    padding = 0,
    margin = 0,
    border = false,
    borderStyle,
    color,
    backgroundColor,
    width,
    height,
    flexDirection = 'column',
    justifyContent = 'flex-start',
    alignItems = 'flex-start',
    gap = 0,
    overflow,
    wrap,
  } = options;

  return React.createElement(
    Box,
    {
      padding,
      margin,
      borderStyle: border ? ((borderStyle || 'single') as any) : undefined,
      color: color as any,
      backgroundColor: backgroundColor as any,
      width: width as any,
      height: height as any,
      flexDirection,
      justifyContent,
      alignItems,
      gap,
      overflow,
      flexWrap: wrap as any,
    } as any,
    children,
  );
}

/** @brief Render text with style. @since 0.1.11 */
export function renderText(content: string, options: RenderOptions = {}): React.ReactNode {
  const { color, bold, italic, underline, strikethrough, dimColor } = options;
  return React.createElement(
    Text,
    {
      color: color as any,
      bold,
      italic,
      underline,
      strikethrough,
      dimColor: dimColor as any,
    },
    content,
  );
}

/** @brief Render a list. @since 0.1.11 */
export function renderList(items: string[], options: RenderOptions = {}): React.ReactNode {
  return React.createElement(
    Box,
    { flexDirection: 'column', overflow: 'hidden', ...(options as any) },
    items.map((item, i) => React.createElement(Text, { key: i }, `${i + 1}. ${item}`)),
  );
}

/** @brief Render a table. @since 0.1.11 */
export function renderTable(
  headers: string[],
  rows: string[][],
  options: RenderOptions = {},
): React.ReactNode {
  return React.createElement(
    Box,
    { flexDirection: 'column', overflow: 'hidden', ...(options as any) },
    React.createElement(Text, { bold: true }, headers.join(' | ')),
    ...rows.map((row, i) => React.createElement(Text, { key: i }, row.join(' | '))),
  );
}

/** @brief Render a progress bar. @since 0.1.11 */
export function renderProgress(value: number, max = 100, width = 20): React.ReactNode {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return React.createElement(Text, { color: 'cyan' }, `[${bar}] ${value}/${max}`);
}

/** @brief Render a spinner. @since 0.1.11 */
export function renderSpinner(frame: number): React.ReactNode {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  return React.createElement(Text, { color: 'yellow' }, frames[frame % frames.length]);
}

/** @brief Render a badge. @since 0.1.11 */
export function renderBadge(text: string, color: string): React.ReactNode {
  return React.createElement(Text, { color: color as any, bold: true }, ` ${text} `);
}

/** @brief Render a divider. @since 0.1.11 */
export function renderDivider(char = '─', length?: number): React.ReactNode {
  return React.createElement(Text, { dimColor: true }, char.repeat(length ?? 40));
}

/** @brief Render key binding help. @since 0.1.11 */
export function renderHelp(bindings: Array<{ key: string; description: string }>): React.ReactNode {
  return React.createElement(
    Box,
    { flexDirection: 'column' },
    bindings.map((b, i) =>
      React.createElement(Text, { key: i, dimColor: true }, `${b.key.padEnd(10)} ${b.description}`),
    ),
  );
}

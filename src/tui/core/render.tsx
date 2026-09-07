/**
 * @fileoverview TUI render — rendering engine for the Zhi terminal interface.
 * @since 0.2.6
 * @package zhi
 */
import React from 'react';
import { Box, Text } from 'ink';
/** @brief Render options. @since 0.2.6 */
export interface RenderOptions {
  padding?: number;
  margin?: number;
  border?: boolean;
  borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'dot' | 'dash';
  color?: string;
  backgroundColor?: string;
  width?: number | string;
  height?: number | string;
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  gap?: number;
  overflow?: 'visible' | 'hidden';
  wrap?: 'wrap' | 'nowrap';
}

/** @brief Render context. @since 0.2.6 */
export interface RenderContext {
  width: number;
  height: number;
  focused: boolean;
  scrollOffset: number;
}

/** @brief Renderable component. @since 0.2.6 */
export interface Renderable {
  render(ctx: RenderContext): React.ReactNode;
}

/** @brief Renderer — manages layout and rendering. @since 0.2.6 */
export class Renderer {
  private width: number;
  private height: number;
  private focused: boolean;
  private scrollOffset: number;

  constructor() {
    this.width = 80;
    this.height = 24;
    this.focused = true;
    this.scrollOffset = 0;
  }

  /** @brief Set dimensions. @since 0.2.6 */
  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /** @brief Get context. @since 0.2.6 */
  getContext(): RenderContext {
    return {
      width: this.width,
      height: this.height,
      focused: this.focused,
      scrollOffset: this.scrollOffset,
    };
  }

  /** @brief Render a component. @since 0.2.6 */
  render(component: Renderable): React.ReactNode {
    return component.render(this.getContext());
  }

  /** @brief Scroll. @since 0.2.6 */
  scroll(delta: number): void {
    this.scrollOffset = Math.max(0, this.scrollOffset + delta);
  }
}

/** @brief Create a renderer. @since 0.2.6 */
export function createRenderer(): Renderer {
  return new Renderer();
}

/** @brief Render a box with options. @since 0.2.6 */
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

/** @brief Render text with style. @since 0.2.6 */
export function renderText(content: string, options: RenderOptions = {}): React.ReactNode {
  const { color, bold, italic, underline, strikethrough, dimColor } = options as any;
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

/** @brief Render a list. @since 0.2.6 */
export function renderList(items: string[], options: RenderOptions = {}): React.ReactNode {
  return React.createElement(
    Box,
    { flexDirection: 'column', overflow: 'hidden', ...(options as any) },
    items.map((item, i) => React.createElement(Text, { key: i }, `${i + 1}. ${item}`)),
  );
}

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

/** @brief Render a progress bar. @since 0.2.6 */
export function renderProgress(value: number, max = 100, width = 20): React.ReactNode {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return React.createElement(Text, { color: 'cyan' }, `[${bar}] ${value}/${max}`);
}

/** @brief Render a spinner. @since 0.2.6 */
export function renderSpinner(frame: number): React.ReactNode {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  return React.createElement(Text, { color: 'yellow' }, frames[frame % frames.length]);
}

/** @brief Render a badge. @since 0.2.6 */
export function renderBadge(text: string, color: string): React.ReactNode {
  return React.createElement(Text, { color: color as any, bold: true }, ` ${text} `);
}

/** @brief Render a divider. @since 0.2.6 */
export function renderDivider(char = '─', length?: number): React.ReactNode {
  return React.createElement(Text, { dimColor: true }, char.repeat(length ?? 40));
}

/** @brief Render key binding help. @since 0.2.6 */
export function renderHelp(bindings: Array<{ key: string; description: string }>): React.ReactNode {
  return React.createElement(
    Box,
    { flexDirection: 'column' },
    bindings.map((b, i) =>
      React.createElement(Text, { key: i, dimColor: true }, `${b.key.padEnd(10)} ${b.description}`),
    ),
  );
}

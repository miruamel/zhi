/**
 * @fileoverview Render types — options, context, and renderable interface.
 * @since 0.1.11
 * @updated 0.2.6 — extracted from render.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import React from 'react';

/** @brief Render options. @since 0.1.11 */
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
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dimColor?: string;
}

/** @brief Render context. @since 0.1.11 */
export interface RenderContext {
  width: number;
  height: number;
  focused: boolean;
  scrollOffset: number;
}

/** @brief Renderable component. @since 0.1.11 */
export interface Renderable {
  render(ctx: RenderContext): React.ReactNode;
}

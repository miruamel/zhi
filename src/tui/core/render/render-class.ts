/**
 * @fileoverview Renderer class — manages layout dimensions and render context.
 * @since 0.1.11
 * @updated 0.1.11 — extracted from render.tsx to enforce 150-SLOC guard
 * @package zhi
 */
import { RenderContext, Renderable } from './render-types';

/** @brief Renderer — manages layout and rendering. @since 0.1.11 */
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

  /** @brief Set dimensions. @since 0.1.11 */
  setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /** @brief Get context. @since 0.1.11 */
  getContext(): RenderContext {
    return {
      width: this.width,
      height: this.height,
      focused: this.focused,
      scrollOffset: this.scrollOffset,
    };
  }

  /** @brief Render a component. @since 0.1.11 */
  render(component: Renderable): React.ReactNode {
    return component.render(this.getContext());
  }

  /** @brief Scroll. @since 0.1.11 */
  scroll(delta: number): void {
    this.scrollOffset = Math.max(0, this.scrollOffset + delta);
  }
}

/** @brief Create a renderer. @since 0.1.11 */
export function createRenderer(): Renderer {
  return new Renderer();
}

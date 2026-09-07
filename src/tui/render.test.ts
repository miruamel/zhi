/**
 * @fileoverview TUI render tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import {
  renderText,
  renderList,
  renderProgress,
  renderSpinner,
  renderBadge,
  renderDivider,
} from './core/render';

describe('render', () => {
  it('renders text', () => {
    const el = renderText('hello');
    expect(el).toBeTruthy();
  });

  it('renders list', () => {
    const el = renderList(['a', 'b', 'c']);
    expect(el).toBeTruthy();
  });

  it('renders progress', () => {
    const el = renderProgress(50, 100, 20);
    expect(el).toBeTruthy();
  });

  it('renders spinner', () => {
    const el = renderSpinner(0);
    expect(el).toBeTruthy();
  });

  it('renders badge', () => {
    const el = renderBadge('OK', 'green');
    expect(el).toBeTruthy();
  });

  it('renders divider', () => {
    const el = renderDivider();
    expect(el).toBeTruthy();
  });
});

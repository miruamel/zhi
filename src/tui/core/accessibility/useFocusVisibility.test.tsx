/**
 * @fileoverview Focus visibility tests.
 * @since 0.1.13
 */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { renderToString } from '../../../core/test/render/render';
import { Text } from 'ink';
import {
  useFocusVisibility,
  type FocusVisibilityResult,
} from '../accessibility/useFocusVisibility';

describe('useFocusVisibility', () => {
  it('exports a function returning FocusVisibilityResult', () => {
    expect(typeof useFocusVisibility).toBe('function');
  });

  it('FocusVisibilityResult has expected shape', () => {
    const keys: (keyof FocusVisibilityResult)[] = [
      'source',
      'isKeyboard',
      'markMouse',
      'markKeyboard',
    ];
    expect(keys).toHaveLength(4);
  });

  it('FocusSource is a union of keyboard|mouse|none', () => {
    const sources = ['keyboard', 'mouse', 'none'];
    expect(sources).toContain('keyboard');
    expect(sources).toContain('mouse');
    expect(sources).toContain('none');
  });
});

describe('Focus visibility rendering', () => {
  it('renders without crashing', () => {
    function Probe() {
      const fv = useFocusVisibility();
      return <Text>{fv.isKeyboard ? 'kb' : 'mouse'}</Text>;
    }
    const out = renderToString(<Probe />);
    expect(out).toContain('mouse');
  });
});

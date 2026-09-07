/**
 * @fileoverview Status bar tests. @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../core/test/render';
import { StatusBar } from './status-bar';

describe('StatusBar', () => {
  it('renders with tokens and elapsed', () => {
    const out = renderToString(
      <StatusBar
        tokensUsed={1000}
        tokensBudget={10000}
        elapsedMs={5000}
        hints={['Ctrl+K palette']}
      />,
    );
    expect(out).toContain('tokens');
    expect(out).toContain('elapsed');
    expect(out).toContain('Ctrl+K');
  });

  it('shows warning color when tokens > 90%', () => {
    const out = renderToString(
      <StatusBar tokensUsed={9500} tokensBudget={10000} elapsedMs={1000} hints={[]} />,
    );
    expect(out).toContain('tokens');
  });

  it('shows git branch when provided', () => {
    const out = renderToString(
      <StatusBar tokensUsed={0} tokensBudget={1000} elapsedMs={0} gitBranch="main" hints={[]} />,
    );
    expect(out).toContain('main');
  });
});

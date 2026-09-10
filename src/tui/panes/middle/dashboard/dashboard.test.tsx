/**
 * @fileoverview DashboardPane tests. @since 0.1.11 @updated 0.1.13
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render/render';
import { DashboardPane } from './dashboard';

const dora = {
  deployFrequency: 3,
  leadTime: 12,
  changeFailureRate: 5,
  mttr: 8,
};

const baseProps = {
  dora,
  qualityScore: 85,
  testCoverage: 90,
  costTrend: 5,
  tokensUsed: 500,
  tokensBudget: 1000,
  stepsCompleted: 3,
  stepsTotal: 5,
};

describe('DashboardPane', () => {
  it('renders DORA, quality, and cost sections', () => {
    const f = renderToString(<DashboardPane {...baseProps} />);
    expect(f).toContain('_DASHBOARD');
    expect(f).toContain('DORA');
    expect(f).toContain('QUALITY');
    expect(f).toContain('COST');
  });

  it('renders progress gauge', () => {
    const f = renderToString(<DashboardPane {...baseProps} />);
    expect(f).toContain('progress');
    expect(f).toContain('60%');
  });

  it('renders token sparkline when data present', () => {
    const f = renderToString(
      <DashboardPane {...baseProps} tokenSparkline={[100, 200, 150, 300, 250]} />,
    );
    // Sparkline renders block chars from the ▁▂▃▄▅▆▇█ set
    expect(f).toMatch(/[▁▂▃▄▅▆▇█]/);
  });

  it('shows negative cost trend in green', () => {
    const f = renderToString(<DashboardPane {...baseProps} costTrend={-12} />);
    expect(f).toContain('-12%');
  });
});

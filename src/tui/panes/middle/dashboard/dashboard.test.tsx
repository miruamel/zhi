/**
 * @fileoverview DashboardPane tests. @since 0.2.5
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { DashboardPane } from './dashboard';

const dora = {
  deployFrequency: 3,
  leadTime: 12,
  changeFailureRate: 5,
  mttr: 8,
};

describe('DashboardPane', () => {
  it('renders DORA, quality, and cost sections', () => {
    const f = renderToString(
      <DashboardPane
        dora={dora}
        qualityScore={85}
        testCoverage={90}
        costTrend={5}
        tokensUsed={500}
        tokensBudget={1000}
        stepsCompleted={3}
        stepsTotal={5}
      />,
    );
    expect(f).toContain('_DASHBOARD');
    expect(f).toContain('DORA');
    expect(f).toContain('QUALITY');
    expect(f).toContain('COST');
  });

  it('renders progress gauge', () => {
    const f = renderToString(
      <DashboardPane
        dora={dora}
        qualityScore={85}
        testCoverage={90}
        costTrend={0}
        tokensUsed={500}
        tokensBudget={1000}
        stepsCompleted={3}
        stepsTotal={5}
      />,
    );
    expect(f).toContain('progress');
    expect(f).toContain('60%');
  });
});

/**
 * @fileoverview LoopPane tests. @since 0.2.2
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { LoopPane } from './loop';

describe('LoopPane', () => {
  it('shows running status when nothing else', () => {
    const f = renderToString(
      <LoopPane
        loop="INTAKE"
        paused={false}
        aborted={false}
        finished={false}
        partial={false}
        stepsCompleted={0}
        stepsTotal={5}
      />,
    );
    expect(f).toContain('RUNNING');
  });

  it('shows paused status when paused', () => {
    const f = renderToString(
      <LoopPane
        loop="INTAKE"
        paused={true}
        aborted={false}
        finished={false}
        partial={false}
        stepsCompleted={0}
        stepsTotal={5}
      />,
    );
    expect(f).toContain('PAUSED');
  });

  it('shows abort status when aborted', () => {
    const f = renderToString(
      <LoopPane
        loop="INTAKE"
        paused={false}
        aborted={true}
        finished={false}
        partial={false}
        stepsCompleted={0}
        stepsTotal={5}
      />,
    );
    expect(f).toContain('ABORTED');
  });

  it('shows finished status when finished', () => {
    const f = renderToString(
      <LoopPane
        loop="INTAKE"
        paused={false}
        aborted={false}
        finished={true}
        partial={false}
        stepsCompleted={5}
        stepsTotal={5}
      />,
    );
    expect(f).toContain('FINISHED');
  });

  it('renders loop name and progress', () => {
    const f = renderToString(
      <LoopPane
        loop="EXECUTE"
        paused={false}
        aborted={false}
        finished={false}
        partial={false}
        stepsCompleted={3}
        stepsTotal={10}
      />,
    );
    expect(f).toContain('EXECUTE');
    expect(f).toContain('3/10');
  });
});

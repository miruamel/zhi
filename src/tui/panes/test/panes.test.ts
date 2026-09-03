import { describe, it, expect } from 'bun:test';
import { render } from 'ink';
import type { ReactNode } from 'react';
import { Header } from '../top/header';
import { Dag } from '../top/dag';
import { Detail } from '../top/detail';
import { Critics } from '../middle/critics';
import { Eval } from '../middle/eval';
import { Pr } from '../middle/pr';
import { Log } from '../bottom/log';
import { Help } from '../bottom/help';
import type { DagStep, CriticLine, EvalReport, LogEntry, PrCiState } from '../../core/state';

/** @brief Render ink element to string by overriding stdout. */
function renderToString(el: ReactNode): string {
  const chunks: string[] = [];
  const stdout = {
    write: (chunk: string) => {
      chunks.push(chunk);
      return true;
    },
  };
  const inst = render(el as any, { stdout: stdout as any });
  inst.unmount();
  return chunks.join('');
}

describe('pane components', () => {
  describe('Header', () => {
    const baseProps = {
      loop: 'INTAKE',
      goal: 'test goal',
      startedAt: 1700000000000,
      finished: false,
      aborted: false,
    };

    it('shows RUNNING state', () => {
      const out = renderToString(Header(baseProps) as any);
      expect(out).toContain('RUNNING');
    });

    it('shows DONE state when finished', () => {
      const out = renderToString(Header({ ...baseProps, finished: true }) as any);
      expect(out).toContain('DONE');
    });

    it('shows ABORTED state when aborted', () => {
      const out = renderToString(Header({ ...baseProps, aborted: true }) as any);
      expect(out).toContain('ABORTED');
    });

    it('shows loop name', () => {
      const out = renderToString(Header({ ...baseProps, loop: 'GENERATE' }) as any);
      expect(out).toContain('GENERATE');
    });

    it('shows goal text', () => {
      const out = renderToString(Header(baseProps) as any);
      expect(out).toContain('test goal');
    });

    it('shows elapsed time', () => {
      const out = renderToString(Header(baseProps) as any);
      expect(out).toContain('elapsed');
    });
  });

  describe('Dag', () => {
    it('shows no-plan message when empty', () => {
      const out = renderToString(Dag({ steps: [], currentLoop: 'INTAKE' }) as any);
      expect(out).toContain('no plan yet');
    });

    it('shows step count when steps exist', () => {
      const steps: DagStep[] = [{ id: '1', kind: 'generate', status: 'done' }];
      const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
      expect(out).toContain('1 steps');
    });

    it('shows step IDs', () => {
      const steps: DagStep[] = [
        { id: 'alpha', kind: 'generate', status: 'done' },
        { id: 'beta', kind: 'verify', status: 'running' },
      ];
      const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
      expect(out).toContain('alpha');
      expect(out).toContain('beta');
    });

    it('shows step kinds', () => {
      const steps: DagStep[] = [
        { id: '1', kind: 'generate', status: 'done' },
        { id: '2', kind: 'critique', status: 'done' },
      ];
      const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
      expect(out).toContain('generate');
      expect(out).toContain('critique');
    });

    it('shows token usage for steps', () => {
      const steps: DagStep[] = [{ id: '1', kind: 'generate', status: 'done', tokensUsed: 1500 }];
      const out = renderToString(Dag({ steps, currentLoop: 'INTAKE' }) as any);
      expect(out).toContain('1500');
      expect(out).toContain('tok');
    });

    it('handles all step statuses', () => {
      const steps: DagStep[] = [
        { id: '1', kind: 'generate', status: 'pending' },
        { id: '2', kind: 'verify', status: 'running' },
        { id: '3', kind: 'critique', status: 'done' },
        { id: '4', kind: 'eval', status: 'failed' },
        { id: '5', kind: 'commit', status: 'skipped' },
      ];
      const out = renderToString(Dag({ steps, currentLoop: 'CRITIQUE' }) as any);
      expect(out).toContain('5 steps');
    });

    it('shows current step id', () => {
      const steps: DagStep[] = [
        { id: 'first', kind: 'generate', status: 'done' },
        { id: 'second', kind: 'verify', status: 'running' },
      ];
      const out = renderToString(
        Dag({ steps, currentLoop: 'VERIFY', currentStepId: 'second' }) as any,
      );
      expect(out).toContain('second');
    });
  });

  describe('Detail', () => {
    it('shows idle message when no step', () => {
      const out = renderToString(
        Detail({ loop: 'INTAKE', tokensUsed: 0, tokensBudget: 1000, recoverAttempts: 0 }) as any,
      );
      expect(out).toContain('idle');
    });

    it('shows step id and kind when step provided', () => {
      const step: DagStep = { id: 's1', kind: 'generate', status: 'running' };
      const out = renderToString(
        Detail({
          step,
          loop: 'GENERATE',
          tokensUsed: 250,
          tokensBudget: 1000,
          recoverAttempts: 0,
        }) as any,
      );
      expect(out).toContain('s1');
      expect(out).toContain('generate');
    });

    it('shows token budget when present', () => {
      const step: DagStep = { id: 's1', kind: 'generate', status: 'running', tokenBudget: 500 };
      const out = renderToString(
        Detail({
          step,
          loop: 'GENERATE',
          tokensUsed: 250,
          tokensBudget: 1000,
          recoverAttempts: 0,
        }) as any,
      );
      expect(out).toContain('500');
    });

    it('shows recover attempts count', () => {
      const out = renderToString(
        Detail({ loop: 'INTAKE', tokensUsed: 0, tokensBudget: 1000, recoverAttempts: 3 }) as any,
      );
      expect(out).toContain('recover');
      expect(out).toContain('3');
    });

    it('shows token usage ratio', () => {
      const out = renderToString(
        Detail({ loop: 'INTAKE', tokensUsed: 500, tokensBudget: 1000, recoverAttempts: 0 }) as any,
      );
      expect(out).toContain('500');
      expect(out).toContain('1.0k');
    });
  });

  describe('Critics', () => {
    it('handles empty critics', () => {
      const out = renderToString(Critics({ critics: [], weightedAvg: 0, threshold: 0.8 }) as any);
      expect(out).toContain('CRITICS');
    });

    it('shows critic names', () => {
      const critics: CriticLine[] = [
        { name: 'security', score: 0.9 },
        { name: 'perf', score: 0.5 },
      ];
      const out = renderToString(Critics({ critics, weightedAvg: 0.7, threshold: 0.8 }) as any);
      expect(out).toContain('security');
      expect(out).toContain('perf');
    });

    it('shows weighted average', () => {
      const critics: CriticLine[] = [{ name: 'security', score: 0.9 }];
      const out = renderToString(Critics({ critics, weightedAvg: 0.9, threshold: 0.8 }) as any);
      expect(out).toContain('0.90');
    });

    it('shows threshold', () => {
      const critics: CriticLine[] = [{ name: 'security', score: 0.9 }];
      const out = renderToString(Critics({ critics, weightedAvg: 0.9, threshold: 0.8 }) as any);
      expect(out).toContain('0.80');
    });

    it('handles abstain critics', () => {
      const critics: CriticLine[] = [
        { name: 'security', score: 0.9 },
        { name: 'perf', score: 0, abstain: true, reason: 'not applicable' },
      ];
      const out = renderToString(Critics({ critics, weightedAvg: 0.45, threshold: 0.8 }) as any);
      expect(out).toContain('perf');
    });
  });

  describe('Eval', () => {
    const passingReport: EvalReport = {
      build: { name: 'build', ok: true, detail: 'passed', durationMs: 100 },
      test: { name: 'test', ok: true, detail: '255 passed', durationMs: 500 },
      security: { name: 'security', ok: true, detail: 'clean', durationMs: 50 },
      gate: { name: 'gate', ok: true, detail: 'green', durationMs: 25 },
      gatePass: true,
      weightedAvg: 0.95,
    };

    it('shows EVAL header', () => {
      const out = renderToString(Eval({ evalReport: passingReport }) as any);
      expect(out).toContain('EVAL');
    });

    it('shows all stage names', () => {
      const out = renderToString(Eval({ evalReport: passingReport }) as any);
      expect(out).toContain('build');
      expect(out).toContain('test');
      expect(out).toContain('security');
      expect(out).toContain('gate');
    });

    it('shows PASS when all stages ok', () => {
      const out = renderToString(Eval({ evalReport: passingReport }) as any);
      expect(out).toContain('PASS');
    });

    it('shows FAIL when gate fails', () => {
      const failingReport: EvalReport = {
        ...passingReport,
        test: { name: 'test', ok: false, detail: '3 failed', durationMs: 500 },
        gate: { name: 'gate', ok: false, detail: 'lint failed', durationMs: 25 },
        gatePass: false,
        weightedAvg: 0.5,
      };
      const out = renderToString(Eval({ evalReport: failingReport }) as any);
      expect(out).toContain('FAIL');
    });

    it('shows coverage percentage', () => {
      const out = renderToString(Eval({ evalReport: passingReport }) as any);
      expect(out).toContain('95%');
    });

    it('shows stage durations', () => {
      const out = renderToString(Eval({ evalReport: passingReport }) as any);
      expect(out).toContain('500ms');
    });
  });

  describe('Pr', () => {
    it('shows no-PR message when not opened', () => {
      const prCi: PrCiState = { ciStatus: 'unknown' };
      const out = renderToString(Pr({ prCi }) as any);
      expect(out).toContain('not opened yet');
    });

    it('shows PR link when available', () => {
      const prCi: PrCiState = {
        prUrl: 'https://github.com/miruamel/zhi/pull/1',
        prNumber: 1,
        ciStatus: 'green',
      };
      const out = renderToString(Pr({ prCi }) as any);
      expect(out).toContain('https://github.com/miruamel/zhi/pull/1');
    });

    it('shows CI status green', () => {
      const prCi: PrCiState = { ciStatus: 'green' };
      const out = renderToString(Pr({ prCi }) as any);
      expect(out).toContain('CI green');
    });

    it('shows CI status red', () => {
      const prCi: PrCiState = { ciStatus: 'red' };
      const out = renderToString(Pr({ prCi }) as any);
      expect(out).toContain('CI red');
    });

    it('shows CI pending', () => {
      const prCi: PrCiState = { ciStatus: 'pending' };
      const out = renderToString(Pr({ prCi }) as any);
      expect(out).toContain('CI running');
    });

    it('shows CI duration when available', () => {
      const prCi: PrCiState = { ciStatus: 'green', ciDurationMs: 5000 };
      const out = renderToString(Pr({ prCi }) as any);
      expect(out).toContain('5.0s');
    });
  });

  describe('Log', () => {
    it('shows no-events message when empty', () => {
      const out = renderToString(Log({ log: [], expanded: false, maxLines: 8 }) as any);
      expect(out).toContain('no events yet');
    });

    it('shows entry count', () => {
      const entries: LogEntry[] = [{ ts: Date.now(), runId: 'r1', kind: 'info', msg: 'test' }];
      const out = renderToString(Log({ log: entries, expanded: false, maxLines: 8 }) as any);
      expect(out).toContain('1 entries');
    });

    it('shows log message', () => {
      const entries: LogEntry[] = [
        { ts: Date.now(), runId: 'r1', kind: 'info', msg: 'hello world' },
      ];
      const out = renderToString(Log({ log: entries, expanded: false, maxLines: 8 }) as any);
      expect(out).toContain('hello world');
    });

    it('shows log kind', () => {
      const entries: LogEntry[] = [{ ts: Date.now(), runId: 'r1', kind: 'error', msg: 'test' }];
      const out = renderToString(Log({ log: entries, expanded: false, maxLines: 8 }) as any);
      expect(out).toContain('error');
    });

    it('shows hidden count when more entries than maxLines', () => {
      const entries: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
        ts: Date.now() + i,
        runId: 'r1',
        kind: 'info' as const,
        msg: `entry ${i}`,
      }));
      const out = renderToString(Log({ log: entries, expanded: false, maxLines: 3 }) as any);
      expect(out).toContain('hidden');
    });

    it('shows all entries when expanded', () => {
      const entries: LogEntry[] = Array.from({ length: 5 }, (_, i) => ({
        ts: Date.now() + i,
        runId: 'r1',
        kind: 'info' as const,
        msg: `msg-${i}`,
      }));
      const out = renderToString(Log({ log: entries, expanded: true, maxLines: 100 }) as any);
      expect(out).toContain('msg-0');
      expect(out).toContain('msg-4');
    });
  });

  describe('Help', () => {
    it('shows compact help by default', () => {
      const out = renderToString(Help({}) as any);
      expect(out).toContain('keys');
      expect(out).toContain('uit');
    });

    it('shows keybindings in expanded mode', () => {
      const out = renderToString(Help({ showHelp: true }) as any);
      expect(out).toContain('KEYBINDINGS');
    });

    it('shows PAUSED when paused', () => {
      const out = renderToString(Help({ paused: true }) as any);
      expect(out).toContain('PAUSED');
    });

    it('shows PAUSED in expanded mode', () => {
      const out = renderToString(Help({ showHelp: true, paused: true }) as any);
      expect(out).toContain('PAUSED');
    });

    it('shows toggle keys in compact mode', () => {
      const out = renderToString(Help({}) as any);
      expect(out).toContain('l/c/p/h');
      expect(out).toContain('panels');
    });

    it('shows keybinding descriptions in expanded mode', () => {
      const out = renderToString(Help({ showHelp: true }) as any);
      expect(out).toContain('pause');
      expect(out).toContain('abort');
    });
  });
});

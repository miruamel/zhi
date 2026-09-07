/**
 * @fileoverview emptyState factory for TUI state. @since 0.1.2 @updated 0.2.0
 * @package zhi
 */
import type { AppState } from './appstate';

/** @brief Empty default state. @since 0.1.2 @updated 0.2.0 */
export function emptyState(goal: string, tokensBudget: number): AppState {
  return {
    loop: 'INTAKE',
    goal,
    steps: [],
    critics: [],
    eval: {
      build: { name: 'build', ok: false, detail: '', durationMs: 0 },
      test: { name: 'test', ok: false, detail: '', durationMs: 0 },
      security: { name: 'security', ok: false, detail: '', durationMs: 0 },
      gate: { name: 'gate', ok: false, detail: '', durationMs: 0 },
      gatePass: false,
      weightedAvg: 0,
    },
    prCi: { ciStatus: 'unknown' },
    log: [],
    metrics: { stages: 0, errors: 0, totalMs: 0, recoverAttempts: 0 },
    tokensUsed: 0,
    tokensBudget,
    costEstimate: 0,
    costBudget: 0,
    startedAt: Date.now(),
    finished: false,
    aborted: false,
    partial: false,
    files: [],
    terminalLines: [],
    networkRequests: [],
    networkOnline: true,
    agents: [],
    tokenSparkline: [],
    // 0.2.1 defaults
    sessions: [],
    memoryFacts: [],
    configEntries: [],
    runtimeLog: [],
  };
}

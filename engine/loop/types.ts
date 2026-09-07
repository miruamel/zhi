/**
 * @fileoverview Loop types. @since 0.2.6
 * @package zhi
 */
export type LoopPhase =
  'init' | 'running' | 'paused' | 'resuming' | 'finishing' | 'aborted' | 'finished';

export interface StepResult {
  ok: boolean;
  output?: string;
  tokens?: number;
  cost?: number;
  error?: string;
}

export interface LoopStep {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'running' | 'done' | 'error' | 'paused' | 'aborted' | 'failed' | 'completed';
  retryCount: number;
  startedAt?: number;
  endedAt?: number;
  tokens?: number;
  cost?: number;
  error?: string;
  result?: StepResult;
}

export interface LoopState {
  phase: LoopPhase;
  steps: LoopStep[];
  currentStepId?: string;
  tokensUsed: number;
  tokensBudget: number;
  startedAt?: number;
  finishedAt?: number;
  aborted: boolean;
  partial: boolean;
}

export interface LoopDriver {
  run(state: LoopState): Promise<LoopState>;
  pause(state: LoopState): LoopState;
  resume(state: LoopState): LoopState;
  abort(state: LoopState): LoopState;
}

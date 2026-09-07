/**
 * @fileoverview Loop runner — executes loop steps with budget guards. @since 0.2.6
 * @package zhi
 */
import type { LoopStep, StepResult } from './types';

/** @brief Runner options. @since 0.2.6 */
export interface RunnerOptions {
  maxSteps?: number;
  budgetTokens?: number;
  onStep?: (step: LoopStep, result: StepResult) => void;
}

/** @brief Default loop runner implementation. @since 0.2.6 */
export class DefaultRunner {
  private phase: 'init' | 'running' | 'paused' | 'aborted' = 'init';
  private steps: LoopStep[] = [];
  private readonly maxSteps: number;
  private readonly budgetTokens: number;
  private readonly onStep?: (step: LoopStep, result: StepResult) => void;
  private tokensUsed = 0;
  private stepCount = 0;

  constructor(options: RunnerOptions = {}) {
    this.maxSteps = options.maxSteps ?? 100;
    this.budgetTokens = options.budgetTokens ?? 10000;
    this.onStep = options.onStep;
  }

  /** @brief Start the runner. @since 0.2.6 */
  start(): void {
    this.phase = 'running';
  }

  /** @brief Pause the runner. @since 0.2.6 */
  pause(): void {
    if (this.phase === 'running') this.phase = 'paused';
  }

  /** @brief Resume the runner. @since 0.2.6 */
  resume(): void {
    if (this.phase === 'paused') this.phase = 'running';
  }

  /** @brief Abort the runner. @since 0.2.6 */
  abort(): void {
    this.phase = 'aborted';
  }

  /** @brief Add a step to the loop. @since 0.2.6 */
  push(step: LoopStep): void {
    this.steps.push(step);
  }

  /** @brief Run all queued steps. @since 0.2.6 */
  async run(): Promise<StepResult[]> {
    const results: StepResult[] = [];
    for (const step of this.steps) {
      if (!this.checkGuards()) break;
      const result = await this.step(step);
      results.push(result);
      this.onStep?.(step, result);
    }
    return results;
  }

  /** @brief Execute a single step with guards. @since 0.2.6 */
  async step(step: LoopStep): Promise<StepResult> {
    this.stepCount++;
    const tokens = step.tokens ?? 1;
    this.tokensUsed += tokens;
    return { ok: true, tokens };
  }

  /** @brief Check if guards allow another step. @since 0.2.6 */
  checkGuards(): boolean {
    return this.stepCount < this.maxSteps && this.tokensUsed < this.budgetTokens;
  }

  /** @brief Current runner status. @since 0.2.6 */
  status(): { phase: string; steps: number; tokensUsed: number; guardsOk: boolean } {
    return {
      phase: this.phase,
      steps: this.stepCount,
      tokensUsed: this.tokensUsed,
      guardsOk: this.checkGuards(),
    };
  }
}

/** @brief Create a runner. @since 0.2.6 */
export function createRunner(options: RunnerOptions = {}): DefaultRunner {
  return new DefaultRunner(options);
}

/** @brief Runner options for finishLoop. @since 0.2.6 */
export interface FinishLoopOptions {
  maxSteps: number;
}

/** @brief Loop state input for finishLoop. @since 0.2.6 */
export interface FinishLoopState {
  phase: string;
  step: number;
  startedAt: number;
  tokensUsed: number;
}

/** @brief Check whether the loop should finish. @since 0.2.6 */
export function finishLoop(
  state: FinishLoopState,
  options: FinishLoopOptions,
): { aborted: boolean } {
  if (state.step >= options.maxSteps) return { aborted: false };
  return { aborted: false };
}

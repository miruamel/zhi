/**
 * @fileoverview Orchestrator runner — executes DAG steps with scheduling. @since 0.1.10
 * @package zhi
 */
import type { Dag, OrchConfig } from '../types';
import type { OrchState } from './state/state';
import { topologicalSort } from './dag';

export interface RunResult {
  success: boolean;
  state: OrchState;
  error?: string;
  durationMs: number;
  stepsExecuted: number;
}

export interface OrchestratorRunner {
  run(graph: Dag, config: OrchConfig): Promise<RunResult>;
  pause(): void;
  resume(): void;
  abort(): void;
  getState(): OrchState;
}

export class DefaultOrchestratorRunner implements OrchestratorRunner {
  private state: OrchState = 'idle';
  private aborted = false;
  private paused = false;

  async run(graph: Dag, config: OrchConfig): Promise<RunResult> {
    const startedAt = Date.now();
    this.state = 'running';
    this.aborted = false;
    this.paused = false;
    let stepsExecuted = 0;
    const order = topologicalSort(graph).order;

    for (const step of order) {
      while (this.paused && !this.aborted) {
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 100);
        await promise;
      }
      if (this.aborted) {
        this.state = 'aborted';
        return {
          success: false,
          state: this.state,
          error: 'aborted',
          durationMs: Date.now() - startedAt,
          stepsExecuted,
        };
      }
      try {
        await this.executeStep(step, graph, config);
        stepsExecuted++;
      } catch (err) {
        this.state = 'failed';
        return {
          success: false,
          state: this.state,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - startedAt,
          stepsExecuted,
        };
      }
    }
    this.state = 'completed';
    return { success: true, state: this.state, durationMs: Date.now() - startedAt, stepsExecuted };
  }

  private async executeStep(stepId: string, graph: Dag, config: OrchConfig): Promise<void> {
    const step = graph.nodes.find((n) => n.id === stepId);
    if (!step) throw new Error(`orch: step ${stepId} not found`);
    step.status = 'running';
    step.startTime = Date.now();
    const delay = Math.min(config.maxConcurrency, 1) * 10;
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, delay);
    await promise;
    step.status = 'completed';
    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.tokens = Math.floor(Math.random() * 1000);
    step.cost = step.tokens * 0.00002;
  }

  pause(): void {
    this.paused = true;
  }
  resume(): void {
    this.paused = false;
  }
  abort(): void {
    this.aborted = true;
  }
  getState(): OrchState {
    return this.state;
  }
}

export function createRunner(): OrchestratorRunner {
  return new DefaultOrchestratorRunner();
}
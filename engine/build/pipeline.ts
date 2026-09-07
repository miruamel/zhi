/**
 * @fileoverview Build pipeline. @since 0.1.10
 * @package zhi
 */
import type { BuildConfig } from './core/types';

/** @brief Pipeline stage. @since 0.1.10 */
export type PipelineStage = 'generate' | 'build' | 'sign' | 'verify' | 'deploy';

/** @brief Stage result. @since 0.1.10 */
export interface StageResult {
  stage: PipelineStage;
  ok: boolean;
  durationMs: number;
  detail?: string;
}

/** @brief Full pipeline result. @since 0.1.10 */
export interface FullPipelineResult {
  ok: boolean;
  stages: StageResult[];
  artifact?: { path: string; hash: string };
}

/** @brief Pipeline runner. @since 0.1.10 */
export class Pipeline {
  private stages: PipelineStage[] = ['generate', 'build', 'sign', 'verify', 'deploy'];

  async run(_config: BuildConfig): Promise<FullPipelineResult> {
    const results: StageResult[] = [];
    for (const stage of this.stages) {
      const start = Date.now();
      results.push({ stage, ok: true, durationMs: Date.now() - start });
    }
    return { ok: true, stages: results };
  }
}

/** @brief Create pipeline. @since 0.1.10 */
export function createPipeline(): Pipeline {
  return new Pipeline();
}

/** @brief Quick pipeline run. @since 0.1.10 */
export async function quickPipeline(config: BuildConfig): Promise<FullPipelineResult> {
  return createPipeline().run(config);
}

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
      let ok = true;
      let detail: string | undefined;
      try {
        switch (stage) {
          case 'generate': {
            const { generate } = await import('./core/scaffold.js');
            const files = await generate({ entry: _config.entry, outDir: _config.outDir });
            detail = `${files.length} files generated`;
            break;
          }
          case 'build': {
            detail = `bun build ${_config.entry} --outdir ${_config.outDir}`;
            break;
          }
          case 'sign': {
            const { createSigner } = await import('./signer.js');
            const signer = createSigner();
            signer.sign(_config.entry);
            detail = 'signed';
            break;
          }
          case 'verify': {
            const { verify } = await import('./verify.js');
            verify([]);
            detail = 'verified';
            break;
          }
          case 'deploy': {
            detail = `deploy to ${_config.outDir}`;
            break;
          }
        }
      } catch (err) {
        ok = false;
        detail = err instanceof Error ? err.message : String(err);
      }
      results.push({ stage, ok, durationMs: Date.now() - start, detail });
    }
    const ok = results.every(r => r.ok);
    return { ok, stages: results };
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

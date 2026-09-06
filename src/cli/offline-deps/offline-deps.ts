/**
 * @brief Factory deps LoopDeps offline (tanpa MODEL_API_KEY, tanpa git/gh).
 * generate() tulis scaffold ke worktree bila ada. critique() pakai plant critics.
 * compress() fallback ke no-op bila budget tidak cukup.
 * @param {number} threshold - ambang Pareto (0..1).
 * @return {LoopDeps} deps siap pakai untuk buildHandlers.
 * @since 0.1.2
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { LoopDeps } from '@engine/loop/wiring/handlers';
import { buildDag } from '@engine/orch/dag';
import { parseGoal } from '@engine/orch/parse';
import { allocate, schedule } from '@engine/orch/schedule';
import { generate as scaffold } from '@engine/build/generate';
import { verify } from '@engine/build/verify';
import { compress } from '@engine/build/context/compress';
import { composeCritiques } from '@engine/critic/plant/compose';
import type { CruiserRunner } from '@engine/critic/plant/architecture/critic';
import { selectInvoker } from '@engine/model/invoker';
import { planSymbol } from '../plan-symbol/plan-symbol';

/** @brief Deps loop mode offline: LocalStubInvoker, no git, no gh.
 * @param {number} threshold - ambang Pareto (0..1).
 * @param {CruiserRunner} [architectureRunner] - injectable for tests; defaults to real dependency-cruiser.
 * @return {LoopDeps} deps siap pakai untuk buildHandlers.
 * @since 0.1.2
 */
export function offlineDeps(threshold: number, architectureRunner?: CruiserRunner): LoopDeps {
  return {
    ingest: (g) => g.trim(),
    plan: (g) => {
      const dag = buildDag(parseGoal(g));
      const alloc = allocate(dag, 1000);
      return schedule(dag, alloc)
        .map((s) => s.label)
        .join(' -> ');
    },
    generate: async (p, wt) => {
      const files = await scaffold({ domain: planSymbol(p) }, selectInvoker());
      const report = verify(files);
      if (wt) {
        for (const f of files) {
          const fp = join(wt, f.path);
          mkdirSync(dirname(fp), { recursive: true });
          writeFileSync(fp, f.content);
        }
      }
      const body = files.map((f) => `// ${f.path}\n${f.content}`).join('\n');
      const verdict = report.ok
        ? '// verify: ok'
        : `// verify: FAIL\n${report.violations.map((v) => `//   - ${v}`).join('\n')}`;
      return `${body}\n${verdict}`;
    },
    critique: (code) =>
      composeCritiques([{ path: 'generated.ts', content: code }], architectureRunner),
    compress: (code) =>
      compress({ entries: [{ key: 'code', weight: 1, text: code }], budget: 20000 }).entries[0]
        ?.text ?? '',
    paretoThreshold: threshold,
  };
}

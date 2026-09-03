/**
 * @brief Subcommand `critique:repo`: jalankan hygiene repo-wide pada repo root.
 * Resolve root via marker AGENTS.md/package.json (naik dari cwd), fallback ke cwd.
 * @return {Promise<LoopContext>} konteks minimal (goal='critique:repo').
 * @since 0.2.0
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { LoopContext } from '@engine/loop/wiring/context';
import { composeHygiene } from '@engine/critic/plant/compose';
import { aggregate } from '@engine/critic/aggregate';

/** @brief Resolve repo root dari cwd dengan marker AGENTS.md/package.json. @return {Promise<LoopContext>} */
export async function critiqueRepoCommand(): Promise<LoopContext> {
  let root = process.cwd();
  let dir = root;
  while (true) {
    if (existsSync(join(dir, 'AGENTS.md')) || existsSync(join(dir, 'package.json'))) {
      root = dir;
      break;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const critiques = composeHygiene(root);
  const res = aggregate(critiques, 0.7);
  console.log(
    JSON.stringify(
      {
        root,
        critiques: res.byCritic,
        score: res.score,
        passed: res.passed,
        findings: res.findings,
      },
      null,
      2,
    ),
  );
  return { goal: 'critique:repo' };
}

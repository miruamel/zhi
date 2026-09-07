/**
 * @brief Subcommand `critique:repo`: jalankan semua critic plant pada repo root.
 * Resolve root via marker AGENTS.md/package.json (naik dari cwd), fallback ke cwd.
 * @return {Promise<LoopContext>} konteks minimal (goal='critique:repo').
 * @since 0.1.2
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { LoopContext } from '../../../../engine/loop/wiring/context';
import { composeCritiques } from '../../../../engine/critic/plant/compose';
import { aggregate } from '../../../../engine/critic/aggregate';
import type { FileRecord } from '../../../../engine/critic/plant/sloc/critic';

/** @brief Entry dari `readdirSync({ withFileTypes: true })`. @since 0.1.2 */
interface DirentLike {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

/** @brief Walk directory tree, skip .git + node_modules + dist. @since 0.1.2 */
function walkDir(dir: string, onFile: (file: string, content: string) => void): void {
  let entries: DirentLike[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }) as unknown as DirentLike[];
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === 'dist') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      walkDir(p, onFile);
    } else if (e.isFile()) {
      try {
        onFile(p, readFileSync(p, 'utf8'));
      } catch {
        /* skip unreadable */
      }
    }
  }
}

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
  const files: FileRecord[] = [];
  walkDir(root, (file, content) => {
    files.push({ path: file, content });
  });
  const critiques = composeCritiques(files, { modules: [] });
  const res = aggregate(critiques, 0.7);
  console.log(
    JSON.stringify(
      {
        root,
        files: files.length,
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

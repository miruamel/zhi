#!/usr/bin/env bun
/** @brief Entry CLI Zhi: argv -> boot loop otonom. @since 0.1.0 */
import { LoopDriver } from '../engine/loop/driver';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseGoal } from '../engine/orch/parse';
import { buildDag } from '../engine/orch/dag';
import { allocate, schedule } from '../engine/orch/schedule';
import { generate as scaffold, generateStream } from '../engine/build/generate';
import { verify } from '../engine/build/verify';
import { compress } from '../engine/build/context/compress';
import { buildHandlers, type LoopDeps } from '../engine/loop/wiring/handlers';
import type { LoopContext } from '../engine/loop/wiring/context';
import { LoopMetrics } from '../engine/loop/observability/metrics';
import { LoopLogger } from '../engine/loop/observability/logger';
import { gitIsolate, gitCommit, ghPrOpen } from '../engine/loop/wiring/git';
import { evaluate } from '../engine/eval/index';
import { composeCritiques, composeHygiene } from '../engine/critic/plant/compose';
import { aggregate } from '../engine/critic/aggregate';
import { selectInvoker } from '../engine/model/invoker';
// ponytail: ISOLATE buat git worktree terpisah (security.md §Sandbox); generate
// tulis scaffold ke sana; commit/prOpen jalan di dalam worktree. EXECUTE nyata
// via engine/build scaffolder. CI_WATCH opsional: tanpa ciWatch -> green (offline).
// Mode autonom (buka PR + pantau CI) aktif bila ZHI_AUTO_PR=1.
/** @brief Derivasi identifier simbol dari plan (token pertama). @since 0.1.0 */
function planSymbol(plan: string): string {
  const head = plan.split(/[\s>]+/)[0] ?? '';
  const cleaned = head.replace(/[^a-zA-Z0-9_]/g, '');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : 'main';
}
function offlineDeps(threshold: number): LoopDeps {
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
      // ponytail: selectInvoker() -> CloudModelInvoker bila MODEL_API_KEY ada (backend nyata
      // OpenAI-compat), else LocalStubInvoker (no-secret). Seam di engine/model/invoker.
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
    critique: (code) => composeCritiques([{ path: 'generated.ts', content: code }]),
    compress: (code) =>
      compress({ entries: [{ key: 'code', weight: 1, text: code }], budget: 20000 }).entries[0]
        ?.text ?? '',
    paretoThreshold: threshold,
  };
}
/** @brief Deeps otonom (git/gh nyata) bila ZHI_AUTO_PR=1; else offline. @since 0.1.0 */
function autonomousDeps(base: LoopDeps, goal: string): LoopDeps {
  if (process.env.ZHI_AUTO_PR !== '1') return base;
  return {
    ...base,
    isolate: () => gitIsolate(goal),
    commit: (wt) => gitCommit(wt, 'chore: autoloop generated changes'),
    prOpen: (wt, t, b) => ghPrOpen(wt, t, b),
    eval: (wt) => evaluate(wt),
  };
}

/** @brief Parse argv: goal (arg non-flag) + --threshold=N. @since 0.1.0 */
export function parseArgs(argv: string[]): { goal: string; threshold: number } {
  const goal = argv.find((a) => !a.startsWith('--')) ?? '';
  const thr = argv.find((a) => a.startsWith('--threshold='));
  const parsed = thr ? Number(thr.split('=')[1]) : 0.8;
  return { goal, threshold: Number.isFinite(parsed) ? parsed : 0.8 };
}

/** @brief Jalankan satu siklus loop dari goal CLI.
 * @param {string[]} argv - argumen baris perintah.
 * @return {Promise<LoopContext>} konteks akhir loop (sampai DONE).
 * @since 0.1.0 */
export async function main(argv: string[]): Promise<LoopContext> {
  if (argv[0] === 'gen') return genCommand(argv.slice(1));
  if (argv[0] === 'critique:repo') return critiqueRepoCommand();
  const { goal, threshold } = parseArgs(argv);
  if (!goal) throw new Error('cli: goal kosong');
  const ctx: LoopContext = { goal };
  const metrics = new LoopMetrics();
  const logger = new LoopLogger();
  const driver = new LoopDriver({
    onTransition: (from, ev, to) => logger.transition(from, ev, to),
  });
  await driver.run(buildHandlers(ctx, autonomousDeps(offlineDeps(threshold), ctx.goal), metrics));
  const s = metrics.summary();
  console.log(`[metrics] stages=${s.stages} errors=${s.errors} totalMs=${s.totalMs.toFixed(1)}`);
  return ctx;
}
/** @brief Subcommand gen: scaffold domain langsung; --stream alirkan token (bila key).
 * @param {string[]} args - [domain] [--stream]
 * @return {Promise<LoopContext>} konteks minimal (goal=domain). @since 0.4.0 */
async function genCommand(args: string[]): Promise<LoopContext> {
  const domain = args.find((a) => !a.startsWith('--')) ?? '';
  if (!domain) throw new Error('cli: gen butuh <domain>');
  const stream = args.includes('--stream');
  const invoker = selectInvoker();
  if (stream) {
    for await (const tok of generateStream({ domain }, invoker)) process.stdout.write(tok);
    process.stdout.write('\n');
  } else {
    const files = await scaffold({ domain }, invoker);
    const report = verify(files);
    const body = files.map((f) => `// ${f.path}\n${f.content}`).join('\n');
    const verdict = report.ok
      ? '// verify: ok'
      : `// verify: FAIL\n${report.violations.map((v) => `//   - ${v}`).join('\n')}`;
    process.stdout.write(`${body}\n${verdict}\n`);
  }
  return { goal: domain };
}

/** @brief Subcommand critique:repo: jalankan hygiene repo-wide pada repo root.
 * @return {Promise<LoopContext>} konteks minimal (goal=critique:repo). @since 0.2.0 */
async function critiqueRepoCommand(): Promise<LoopContext> {
  // ponytail: resolve ke repo root via marker AGENTS.md/package.json agar tetap benar
  // bila dijalankan dari subdir (bukan sekadar process.cwd()). Fallback cwd bila tak ditemukan.
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

// ponytail: jalankan hanya bila dieksekusi langsung (bukan saat diimpor test).
if (import.meta.main) {
  main(process.argv.slice(2))
    .then((ctx) =>
      console.log(
        JSON.stringify(
          { goal: ctx.goal, plan: ctx.plan, code: ctx.code, score: ctx.aggregate?.score },
          null,
          2,
        ),
      ),
    )
    .catch((e) => {
      console.error(String(e));
      process.exit(1);
    });
}

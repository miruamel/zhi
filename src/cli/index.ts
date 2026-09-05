#!/usr/bin/env bun
/**
 * @brief Entry CLI Zhi: argv -> boot loop otonom.
 * TTY default → TUI (ink). Non-TTY → stdout ringkasan.
 * Mendispatch subcommand: `gen`, `critique:repo`, atau default (run loop).
 * Dijalankan langsung via `bun src/cli/index.ts <goal>` atau import main() untuk test.
 * @since 0.1.2
 */
import type { LoopContext } from '../../engine/loop/wiring/context';
import { genCommand } from './commands/gen/gen';
import { critiqueRepoCommand } from './commands/critique-repo/critique-repo';
import { loopCommand, loopCommandTui } from './commands/loop/loop';

/**
 * @brief Jalankan CLI argv: TTY default → TUI, non-TTY → stdout.
 * @param {string[]} argv
 * @param {object} [deps] Injected command handlers (test only).
 * @return {Promise<LoopContext>}
 */
export async function main(
  argv: string[],
  deps?: {
    gen?: (a: string[]) => Promise<LoopContext>;
    critique?: () => Promise<LoopContext>;
    loop?: (a: string[]) => Promise<LoopContext>;
    loopTui?: (a: string[]) => Promise<LoopContext>;
  },
): Promise<LoopContext> {
  const g = deps?.gen ?? genCommand;
  const c = deps?.critique ?? critiqueRepoCommand;
  const l = deps?.loop ?? loopCommand;
  const t = deps?.loopTui ?? loopCommandTui;
  if (argv[0] === 'gen') return g(argv.slice(1));
  if (argv[0] === 'critique:repo') return c();
  // ponytail: TTY detection — TUI only when stdout is a terminal.
  return process.stdout.isTTY ? t(argv) : l(argv);
}

// ponytail: jalankan hanya bila dieksekusi langsung (bukan saat diimpor test).
if (import.meta['main']) {
  main(process.argv.slice(2))
    .then((ctx) => {
      if (!process.stdout.isTTY) {
        console.log(
          JSON.stringify(
            { goal: ctx.goal, plan: ctx.plan, code: ctx.code, score: ctx.aggregate?.score },
            null,
            2,
          ),
        );
      }
    })
    .catch((e) => {
      console.error(String(e));
      process.exit(1);
    });
}

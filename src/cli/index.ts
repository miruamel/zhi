#!/usr/bin/env bun
/**
 * @brief Entry CLI Zhi: argv -> boot loop otonom. @since 0.1.0
 * Mendispatch subcommand: `gen`, `critique:repo`, atau default (run loop).
 * Dijalankan langsung via `bun src/cli/index.ts <goal>` atau import main() untuk test.
 */
import type { LoopContext } from '../../engine/loop/wiring/context';
import { genCommand } from './commands/gen';
import { critiqueRepoCommand } from './commands/critique-repo';
import { loopCommand } from './commands/loop';

/** @brief Jalankan CLI argv. @param {string[]} argv @return {Promise<LoopContext>} */
export async function main(argv: string[]): Promise<LoopContext> {
  if (argv[0] === 'gen') return genCommand(argv.slice(1));
  if (argv[0] === 'critique:repo') return critiqueRepoCommand();
  return loopCommand(argv);
}

// ponytail: jalankan hanya bila dieksekusi langsung (bukan saat diimpor test).
if (import.meta['main']) {
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

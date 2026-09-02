/**
 * @brief Subcommand `gen`: scaffold domain langsung; `--stream` alirkan token (bila API key).
 * @param {string[]} args - [domain] [--stream]
 * @return {Promise<LoopContext>} konteks minimal (goal=domain).
 * @throw {Error} bila domain kosong.
 * @since 0.4.0
 */
import type { LoopContext } from '../../../engine/loop/wiring/context';
import { generate as scaffold, generateStream } from '../../../engine/build/generate';
import { verify } from '../../../engine/build/verify';
import { selectInvoker } from '../../../engine/model/invoker';

/** @brief Jalankan gen subcommand. @param {string[]} args @return {Promise<LoopContext>} */
export async function genCommand(args: string[]): Promise<LoopContext> {
  const domain = args.find((a) => !a.startsWith('--')) ?? '';
  if (!domain) {
    throw new Error('cli: gen butuh <domain>');
  }
  const stream = args.includes('--stream');
  const invoker = selectInvoker();
  if (stream) {
    for await (const tok of generateStream({ domain }, invoker)) {
      process.stdout.write(tok);
    }
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

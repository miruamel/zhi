/**
 * @brief Test render helper — render ink elements to string for assertions.
 * @since 0.2.0
 */
import { render } from 'ink';
import type { ReactNode } from 'react';

/** @brief Render ink element to string, capture stdout via process.stdout.write override. */
export function renderToString(el: ReactNode): string {
  const chunks: string[] = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string) => {
    chunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return true;
  }) as any;
  try {
    // Fake stdin with isTTY=true so useInput's setRawMode doesn't throw
    const fakeStdin = {
      isTTY: true,
      setRawMode: () => {},
      on: () => {},
      removeListener: () => {},
      removeEventListener: () => {},
      emit: () => {},
      once: () => {},
      off: () => {},
      addListener: () => {},
      write: () => {},
      pause: () => {},
      resume: () => {},
      isPaused: () => false,
      pipe: () => ({}),
      unpipe: () => {},
      destroy: () => {},
      destroyed: false,
      readable: true,
      flow: () => {},
      read: () => null,
      setEncoding: () => {},
      wrap: () => ({}),
      getStdin: () => null,
      ref: () => {},
      unref: () => {},
    } as any;
    render(el as any, { stdin: fakeStdin, debug: true });
  } finally {
    process.stdout.write = originalWrite;
  }
  return chunks.join('');
}
/// <reference types="react" />

declare module 'react-test-renderer' {
  import type { ReactNode } from 'react';

  export interface TestRendererJSON {
    type?: string;
    children?: TestRendererJSON[] | string | null;
    props?: Record<string, unknown>;
  }

  export interface TestRenderer {
    toJSON(): TestRendererJSON | null;
    update(next: ReactNode): void;
    unmount(): void;
  }

  export function create(next: ReactNode): TestRenderer;
  export function create(next: ReactNode, options: unknown): TestRenderer;
}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'native/out', 'native/stream/.zig-cache', 'native/.zig-cache'],
    setupFiles: ['./tests/setup.ts'],
    teardownTimeout: 10000,
    testTimeout: 30000,
    hookTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
    isolate: true,
    maxConcurrency: 4,
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 85,
        branches: 70,
        statements: 80,
        autoUpdate: false,
      },
      exclude: [
        '**/node_modules/**',
        '**/native/out/**',
        '**/native/stream/.zig-cache/**',
        '**/native/.zig-cache/**',
        '**/tests/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@engine': new URL('./engine', import.meta.url).pathname,
      '@src': new URL('./src', import.meta.url).pathname,
      '@native': new URL('./native', import.meta.url).pathname,
    },
  },
});

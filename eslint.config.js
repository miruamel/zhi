import jsdoc from 'eslint-plugin-jsdoc';
import tsParser from '@typescript-eslint/parser';

/** @brief ESLint flat config untuk Zhi (Yan v2.0.0 adapted). @since 0.1.0 */
export default [
  {
    ignores: [
      'node_modules/**',
      'native/out/**',
      'native/.zig-cache/**',
      'native/stream/.zig-cache/**',
      '**/*.wasm',
      '**/*.wasm.o',
      'scripts/ci/architecture/metrics.ts',
      '.tsbuildinfo',
      'bun.lock',
      'coverage/**',
      'dist/**',
    ],
  },
  {
    files: ['src/**/*.ts', 'engine/**/*.ts', 'tests/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: false },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        Bun: 'readonly',
        WebAssembly: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
      },
    },
    plugins: { jsdoc: jsdoc.default ?? jsdoc },
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
          },
        },
      ],
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-description': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
];

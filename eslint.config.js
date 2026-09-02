import jsdoc from 'eslint-plugin-jsdoc';

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
    ],
  },
  {
    files: ['src/**/*.ts', 'engine/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
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
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
    },
  },
];
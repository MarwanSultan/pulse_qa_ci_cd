const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const prettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'playwright/.cache/**',
      'eslint.config.js',
      '.eslintrc.cjs',
    ],
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettier.rules,
      // The framework uses console sparingly in logging; keep it allowed.
      'no-console': 'off',
    },
  },
];


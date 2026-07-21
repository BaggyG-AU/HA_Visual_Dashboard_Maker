// ESLint 9 flat config.
//
// Migrated from .eslintrc.json + .eslintignore (ESLint 8, @typescript-eslint 5).
// This is a deliberate like-for-like port: the same extends, settings and
// overrides as before, so the only intended change is the config format and the
// toolchain version. Rule coverage is unchanged.
//
// Formatting is owned by Prettier, not ESLint — `eslint-config-prettier` is last
// in the chain to switch off every rule that would fight it.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Replaces .eslintignore, which ESLint 9 no longer reads.
  {
    ignores: [
      'node_modules/',
      'out/',
      'test-results/',
      '.vite/',
      'dist/',
      'coverage/',
      '**/*.snap',
      // The ESLint 8 script was `eslint --ext .ts,.tsx .`, so plain JS was never
      // linted. Kept identical here — widening the net is a separate decision,
      // not something to smuggle into a config migration.
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.electron,
  importPlugin.flatConfigs.typescript,
  reactHooks.configs['recommended-latest'],

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      'import/ignore': ['node_modules', 'allotment'],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
        },
      },
    },
    rules: {
      // @typescript-eslint 8 promotes both of these from 'warn' (their severity
      // under the v5 `recommended` set this project was on) to 'error'. Held at
      // 'warn' so the migration doesn't silently change what fails the build —
      // burning down the ~106 `any`s is its own piece of work, not this one.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      // Ban `<Input type="number">` (antd) — its onChange emits e.target.value,
      // which is ALWAYS a string, so HA numeric keys drift to quoted strings in
      // exported YAML (e.g. `line_width: '3'`). Use antd's <InputNumber>, which
      // parses to a real number. Phase 2 (PropertiesPanel type-drift class).
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "JSXOpeningElement[name.name='Input'] JSXAttribute[name.name='type'][value.value='number']",
          message:
            'Use <InputNumber> instead of <Input type="number">: antd Input emits string values, which drift HA numeric keys to quoted strings in exported YAML. See Phase 2.',
        },
      ],
    },
  },

  // Tests intentionally relax these two — carried over verbatim from the
  // `overrides` block in .eslintrc.json.
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
      // Playwright fixtures take a callback conventionally named `use`.
      // eslint-plugin-react-hooks 5 added React's `use` hook and misidentifies
      // those fixtures as components calling a hook. There is no React here.
      'react-hooks/rules-of-hooks': 'off',
    },
  },

  // Must stay last: turns off stylistic rules that conflict with Prettier.
  prettierConfig,
);

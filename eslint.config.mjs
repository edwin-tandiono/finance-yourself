import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX, createNodeResolver  } from 'eslint-plugin-import-x';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { ignores: ['**/node_modules/**', '**/.react-router/**'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  importX.flatConfigs.recommended,
  {
    settings: {
      'react': {
        version: 'detect',
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: './',
        }),
        createNodeResolver({
          project: './',
        }),
      ],
    },
  },
  {
    rules: {
      'comma-dangle': ['error', 'always-multiline'],
      quotes: ['error', 'single'],
      'semi': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-sort-props': ['error', {
        reservedFirst: ['key', 'ref'],
      }],
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true,
          },
          'groups': [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
        },
      ],
    },
  },
]);

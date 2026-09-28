/**
 * @file ESLint flat config: recommended rules everywhere; JSDoc and logging-facade rules on
 * shipped code (src/) and repo scripts (scripts/).
 */
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions } },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions, ...globals.node, ...globals.jest } },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ...jsdoc.configs['flat/recommended-error'],
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
  },
  {
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
    rules: {
      'jsdoc/require-file-overview': 'error',
      'jsdoc/require-description': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        { require: { FunctionDeclaration: true, MethodDefinition: true, ClassDeclaration: true } },
      ],
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
      'jsdoc/reject-function-type': 'off',
      'jsdoc/reject-any-type': 'off',
    },
  },
  {
    files: ['src/**/*.js'],
    ignores: ['src/lib/log.js'],
    rules: { 'no-console': 'error' },
  },
];

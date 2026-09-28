/**
 * @file ESLint flat config: recommended rules everywhere; JSDoc and logging-facade rules on
 * shipped code (src/) and repo scripts (scripts/).
 */
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

// Pre-refactor files, exempt from the JSDoc, no-console and no-unused-vars rules until they
// are rewritten. Each rewrite task removes its own entry; the list must end up empty.
const LEGACY_FILES = [];

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
    ignores: LEGACY_FILES,
  },
  {
    files: ['src/**/*.js', 'scripts/**/*.mjs'],
    ignores: LEGACY_FILES,
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
    ignores: [...LEGACY_FILES, 'src/lib/log.js'],
    rules: { 'no-console': 'error' },
  },
  ...(LEGACY_FILES.length > 0 ? [{ files: LEGACY_FILES, rules: { 'no-unused-vars': 'off' } }] : []),
];

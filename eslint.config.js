import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'docs/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{js,jsx}', 'e2e/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.jsx'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
    },
  },
]

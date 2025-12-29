// eslint.config.mjs (pure flat config, no compat)
import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  // Ignore build artifacts and tests
  globalIgnores(['dist/**', 'build/**', 'coverage/**', 'node_modules/**', 'test/**']),

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (non type-aware)
  ...tseslint.configs.recommended,

  // Project rules
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },

  // Run Prettier as a rule and disable conflicting ESLint stylistic rules
  prettierRecommended,
])
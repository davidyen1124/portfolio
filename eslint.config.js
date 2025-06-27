const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  { ignores: ['eslint.config.js'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        THREE: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['error', 'warn'] }]
    }
  }
]

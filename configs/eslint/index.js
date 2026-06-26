module.exports = {
  root: true,
  extends: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es2020: true,
    node: true,
  },
  rules: {
    'no-console': [ 'warn', { allow: [ 'warn', 'error' ] } ],
    'no-unused-vars': 'off',
    'prefer-const': 'warn',
    'no-var': 'warn',
  },
  overrides: [
    {
      files: [ '*.ts', '*.tsx' ],
      parser: '@typescript-eslint/parser',
      rules: {
        '@typescript-eslint/no-unused-vars': [ 'warn', { argsIgnorePattern: '^_' } ],
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
};

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
    'prettier',
    'prettier/vue',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  overrides: [
    {
      files: ['./config/**/*'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['./config/**/*'],
          },
        ],
      },
    },
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        vue: 'never',
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        alphabetize: { order: 'asc' },
        'newlines-between': 'always',
      },
    ],
  },

  settings: {
    'import/core-modules': ['electron', 'dotenv', 'electron-updater'],
    'import/resolver': {
      node: {},
      webpack: { config: './config/webpack.base.js' },
    },
  },
}

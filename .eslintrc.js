module.exports = {
  root: true,
  ignorePatterns: ['dist'],
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
    'prettier',
    'prettier/vue',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:prettier/recommended',
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
        vue: 'never',
      },
    ],
    'no-shadow': [
      'error',
      { builtinGlobals: false, hoist: 'functions', allow: ['state'] },
    ],
    'newline-after-var': ['error', 'always'],
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['state'] },
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
    'import/core-modules': ['dotenv', 'electron'],
    'import/resolver': {
      alias: {
        map: [
          ['@core', './src/core'],
          ['@components', './src/components'],
          ['@assets', './src/assets'],
        ],
        extensions: ['.js', '.vue'],
      },
    },
  },
}

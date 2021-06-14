const path = require('path')
// eslint-disable-next-line import/no-dynamic-require
const { cssModules, reset, positioning, display, flex } = require(path.resolve(
  __dirname,
  './idiomaticOrder',
))

module.exports = {
  // add your custom config here
  // https://stylelint.io/user-guide/configuration
  plugins: ['stylelint-order'],
  rules: {
    'declaration-no-important': true,
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['after-same-name', 'first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'order/order': [
      'at-variables',
      'dollar-variables',
      {
        type: 'at-rule',
        name: 'include',
        hasBlock: false,
      },
      'custom-properties',
      'declarations',
      'rules',
      {
        type: 'at-rule',
        name: 'include',
        hasBlock: true,
      },
    ],
    'order/properties-order': [
      [
        {
          groupName: 'cssModules',
          emptyLineBefore: 'always',
          properties: cssModules,
        },
        {
          groupName: 'reset',
          emptyLineBefore: 'always',
          properties: reset,
        },
        {
          groupName: 'positioning',
          emptyLineBefore: 'always',
          properties: positioning,
        },
        {
          groupName: 'display',
          emptyLineBefore: 'always',
          properties: display,
        },
        {
          groupName: 'flex',
          emptyLineBefore: 'always',
          properties: flex,
          order: 'flexible',
        },
      ],
      {
        unspecified: 'bottom',
        emptyLineBeforeUnspecified: 'always',
      },
    ],
  },
}

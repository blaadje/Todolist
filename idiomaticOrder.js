/* eslint-disable no-param-reassign */
const trbl = (prefix) => {
  const rules = []

  if (prefix) {
    rules.push(prefix)
    prefix += '-'
  } else {
    prefix = ''
  }

  return rules.concat([
    `${prefix}top`,
    `${prefix}right`,
    `${prefix}bottom`,
    `${prefix}left`,
  ])
}

const minMax = (suffix) => {
  return [suffix, `min-${suffix}`, `max-${suffix}`]
}

const border = (infix) => {
  if (infix) {
    infix = `-${infix}`
  } else {
    infix = ''
  }

  return [
    `border${infix}`,
    `border${infix}-width`,
    `border${infix}-style`,
    `border${infix}-color`,
    `border${infix}-radius`,
  ]
}

const cssModules = [].concat(['composes'])

const reset = ['all']

const positioning = [].concat(['position', 'z-index']).concat(trbl())

const display = []
  .concat(['display', 'overflow'])
  .concat(minMax('width'))
  .concat(minMax('height'))
  .concat(trbl('padding'))
  .concat(
    []
      .concat(border())
      .concat(border('top'))
      .concat(border('right'))
      .concat(border('bottom'))
      .concat(border('left')),
  )
  .concat(trbl('margin'))

const flex = [
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'align-content',
  'align-items',
  'align-self',
  'justify-content',
  'order',
]

module.exports = {
  cssModules,
  reset,
  positioning,
  display,
  flex,
}

import useTimeout from '@core/hooks/useTimeout'

import { LEFT, RIGHT } from './constants'

export const updateElementsStyle = (elements, style) => {
  const [previous, current, next] = elements

  Object.entries(style).forEach(([key, value]) => {
    // eslint-disable-next-line no-param-reassign
    previous.style[key] = value
    current.style[key] = value
    next.style[key] = value
  })
}

export const handleTransitions = async (elements, transitionDelay = 1000) => {
  const [transitionTimeoutDone, resetTransitionTimeout] = useTimeout(
    transitionDelay,
  )

  resetTransitionTimeout()

  updateElementsStyle(elements, {
    transition: `transform ${transitionDelay}ms ease-in-out`,
  })

  await transitionTimeoutDone()

  updateElementsStyle(elements, {
    transition: '',
  })
}

export const moveElements = (elements, position) => {
  updateElementsStyle(elements, {
    transform: `translateX(${position}px)`,
  })
}

export const slide = async (elements, offsetWidth, direction) => {
  if (!elements.length) {
    return
  }

  switch (direction) {
    case LEFT:
      moveElements(elements, 0)
      break
    case RIGHT:
      moveElements(elements, -offsetWidth * 2)
      break
    default:
      moveElements(elements, -offsetWidth)
  }

  await handleTransitions(elements, 500)

  Promise.resolve()
}

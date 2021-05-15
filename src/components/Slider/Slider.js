import {
  onMounted,
  ref,
  defineComponent,
  onUpdated,
  onBeforeUnmount,
} from 'vue'

import { useState } from '@core/hooks'

import { LEFT, RIGHT } from './constants'
import style from './style.module.scss'
import { slide, moveElements, updateElementsStyle } from './utils'

export default defineComponent({
  name: 'Slider', // @TODO: remove name when vue-devtools handles it automatically
  setup(props, { slots, emit }) {
    let offsetWidth = null
    let elementsPosition = null
    let oldDraggingPosition = 0
    let shouldMoveMouse = false
    let shouldMouseUp = false
    let isPressingSpace = false
    let isSliding = false

    const wrapperRef = ref(null)
    const elementsRef = ref(null)

    const [hasMouseEntered, setHasMouseEntered] = useState(false)

    const updateElementsPosition = (position) => {
      elementsPosition = position

      moveElements(elementsRef.value, position)
    }

    const handleMousemove = async (event) => {
      if (!shouldMoveMouse) {
        return
      }

      const movement = oldDraggingPosition - event.x
      const secondTime = event.timeStamp / 1000
      const velocity = Math.abs(movement / secondTime)
      const direction = oldDraggingPosition > event.x ? RIGHT : LEFT

      const velocityThreshold = 110

      if (velocity > velocityThreshold) {
        shouldMoveMouse = false
        shouldMouseUp = false
        await slide(elementsRef.value, offsetWidth, direction)
        emit(direction === LEFT ? 'decrement' : 'increment')
        return
      }

      const position = -offsetWidth - movement

      updateElementsPosition(position)
    }

    const handleMouseup = async (event) => {
      if (!shouldMouseUp) {
        return
      }

      const direction = oldDraggingPosition > event.x ? RIGHT : LEFT
      // @TODO: offset should change with window width
      const offset = 160
      const leftTrigger = 0 + offset
      const rightTrigger = offsetWidth - offset
      const shouldCancelSlide =
        (event.x < rightTrigger && event.x > leftTrigger) ||
        (event.x > rightTrigger && event.x < leftTrigger)

      shouldMoveMouse = false
      shouldMouseUp = false

      if (shouldCancelSlide) {
        slide(elementsRef.value, offsetWidth)
        return
      }

      await slide(elementsRef.value, offsetWidth, direction)

      emit(direction === LEFT ? 'decrement' : 'increment')
    }

    const handleMousedown = (event) => {
      oldDraggingPosition = event.x
      shouldMoveMouse = true
      shouldMouseUp = true

      wrapperRef.value.addEventListener('mousemove', handleMousemove)
    }

    const handleMouseleave = async () => {
      shouldMoveMouse = false
      shouldMouseUp = false

      await slide(elementsRef.value, offsetWidth)

      wrapperRef.value.removeEventListener('mousemove', handleMousemove)
      wrapperRef.value.removeEventListener('mousedown', handleMousedown)
      wrapperRef.value.removeEventListener('mouseup', handleMouseup)
    }

    const handleResize = () => {
      elementsPosition = -wrapperRef.value.offsetWidth
      offsetWidth = wrapperRef.value.offsetWidth

      updateElementsStyle(elementsRef.value, {
        width: `${offsetWidth}px`,
        transform: `translateX(${elementsPosition}px)`,
      })
    }

    const handleKeyDown = async (event) => {
      const spaceKeyCode = 32
      const leftArrowKeyCode = 37
      const rightArrowKeyCode = 39
      const moveLeft = event.keyCode === leftArrowKeyCode
      const moveRight = event.keyCode === rightArrowKeyCode

      if (
        ((isPressingSpace && moveLeft) || (isPressingSpace && moveRight)) &&
        !isSliding
      ) {
        const direction = moveLeft ? LEFT : RIGHT

        isSliding = true
        await slide(elementsRef.value, offsetWidth, direction)
        isSliding = false
        emit(direction === LEFT ? 'decrement' : 'increment')
      }

      if (event.keyCode !== spaceKeyCode || isPressingSpace) {
        return
      }

      isPressingSpace = true

      event.preventDefault()
      wrapperRef.value.style.cursor = 'grabbing'

      updateElementsStyle(elementsRef.value, {
        pointerEvents: 'none',
      })

      wrapperRef.value.addEventListener('mousedown', handleMousedown)
      wrapperRef.value.addEventListener('mouseup', handleMouseup)
    }

    const handleKeyUp = (event) => {
      if (event.keyCode !== 32) {
        return
      }

      isPressingSpace = false

      wrapperRef.value.style.cursor = 'initial'

      updateElementsStyle(elementsRef.value, {
        pointerEvents: 'initial',
      })

      wrapperRef.value.removeEventListener('mousedown', handleMousedown)
      wrapperRef.value.removeEventListener('mouseup', handleMouseup)
      wrapperRef.value.removeEventListener('mousemove', handleMousemove)
    }

    onUpdated(() => handleResize())

    onMounted(() => {
      elementsRef.value = wrapperRef.value.querySelectorAll('#element')

      wrapperRef.value.addEventListener('keydown', handleKeyDown)
      wrapperRef.value.addEventListener('keyup', handleKeyUp)
      handleResize()
      window.addEventListener('resize', handleResize)
      window.document.addEventListener('mouseleave', handleMouseleave)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      window.document.removeEventListener('mouseleave', handleMouseleave)
    })

    const handleMouseEntered = () => {
      if (hasMouseEntered.value) {
        return
      }

      setHasMouseEntered(true)
      wrapperRef.value.focus({ preventScroll: true })
    }

    const handleMouseLeave = (event) => {
      if (!event.relatedTarget || !event.toElement) {
        return
      }

      setHasMouseEntered(false)
    }

    return () => {
      if (slots.default().length !== 3) {
        throw new Error(
          'This component allows 3 children : previous, current, next',
        )
      }

      return (
        <div
          tabindex={1}
          class={style.wrapper}
          ref={wrapperRef}
          onMouseenter={handleMouseEntered}
          onMouseleave={handleMouseLeave}
        >
          {slots.default().map((element, index) => (
            <div key={index} id="element" class={style.element}>
              {element}
            </div>
          ))}
        </div>
      )
    }
  },
})

<template>
  <div :class="$style.wrapper" ref="wrapper">
    <slot />
  </div>
</template>

<script>
import { sleep } from '@core/utils'

const UPDATE_LEFT = 'update-left'
const UPDATE_RIGHT = 'update-right'
const UPDATE_CANCELLED = 'update-cancelled'
const ANIMATION_DURATION = 300
const INTERVAL_DELAY = 200
let transform = 0
let time = null
let time2 = null
let isAnimating = false
let newEvent = null
let oldDelta = null
let oldDraggingPosition = 0

export default {
  mounted() {
    if (this.$slots.default.length !== 3) {
      throw new error(
        'This component allows 3 children : previous, current, next',
      )
    }

    const [prevElement, , nextElement] = this.$slots.default

    prevElement.elm.style.height = '0px'
    nextElement.elm.style.height = '0px'

    this.$slots.default.map(element => {
      const { offsetWidth } = this.$refs.wrapper

      element.elm.style.width = `${offsetWidth}px`
      element.elm.style.flexShrink = '0'
      element.elm.style.transform = `translateX(-${offsetWidth}px)`
    })

    window.addEventListener('resize', this.handleResize)
    this.$refs.wrapper.addEventListener('mousewheel', this.detectSwipe)
    this.$refs.wrapper.addEventListener('swipe', this.updateElements)
    this.$refs.wrapper.addEventListener('mouseup', this.removeMouseMoveEvent)
    this.$refs.wrapper.addEventListener('mousedown', this.addMouseMoveEvent)
    this.$refs.wrapper.addEventListener('mouseleave', this.removeMouseMoveEvent)
  },
  methods: {
    removeMouseMoveEvent() {
      oldDraggingPosition = 0
      this.$refs.wrapper &&
        this.$refs.wrapper.removeEventListener('mousemove', this.updateElements)
    },
    addMouseMoveEvent(event) {
      const isClickOnDraggingHandler = event.path.some(item => {
        if (
          item.className &&
          item.className.baseVal &&
          item.className.baseVal
        ) {
          return item.className.baseVal.includes('handle')
        }
      })

      if (isClickOnDraggingHandler) {
        return
      }

      oldDraggingPosition = event.x
      this.$refs.wrapper.addEventListener('mousemove', this.updateElements)
    },
    detectSwipe() {
      const difference = event.deltaX - oldDelta
      const treshold = 3

      if (
        ((event.deltaX > 0 && difference > 0) ||
          (event.deltaX < 0 && difference < 0)) &&
        (event.deltaX < -treshold || event.deltaX > treshold)
      ) {
        newEvent = new event.constructor('swipe', event)

        this.$refs.wrapper.dispatchEvent(newEvent)
      }

      oldDelta = event.deltaX
    },
    updateElements(event) {
      const movement = event.deltaX * 2 || oldDraggingPosition - event.x

      if (isAnimating) {
        return
      }

      clearTimeout(time)
      clearTimeout(time2)

      const elements = this.$slots.default
      const wrapper = this.$refs.wrapper
      const { offsetWidth } = wrapper
      const wrapperMiddlePosition = this.getMiddlePosition(wrapper)
      const start = wrapper.getBoundingClientRect().left
      const end = wrapper.getBoundingClientRect().right
      const scrollingElementMiddlePosition = this.getMiddlePosition(
        elements[1].elm,
      )
      const state = this.getDirection(
        scrollingElementMiddlePosition,
        start,
        end,
      )
      const isRight = scrollingElementMiddlePosition < wrapperMiddlePosition

      transform += movement

      if (state === UPDATE_CANCELLED) {
        elements.map((element, index) => {
          element.elm.style.transform = `translateX(${-offsetWidth -
            transform}px)`
        })

        time = setTimeout(() => {
          this.translateElementToFuturePosition(
            state,
            elements,
            offsetWidth,
            wrapper,
          )
        }, INTERVAL_DELAY)
        return
      }

      isAnimating = true

      this.translateElementToFuturePosition(
        state,
        elements,
        offsetWidth,
        wrapper,
      )
      time2 = setTimeout(() => {
        isAnimating = false
      }, 500)
    },
    handleResize() {
      const { offsetWidth } = this.$refs.wrapper

      this.$slots.default.map(element => {
        element.elm.style.width = `${offsetWidth}px`
        element.elm.style.transform = `translateX(-${offsetWidth}px)`
      })
    },
    async translateElementToFuturePosition(
      state,
      elements,
      offsetWidth,
      wrapper,
    ) {
      elements.map(element => {
        element.elm.style.transition = `transform ${ANIMATION_DURATION}ms ease-in-out`

        switch (state) {
          case UPDATE_LEFT:
            element.elm.style.transform = `translateX(0)`
            break
          case UPDATE_RIGHT:
            element.elm.style.transform = `translateX(-${offsetWidth * 2}px)`
            break
          case UPDATE_CANCELLED:
            element.elm.style.transform = `translateX(-${offsetWidth}px)`
            break
          default:
        }
      })
      await sleep(ANIMATION_DURATION)

      transform = 0

      elements.map(element => {
        element.elm.style.transition = 'none'
        element.elm.style.transform = `translateX(-${offsetWidth}px)`
      })

      if (state === UPDATE_CANCELLED) {
        return
      }

      state === UPDATE_LEFT ? this.$emit('decrement') : this.$emit('increment')
    },
    getMiddlePosition(element) {
      const middleWidth = element.offsetWidth / 2
      const { left } = element.getBoundingClientRect()

      return left + middleWidth
    },
    getDirection(scrollingElementMiddlePosition, startPosition, endPosition) {
      if (scrollingElementMiddlePosition > endPosition) {
        return UPDATE_LEFT
      }

      if (scrollingElementMiddlePosition < startPosition) {
        return UPDATE_RIGHT
      }

      if (
        scrollingElementMiddlePosition > startPosition &&
        scrollingElementMiddlePosition < endPosition
      ) {
        return UPDATE_CANCELLED
      }
    },
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

<style lang="scss" module>
.wrapper {
  flex-grow: 1;
  display: flex;
  overflow: hidden;
  flex-wrap: nowrap;
  scroll-behavior: auto;
  user-select: none;
}
</style>
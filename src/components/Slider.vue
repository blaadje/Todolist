<script>
import { defineComponent } from 'vue'

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

export default defineComponent({
  render() {
    this.slots = this.$slots.default()

    return (
      <div ref="wrapper" class={this.$style.wrapper}>
        {this.slots}
      </div>
    )
  },
  mounted() {
    const elements = this.slots[0].children

    if (elements.length !== 3) {
      throw new Error(
        'This component allows 3 children : previous, current, next',
      )
    }

    const [prevElement, , nextElement] = elements

    prevElement.el.style.height = '0px'
    nextElement.el.style.height = '0px'

    elements.forEach((element) => {
      const { offsetWidth } = this.$refs.wrapper

      // eslint-disable-next-line no-param-reassign
      element.el.style.width = `${offsetWidth}px`
      // eslint-disable-next-line no-param-reassign
      element.el.style.flexShrink = '0'
      // eslint-disable-next-line no-param-reassign
      element.el.style.transform = `translateX(-${offsetWidth}px)`
    })

    window.addEventListener('resize', this.handleResize)
    this.$refs.wrapper.addEventListener('mousewheel', this.detectSwipe)
    this.$refs.wrapper.addEventListener('swipe', this.updateElements)
    this.$refs.wrapper.addEventListener('mouseup', this.removeMouseMoveEvent)
    this.$refs.wrapper.addEventListener('mousedown', this.addMouseMoveEvent)
    this.$refs.wrapper.addEventListener('mouseleave', this.removeMouseMoveEvent)
  },
  activated() {
    this.handleResize()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    removeMouseMoveEvent() {
      oldDraggingPosition = 0
      this.$refs.wrapper.removeEventListener('mousemove', this.updateElements)
    },
    addMouseMoveEvent(event) {
      const isClickOnDraggingHandler = event.path.some(
        (item) =>
          item.className &&
          item.className.baseVal &&
          item.className.baseVal &&
          item.className.baseVal.includes('handle'),
      )

      if (isClickOnDraggingHandler) {
        return
      }

      oldDraggingPosition = event.x
      this.$refs.wrapper.addEventListener('mousemove', this.updateElements)
    },
    detectSwipe(event) {
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

      const elements = this.slots[0].children
      const { wrapper } = this.$refs
      const { offsetWidth } = wrapper
      const start = wrapper.getBoundingClientRect().left
      const end = wrapper.getBoundingClientRect().right
      const scrollingElementMiddlePosition = this.getMiddlePosition(
        elements[1].el,
      )
      const state = this.getDirection(
        scrollingElementMiddlePosition,
        start,
        end,
      )

      transform += movement

      if (state === UPDATE_CANCELLED) {
        elements.forEach((element) => {
          // eslint-disable-next-line no-param-reassign
          element.el.style.transform = `translateX(${
            -offsetWidth - transform
          }px)`
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
      const elements = this.slots[0].children

      elements.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.el.style.width = `${offsetWidth}px`
        // eslint-disable-next-line no-param-reassign
        element.el.style.transform = `translateX(-${offsetWidth}px)`
      })
    },
    async translateElementToFuturePosition(state, elements, offsetWidth) {
      elements.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.el.style.transition = `transform ${ANIMATION_DURATION}ms ease-in-out`

        switch (state) {
          case UPDATE_LEFT:
            // eslint-disable-next-line no-param-reassign
            element.el.style.transform = `translateX(0)`
            break
          case UPDATE_RIGHT:
            // eslint-disable-next-line no-param-reassign
            element.el.style.transform = `translateX(-${offsetWidth * 2}px)`
            break
          case UPDATE_CANCELLED:
            // eslint-disable-next-line no-param-reassign
            element.el.style.transform = `translateX(-${offsetWidth}px)`
            break
          default:
        }
      })
      await sleep(ANIMATION_DURATION)

      transform = 0

      elements.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.el.style.transition = 'none'
        // eslint-disable-next-line no-param-reassign
        element.el.style.transform = `translateX(-${offsetWidth}px)`
      })

      if (state === UPDATE_CANCELLED) {
        return
      }

      this.$emit(state === UPDATE_LEFT ? 'decrement' : 'increment')
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

      return null
    },
  },
})
</script>

<style lang="scss" module>
.wrapper {
  flex-grow: 1;
  display: flex;
  overflow: hidden;
  flex-wrap: nowrap;
  scroll-behavior: auto;
  user-select: none;
  background: white;
}
</style>

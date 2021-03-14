<template>
  <div :class="$style.wrapper" :style="cssVar">
    <span
      ref="trigger"
      :class="$style.trigger"
      @mouseenter="show"
      @mouseleave="hide"
      @click="hide"
    >
      <slot name="trigger" />
    </span>

    <Transition
      :enter-active-class="$style['slide-enter-active']"
      :leave-active-class="$style['slide-leave-active']"
      :enter-class="$style['slide-enter']"
      :leave-to-class="$style['slide-leave-to']"
    >
      <span v-if="isVisible" :class="$style.content">
        <slot name="content" />
      </span>
    </Transition>
  </div>
</template>

<script>
let timeout = 0
const appearances = ['default', 'success']

export default {
  props: {
    appearance: {
      type: String,
      validator: appearance => appearances.includes(appearance),
      default: 'default',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isVisible: false,
    }
  },
  computed: {
    cssVar() {
      return {
        '--background-color': this.getBackgroundColorByAppearance(
          this.appearance,
        ),
      }
    },
  },
  methods: {
    getBackgroundColorByAppearance(appearance) {
      switch (appearance) {
        case 'success':
          return '53, 153, 68'
        default:
          return '0, 0, 0'
      }
    },
    async show() {
      if (this.disabled) {
        return
      }

      clearInterval(timeout)

      timeout = setTimeout(() => {
        this.isVisible = true
      }, 200)
    },
    hide() {
      clearInterval(timeout)

      this.isVisible = false
    },
  },
}
</script>

<style lang="scss" module>
$background-color: rgba(var(--background-color), 0.7);

.wrapper {
  position: relative;
  z-index: 99999;
}

.trigger {
  display: flex;
  height: 100%;
  width: 100%;
  z-index: 99999;
}

.content {
  font-size: 0.8rem;
  position: absolute;
  background: $background-color;
  border-radius: 0.2rem;
  z-index: 99999;
  color: white;
  padding: 0.3rem 0.6rem;
  font-weight: bold;
  top: calc(100% + 1rem);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
}

.content::before {
  left: 50%;
  transform: translateX(-50%);
  content: '';
  position: absolute;
  bottom: 100%;
  z-index: 99999;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent $background-color transparent;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
}
</style>

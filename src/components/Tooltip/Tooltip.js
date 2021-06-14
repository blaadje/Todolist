import { defineComponent, computed, toRefs, Transition } from 'vue'

import useState from '@core/hooks/useState'

import style from './style.module.scss'

let timeout = 0
const SUCCESS = 'success'
const DEFAULT = 'default'
const appearances = [DEFAULT, SUCCESS]

export default defineComponent({
  name: 'Tooltip', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    appearance: {
      type: String,
      validator: (appearance) => appearances.includes(appearance),
      default: 'default',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const { appearance, disabled } = toRefs(props)
    const [isVisible, setIsVisible] = useState(false)

    const cssVar = computed(() => {
      const getBackgroundColorByAppearance = () => {
        switch (appearance.value) {
          case SUCCESS:
            return '53, 153, 68'
          default:
            return '0, 0, 0'
        }
      }

      return {
        '--background-color': getBackgroundColorByAppearance(),
      }
    })

    const show = () => {
      if (disabled.value) {
        return
      }

      clearInterval(timeout)

      timeout = setTimeout(() => setIsVisible(true), 200)
    }
    const hide = () => {
      clearInterval(timeout)
      setIsVisible(false)
    }

    return () => (
      <div class={style.wrapper} style={cssVar.value}>
        <span
          ref="trigger"
          class={style.trigger}
          onMouseenter={show}
          onMouseleave={hide}
          onClick={hide}
        >
          {slots.trigger()}
        </span>

        <Transition
          enter-active-class={style['slide-enter-active']}
          leave-active-class={style['slide-leave-active']}
          enter-class={style['slide-enter']}
          leave-to-class={style['slide-leave-to']}
        >
          {isVisible.value && (
            <span class={style.content}>{slots.content()}</span>
          )}
        </Transition>
      </div>
    )
  },
})

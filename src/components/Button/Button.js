import { defineComponent, toRefs } from 'vue'

import style from './style.module.scss'

export default defineComponent({
  name: 'Button', // @TODO: remove name when vue-devtools handles it automatically
  inheritAttrs: false,
  props: {
    color: {
      type: Object,
      default: () => ({}),
    },
    filled: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const { filled, color, disabled } = toRefs(props)

    return () => (
      <button
        class={[style.wrapper, { [style.disabled]: disabled.value }]}
        style={{
          background: filled.value ? color.value : 'none',
          color: filled.value ? 'white' : color.value,
          border: filled.value ? '' : `1px solid ${color.value}`,
        }}
        disabled={disabled.value}
        {...attrs}
      >
        {slots.default()}
      </button>
    )
  },
})

<script>
import { defineComponent, toRefs, useCssModule } from 'vue'

export default defineComponent({
  inheritAttrs: false,
  props: {
    color: {
      type: String,
      default: 'white',
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
    const style = useCssModule()

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
</script>

<style lang="scss" module>
.wrapper {
  display: inline-block;
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: auto;
  outline: none;
}

.disabled {
  border: 1px solid #e7ebf3 !important;
  color: #9b9b9b !important;
  cursor: no-drop;
}
</style>

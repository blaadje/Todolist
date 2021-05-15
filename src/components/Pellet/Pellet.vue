<script>
import { defineComponent, toRefs, useCssModule } from 'vue'

export default defineComponent({
  props: {
    background: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const style = useCssModule()
    const { background } = toRefs(props)

    return () => (
      <span
        class={[style.tag, { [style.hasNoTag]: !background.value }]}
        style={{ background: background.value }}
      />
    )
  },
})
</script>

<style lang="scss" module>
.tag {
  cursor: pointer;
  height: 20px;
  width: 20px;
  margin: 0.3rem;
  border-radius: 0.2rem;
  display: block;
}

.hasNoTag {
  border: 1px solid #ededed;
  background: transparent;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: 180%;
    width: 1px;
    background: red;
    transform: rotate(45deg) translate(-50%, -50%);
    transform-origin: 0% 0%;
  }
}
</style>

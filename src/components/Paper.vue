<script>
import { defineComponent, useCssModule } from 'vue'

export default defineComponent({
  setup(props, { slots }) {
    const style = useCssModule()

    return () => <div class={style.wrapper}>{slots.default()}</div>
  },
})
</script>

<style lang="scss" module>
.wrapper {
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
  background: white;
  padding: 0.5rem;
  border-radius: 0.6rem;
}
</style>

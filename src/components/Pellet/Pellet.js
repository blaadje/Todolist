import { defineComponent, toRefs } from 'vue'

import style from './style.module.scss'

export default defineComponent({
  name: 'Pellet', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    background: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { background } = toRefs(props)

    return () => (
      <span
        class={[style.tag, { [style.hasNoTag]: !background.value }]}
        style={{ background: background.value }}
      />
    )
  },
})

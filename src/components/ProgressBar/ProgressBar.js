import { defineComponent, toRefs } from 'vue'

import style from './style.module.scss'

export default defineComponent({
  name: 'ProgressBar', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    width: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { width } = toRefs(props)

    return () => (
      <div
        class={[
          style.progressBar,
          style.stripes,
          style.animated,
          style.reverse,
          style.slower,
        ]}
      >
        <span style={{ width: width.value }} class={style.progressBarInner} />
      </div>
    )
  },
})

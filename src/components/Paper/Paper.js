import { defineComponent } from 'vue'

import style from './style.module.scss'

export default defineComponent({
  name: 'Paper', // @TODO: remove name when vue-devtools handles it automatically
  setup(props, { slots }) {
    return () => <div class={style.wrapper}>{slots.default()}</div>
  },
})

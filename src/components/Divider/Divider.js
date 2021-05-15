import { defineComponent } from 'vue'

import style from './style.module.scss'

export default defineComponent({
  name: 'DatePicker', // @TODO: remove name when vue-devtools handles it automatically
  setup(props, { slots }) {
    return () => (
      <div class={style.wrapper}>
        <div class={style.divider}></div>
        {slots.default && <label class={style.label}>{slots.default()}</label>}
      </div>
    )
  },
})

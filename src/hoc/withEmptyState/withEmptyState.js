import { toRefs } from 'vue'

import style from './style.module.scss'

export default (Component) => {
  return {
    props: {
      list: {
        type: Array,
        required: true,
      },
    },
    setup(props, { slots }) {
      const { list } = toRefs(props)

      return () =>
        !list.value.length ? (
          <span class={style.text}>There's no task</span>
        ) : (
          <Component {...props}>{slots}</Component>
        )
    },
  }
}

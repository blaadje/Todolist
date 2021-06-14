import { defineComponent, toRefs } from 'vue'

import CheckIcon from '@assets/check.svg'
import SortIcon from '@assets/sort.svg'
import Paper from '@components/Paper'
import useState from '@core/hooks/useState'
import { defineEvents } from '@core/utils'

import style from './style.module.scss'

export default defineComponent({
  name: 'SortSelector', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    activeSort: {
      type: Object,
      required: true,
    },
    sortBy: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents(['sortBy'])
    const { activeSort, sortBy } = toRefs(props)
    const [isVisible, setIsVisible] = useState(false)

    const isSelected = (sort) => sort === activeSort.value.label

    return () => (
      <div class={style.wrapper}>
        <div
          class={style.button}
          onClick={() => setIsVisible(!isVisible.value)}
        >
          <span class={style.label}>Sort by</span>
          <span class={style.activeLabel}>{activeSort.value.label}</span>
          <SortIcon class={style.sortIcon} />
        </div>
        {isVisible.value && (
          <Paper
            v-click-outside={() => setIsVisible(false)}
            class={style.content}
          >
            {sortBy.value.map((sort) => {
              const { label, value } = sort

              return (
                <div
                  key={value}
                  class={[
                    style.contentItem,
                    { [style.isSelected]: isSelected(label) },
                  ]}
                  onClick={() => emit(events.sortBy, sort)}
                >
                  {label}
                  {isSelected(label) && <CheckIcon class={style.checkIcon} />}
                </div>
              )
            })}
          </Paper>
        )}
      </div>
    )
  },
})

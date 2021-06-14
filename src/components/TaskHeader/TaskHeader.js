import { defineComponent, toRefs } from 'vue'

import AllCompletedIcon from '@assets/allcompleted.svg'
import TransferTodayIcon from '@assets/transferToday.svg'
import { defineEvents } from '@core/utils'

import SortSelector from './components/SortSelector'
import style from './style.module.scss'

export default defineComponent({
  name: 'TaskHeader', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    activeSort: {
      type: Object,
      required: true,
    },
    sortBy: {
      type: Array,
      required: true,
    },
    isToday: {
      type: Boolean,
      required: true,
    },
    areTasksAllDone: {
      type: Boolean,
      required: true,
    },
    hasRemainingTask: {
      type: Boolean,
      required: true,
    },
    hasDailyTasks: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const {
      activeSort,
      sortBy,
      isToday,
      areTasksAllDone,
      hasRemainingTask,
      hasDailyTasks,
    } = toRefs(props)
    const events = defineEvents([
      'toggleAllCompleted',
      'transferRemainingTasks',
      'sortBy',
    ])

    return () => {
      const shouldShowTransferToday = isToday.value && hasRemainingTask.value

      return (
        <div class={style.wrapper}>
          {hasDailyTasks.value && (
            <div
              class={[
                style.allCompletedWrapper,
                { [style.isSelected]: areTasksAllDone.value },
              ]}
              onClick={() => emit(events.toggleAllCompleted)}
            >
              <div class={style.allCompletedIconWrapper}>
                <AllCompletedIcon class={style.allCompletedIcon} />
              </div>
              <span class={style.allCompletedText}>Toggle all completed</span>
            </div>
          )}
          {shouldShowTransferToday && (
            <div
              class={style.transferRemainingWrapper}
              onClick={() => emit(events.transferRemainingTasks)}
            >
              <div class={style.transferTodayIconWrapper}>
                <TransferTodayIcon class={style.transferTodayIcon} />
              </div>
              <span class={style.allCompletedText}>
                Transfer remaining tasks
              </span>
            </div>
          )}
          <SortSelector
            class={style.sortSelector}
            active-sort={activeSort.value}
            sort-by={sortBy.value}
            onSortBy={(value) => emit(events.sortBy, value)}
          />
        </div>
      )
    }
  },
})

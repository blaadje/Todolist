<script>
import { defineComponent, toRefs, useCssModule } from 'vue'

import AllCompletedIcon from '@assets/allcompleted.svg'
import TransferTodayIcon from '@assets/transferToday.svg'

import SortSelector from './SortSelector'

export default defineComponent({
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
    hasTask: {
      type: Boolean,
      required: true,
    },
    hasRemainingTask: {
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
      hasTask,
      hasRemainingTask,
    } = toRefs(props)
    const style = useCssModule()

    return () => (
      <div class={style.wrapper}>
        {hasTask.value && (
          <div
            class={[
              style.allCompletedWrapper,
              { [style.isSelected]: areTasksAllDone.value },
            ]}
            onClick={() => emit('toggleAllCompleted')}
          >
            <div class={style.allCompletedIconWrapper}>
              <AllCompletedIcon class={style.allCompletedIcon} />
            </div>
            <span class={style.allCompletedText}>Toggle all completed</span>
          </div>
        )}
        {isToday.value && hasRemainingTask.value && (
          <div
            class={style.transferRemainingWrapper}
            onClick={() => emit('transferRemainingTasks')}
          >
            <div class={style.transferTodayIconWrapper}>
              <TransferTodayIcon class={style.transferTodayIcon} />
            </div>
            <span class={style.allCompletedText}>Transfer remaining tasks</span>
          </div>
        )}
        {hasTask.value && (
          <SortSelector
            class={style.sortSelector}
            active-sort={activeSort.value}
            sort-by={sortBy.value}
            onSortBy={(value) => emit('sortBy', value)}
          />
        )}
      </div>
    )
  },
})
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
  z-index: 1;
  position: relative;
  padding: 1.5rem;
}

.transferRemainingWrapper {
  display: flex;
  margin-left: 1.5rem;
  align-items: center;
  cursor: pointer;
}

.transferTodayIconWrapper,
.allCompletedIconWrapper {
  border: 1px solid #efefef;
  border-radius: 50%;
  position: relative;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
}

.transferTodayIcon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 18px;
  width: 18px;
  fill: #5dc2b1;
}

.allCompletedWrapper {
  display: flex;
  cursor: pointer;
  align-items: center;
  position: relative;

  &.isSelected {
    .allCompletedIconWrapper {
      background: #ededed;
    }
  }
}

.allCompletedIcon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 18px;
  width: 18px;
  stroke: #5dc2b1;
}

.allCompletedText {
  user-select: none;
  margin-left: 15px;
  font-weight: 100;
  color: grey;
}

.sortSelector {
  display: flex;
  align-items: center;
  margin-left: auto;
}
</style>

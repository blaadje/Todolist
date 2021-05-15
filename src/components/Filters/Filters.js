import { defineComponent, toRefs } from 'vue'

import {
  FILTER_TAG,
  FILTER_STATUS_TODO,
  FILTER_ALL,
  FILTER_STATUS_COMPLETED,
} from '@components/App/constants'
import useState from '@core/hooks/useState'
import { defineEvents } from '@core/utils'

import LeftArrowIcon from '../../assets/leftArrow.svg'
import Paper from '../Paper'
import TagList from '../TagList'

import style from './style.module.scss'

export default defineComponent({
  name: 'Filters', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    tags: {
      type: Array,
      required: true,
    },
    selectedTags: {
      type: Array,
      required: true,
    },
    color: {
      type: String,
      default: '',
    },
    remaining: {
      type: Number,
      required: true,
    },
    filter: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents(['filter'])
    const { tags, selectedTags, color, remaining, filter } = toRefs(props)
    const [isVisible, setIsVisible] = useState(false)

    const buttonsStatus = (element) => {
      if (filter.value === element) {
        return {
          border: `1px solid${color.value}`,
          color: color.value,
        }
      }

      return 'border: 1px solid #c2c2c2'
    }

    return () => (
      <Paper
        v-click-outside={() => setIsVisible(false)}
        class={[style.wrapper, { [style.isVisible]: isVisible.value }]}
      >
        <div
          class={[
            style.toggleVisibilityPanel,
            { [style.isVisible]: isVisible.value },
          ]}
          onClick={() => setIsVisible(!isVisible.value)}
        >
          <LeftArrowIcon class={style.leftArrowIcon} />
        </div>
        <div class={style.content}>
          <span class={style.remainingTasks}>
            {remaining.value} remaining tasks
          </span>
          <div class={style.filtersWrapper}>
            <div class={style.filters}>
              <TagList
                class={style.tagsWrapper}
                tags={tags.value}
                selected-tags={selectedTags.value}
                onSelectedTag={(tagId) =>
                  emit(events.filter, FILTER_TAG, tagId)
                }
              />
              <div class={style.statusWrapper}>
                <label class={style.statusTitle}>Status:</label>
                <button
                  class={style.filterButton}
                  style={buttonsStatus(FILTER_ALL)}
                  onClick={() => emit(events.filter, FILTER_ALL)}
                >
                  All
                </button>
                <button
                  class={style.filterButton}
                  style={buttonsStatus(FILTER_STATUS_TODO)}
                  onClick={() => emit(events.filter, FILTER_STATUS_TODO)}
                >
                  Todo
                </button>
                <button
                  class={style.filterButton}
                  style={buttonsStatus(FILTER_STATUS_COMPLETED)}
                  onClick={() => emit(events.filter, FILTER_STATUS_COMPLETED)}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    )
  },
})

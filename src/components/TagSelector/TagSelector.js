import { computed, defineComponent, toRefs } from 'vue'

import DownArrowIcon from '@assets/downArrow.svg'
import useState from '@core/hooks/useState'
import { defineEvents } from '@core/utils'

import Paper from '../Paper'
import Pellet from '../Pellet'
import TagList from '../TagList'

import style from './style.module.scss'

export default defineComponent({
  name: 'TagSelector', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents(['selectedTag'])
    const { tags } = toRefs(props)

    const [selectorIsVisible, setSelectorIsVisible] = useState(false)
    const [selectedTag, setSelectedTag] = useState(null)

    const handleSelectedTag = (tagId) => {
      setSelectedTag(tagId)
      emit(events.selectedTag, tagId)
    }

    const selectedTagColor = computed(() => {
      const tag = tags.value.find(({ id }) => id === selectedTag.value)

      return tag && tag.color
    })

    return () => (
      <div v-click-outside={() => setSelectorIsVisible(false)}>
        <div
          class={style.topWrapper}
          onClick={() => setSelectorIsVisible(!selectorIsVisible.value)}
        >
          <Pellet background={selectedTagColor.value} />
          <DownArrowIcon class={style.downArrowIcon} />
        </div>
        {selectorIsVisible.value && (
          <Paper class={style.content}>
            <TagList
              class={style.tagList}
              horizontal={false}
              tags={tags.value}
              onSelectedTag={handleSelectedTag}
            />
          </Paper>
        )}
      </div>
    )
  },
})

<script>
import { computed, defineComponent, toRefs, useCssModule } from 'vue'

import DownArrowIcon from '@assets/downArrow.svg'
import useState from '@core/hooks/useState'

import Paper from './Paper'
import Pellet from './Pellet'
import TagList from './TagList'

export default defineComponent({
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { tags } = toRefs(props)
    const style = useCssModule()
    const [selectorIsVisible, setSelectorIsVisible] = useState(false)
    const [selectedTag, setSelectedTag] = useState(null)

    const handleSelectedTag = (tagId) => {
      setSelectedTag(tagId)
      emit('selectedTag', tagId)
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
</script>

<style lang="scss" module>
.content {
  position: absolute;
  top: 100%;
  right: 0;
}

.topWrapper {
  display: flex;
  cursor: pointer;
  align-items: center;
}

.downArrowIcon {
  height: 15px;
  width: 15px;
  margin-left: 5px;
}

.tagList {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}
</style>

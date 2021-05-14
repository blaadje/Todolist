<script>
import { defineComponent, toRefs, useCssModule } from 'vue'

import Pellet from './Pellet'

export default defineComponent({
  props: {
    horizontal: {
      type: Boolean,
      default: true,
    },
    selectedTags: {
      type: Array,
      default: () => [],
    },
    tags: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { horizontal, selectedTags, tags } = toRefs(props)
    const style = useCssModule()

    return () => (
      <div class={[style.wrapper, { [style.vertical]: !horizontal.value }]}>
        <Pellet onClick={() => emit('selectedTag')} />
        {tags.value.map(({ id, color }) => {
          return (
            <Pellet
              key={id}
              class={{
                [style.selected]:
                  selectedTags.value && selectedTags.value.includes(id),
              }}
              background={color}
              onClick={() => emit('selectedTag', id)}
            />
          )
        })}
      </div>
    )
  },
})
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
}

.vertical {
  flex-direction: column;
}

.selected {
  transform: scale(1.3);
}
</style>

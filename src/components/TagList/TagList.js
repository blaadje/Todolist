import { defineComponent, toRefs } from 'vue'

import { defineEvents } from '@core/utils'

import Pellet from '../Pellet'

import style from './style.module.scss'

export default defineComponent({
  name: 'TagList', // @TODO: remove name when vue-devtools handles it automatically
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
    const events = defineEvents(['selectedTag'])
    const { horizontal, selectedTags, tags } = toRefs(props)

    return () => (
      <div class={[style.wrapper, { [style.vertical]: !horizontal.value }]}>
        <Pellet onClick={() => emit(events.selectedTag)} />
        {tags.value.map(({ id, color }) => {
          return (
            <Pellet
              key={id}
              class={{
                [style.selected]:
                  selectedTags.value && selectedTags.value.includes(id),
              }}
              background={color}
              onClick={() => emit(events.selectedTag, id)}
            />
          )
        })}
      </div>
    )
  },
})

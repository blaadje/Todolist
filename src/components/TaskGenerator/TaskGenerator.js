import { defineComponent, toRefs } from 'vue'

import useState from '@core/hooks/useState'
import { defineEvents } from '@core/utils'

import TagSelector from '../TagSelector'

import style from './style.module.scss'

export default defineComponent({
  name: 'TaskGenerator', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents(['createTask'])
    const [newTodoName, setNewTodoName] = useState('')
    const [selectedTagId, setSelectedTagId] = useState(null)
    const { tags } = toRefs(props)

    const handleSelectedTag = (tagId) => setSelectedTagId(tagId)

    const createTask = ({ keyCode }) => {
      if (!newTodoName.value || keyCode !== 13) {
        return
      }

      emit(events.createTask, newTodoName.value, selectedTagId.value)
      setNewTodoName('')
    }

    return () => (
      <div class={style.wrapper}>
        <input
          value={newTodoName.value}
          class={style.input}
          type="text"
          placeholder="Create a task"
          onChange={({ target }) => setNewTodoName(target.value)}
          onKeyup={createTask}
        />
        <TagSelector
          class={style.tagSelector}
          tags={tags.value}
          onSelectedTag={handleSelectedTag}
        />
      </div>
    )
  },
})

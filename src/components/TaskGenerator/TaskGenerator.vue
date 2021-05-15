<script>
import { defineComponent, toRefs, useCssModule } from 'vue'

import useState from '@core/hooks/useState'

import TagSelector from '../TagSelector'

export default defineComponent({
  props: {
    tags: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const [newTodoName, setNewTodoName] = useState('')
    const [selectedTag, setSelectedTag] = useState(null)
    const { tags } = toRefs(props)
    const style = useCssModule()

    const handleSelectedTag = (tagId) => setSelectedTag(tagId)

    const createTask = ({ keyCode }) => {
      if (!newTodoName.value || keyCode !== 13) {
        return
      }

      emit('createTask', newTodoName.value, selectedTag.value)
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
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
  position: relative;
  margin: 0 1rem 1rem 1rem;
  z-index: 2;
}

.input {
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
  background: rgba(white, 0.9);
  border-radius: 0.6rem;
  overflow: hidden;
  -webkit-app-region: no-drag;
  border: none;
  font-size: 1.5em;
  font-weight: 200;
  padding: 0.6em 0.8em;
  width: 100%;
  margin: 0;
  outline: none;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.06);
}

.tagSelector {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}
</style>

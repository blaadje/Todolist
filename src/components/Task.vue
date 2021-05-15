<script>
import { defineComponent, computed, toRefs, useCssModule } from 'vue'

import CompletedTaskIcon from '@assets/completedTask.svg'
import CrossIcon from '@assets/cross.svg'
import RunningTaskIcon from '@assets/runningTask.svg'
import useState from '@core/hooks/useState'
import { formatDate } from '@core/utils'

export default defineComponent({
  directives: {
    focus(element) {
      if (!element.value) {
        return
      }

      element.focus()
    },
  },
  props: {
    taskDateFormat: {
      type: Object,
      required: true,
    },
    task: {
      type: Object,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { taskDateFormat, task, tags } = toRefs(props)
    const [editingText, setEditingText] = useState(null)
    const style = useCssModule()

    const formattedTaskDate = computed(() =>
      formatDate(new Date(task.value.date), taskDateFormat.value),
    )
    const getTagColor = computed(() => {
      const tag = tags.value.find(({ id }) => id === task.value.tagId)

      return tag && tag.color
    })

    const handleEditTask = ({ keyCode }) => {
      if (!editingText.value || keyCode !== 13) {
        return
      }

      const newTask = {
        ...task.value,
        name: editingText.value,
      }

      emit('editTask', newTask)
      setEditingText(null)
    }

    return () => (
      <div
        class={[
          style.task,
          {
            [style.editingText]: editingText.value,
          },
        ]}
      >
        {editingText.value === null && (
          <div class={style.view}>
            <input
              id={`toggle-${task.value.id}`}
              type="checkbox"
              class={style.toggle}
              checked={task.value.completed}
              onClick={() => emit('setTaskCompleted', task.value.id)}
            />
            <label
              class={style.toggleIconsWrapper}
              for={`toggle-${task.value.id}`}
            >
              {task.value.completed && <CompletedTaskIcon class={style.icon} />}
              {!task.value.completed && <RunningTaskIcon class={style.icon} />}
            </label>
            <div
              class={style.textWrapper}
              onDblclick={() => setEditingText(task.value.name)}
            >
              <span class={style.date}>{formattedTaskDate.value}</span>
              <label
                class={[
                  style.label,
                  { [style.completed]: task.value.completed },
                ]}
              >
                {task.value.name}
              </label>
            </div>
            <span class={style.tag} style={{ background: getTagColor.value }} />
            <CrossIcon
              class={style.destroy}
              onClick={() => emit('deleteTask', task.value.id)}
            />
          </div>
        )}
        {editingText.value !== null && (
          <input
            value={editingText.value}
            onChange={({ target }) => setEditingText(target.value)}
            v-focus
            class={style.editingTextInput}
            type="text"
            onKeyup={handleEditTask}
            onBlur={() => setEditingText(null)}
          />
        )}
      </div>
    )
  },
})
</script>

<style lang="scss" module>
.task {
  position: relative;
  margin: 0;
  padding-left: 1rem;
  padding-right: 3rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  &:hover {
    .destroy {
      fill: #ededed;
    }
  }
}

.editingTextInput {
  outline: none;
  padding: 0.5em;
  width: 100%;
  color: #757575;
  border-radius: 0.2rem;
  border: 1px solid #ededed;
  font-weight: 100;
  font-size: 1.2em;
  display: block;
}

.toggle {
  display: none;
  -webkit-appearance: none;
}

.toggleIconsWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.textWrapper {
  margin-left: 1.3rem;
  display: flex;
  width: 100%;
  flex-direction: column;
}

.date {
  color: #c2c2c2;
  display: block;
  margin: 0.8rem 0;
}

.label {
  color: #757575;
  font-size: 1.2rem;
  font-weight: 100;
  line-height: 1.6rem;
  display: inline;
  position: relative;
}

.completed {
  color: #e4e4e4;
  text-decoration: line-through;
}

.tag {
  cursor: pointer;
  height: 20px;
  width: 20px;
  margin: 0.3rem;
  border-radius: 0.2rem;
  display: block;
  flex-shrink: 0;
}

.destroy {
  margin-left: 1rem;
  fill: white;
  background: transparent;
  height: 25px;
  width: 25px;
  cursor: pointer;
}

.icon {
  width: 30px;
  height: 30px;
}

.view {
  display: flex;
  align-items: center;
}

.editingText .view {
  display: none;
}
</style>

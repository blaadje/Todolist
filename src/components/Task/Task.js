import { defineComponent, computed, toRefs, ref, nextTick } from 'vue'

import CompletedTaskIcon from '@assets/completedTask.svg'
import CrossIcon from '@assets/cross.svg'
import RunningTaskIcon from '@assets/runningTask.svg'
import useState from '@core/hooks/useState'
import { defineEvents, formatDate } from '@core/utils'

import style from './style.module.scss'

export default defineComponent({
  name: 'Task', // @TODO: remove name when vue-devtools handles it automatically
  props: {
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
    const events = defineEvents(['updateTask', 'completed', 'deleteTask'])
    const { task, tags } = toRefs(props)
    const inputRef = ref(null)
    const [editingText, setEditingText] = useState(null)

    const formattedTaskDate = computed(() =>
      formatDate(new Date(task.value.date), {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
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

      emit(events.updateTask, newTask)
      setEditingText(null)
    }

    const handleDblClick = async () => {
      setEditingText(task.value.name)

      await nextTick()

      inputRef.value.focus()
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
              onClick={() =>
                emit(events.updateTask, {
                  ...task.value,
                  completed: !task.value.completed,
                })
              }
            />
            <label
              class={style.toggleIconsWrapper}
              for={`toggle-${task.value.id}`}
            >
              {task.value.completed && <CompletedTaskIcon class={style.icon} />}
              {!task.value.completed && <RunningTaskIcon class={style.icon} />}
            </label>
            <div class={style.textWrapper} onDblclick={handleDblClick}>
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
              onClick={() => emit(events.deleteTask, task.value.id)}
            />
          </div>
        )}
        {editingText.value !== null && (
          <input
            ref={inputRef}
            value={editingText.value}
            onChange={({ target }) => setEditingText(target.value)}
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

import { computed, toRefs } from 'vue'

import Divider from '@components/Divider'
import DraggableList from '@components/DraggableList'
import Task from '@components/Task'
import { defineEvents } from '@core/utils'
import withEmptyState from '@hoc/withEmptyState'

import style from './style.module.scss'

export default {
  name: 'TasksWrapper', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    tasks: {
      type: Array,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    shouldDisableDraggableList: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents(['orderedTasks', 'deleteTask', 'updateTask'])

    const { tasks, tags, shouldDisableDraggableList } = toRefs(props)

    const DraggableListWithEmptyState = withEmptyState(DraggableList)

    const completedTasks = computed(() => {
      return tasks.value.filter(({ completed }) => completed)
    })
    const unCompletedTasks = computed(() => {
      return tasks.value.filter(({ completed }) => !completed)
    })

    return () => (
      <div>
        <DraggableListWithEmptyState
          list={unCompletedTasks.value}
          disabled={shouldDisableDraggableList.value}
          onOrderedElements={(updatedTasks) =>
            emit(events.orderedTasks, updatedTasks)
          }
        >
          {({ element }) => (
            <Task
              class={style.task}
              task={element}
              tags={tags.value}
              onUpdateTask={(newTask) => emit(events.updateTask, newTask)}
              onDeleteTask={(taskId) => emit(events.deleteTask, taskId)}
            />
          )}
        </DraggableListWithEmptyState>
        {completedTasks.value.length > 0 && (
          <div>
            <Divider>Done</Divider>
            {completedTasks.value.map((task) => (
              <Task
                class={style.task}
                task={task}
                tags={tags.value}
                onUpdateTask={(newTask) => emit(events.updateTask, newTask)}
                onDeleteTask={(taskId) => emit(events.deleteTask, taskId)}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
}

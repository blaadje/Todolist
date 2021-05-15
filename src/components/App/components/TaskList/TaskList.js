import { defineAsyncComponent, toRefs } from 'vue'

import Slider from '@components/Slider'
import { defineEvents } from '@core/utils'

import TasksWrapper from './components/TasksWrapper'
import style from './style.module.scss'

export default {
  name: 'TaskList', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    tasksWithOffset: {
      type: Array,
      required: true,
    },
    tags: {
      type: Object,
      required: true,
    },
    shouldDisableDraggableList: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents([
      'incrementDay',
      'decrementDay',
      'orderedTasks',
      'deleteTask',
      'updateTask',
    ])
    const { tasksWithOffset, tags, shouldDisableDraggableList } = toRefs(props)

    return () => {
      const [previousTasks, currentTasks, nextTasks] = tasksWithOffset.value

      const AsyncTasksWrapper = defineAsyncComponent(() =>
        import('./components/TasksWrapper'),
      )

      return (
        <div>
          <Slider
            class={style.slider}
            onIncrement={() => emit(events.incrementDay)}
            onDecrement={() => emit(events.decrementDay)}
          >
            <AsyncTasksWrapper tasks={previousTasks} tags={tags.value} />
            <TasksWrapper
              shouldDisableDraggableList={shouldDisableDraggableList.value}
              tasks={currentTasks}
              tags={tags.value}
              onOrderedTasks={(updatedTasks) =>
                emit(events.orderedTasks, updatedTasks)
              }
              onDeleteTask={(taskId) => emit(events.deleteTask, taskId)}
              onUpdateTask={(newTask) => emit(events.updateTask, newTask)}
            />
            <AsyncTasksWrapper tasks={nextTasks} tags={tags.value} />
          </Slider>
        </div>
      )
    }
  },
}

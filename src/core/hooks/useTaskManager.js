import { computed } from 'vue'

import {
  FILTER_TAG,
  FILTER_STATUS_TODO,
  FILTER_STATUS_COMPLETED,
} from '@components/App/constants'
import Task from '@core/models/Task'
import TaskedDay from '@core/models/TaskedDay'
import {
  decrementDay,
  incrementDay,
  formatDate,
  areDatesEqual,
  isBeforeToday,
} from '@core/utils'

export default (selectedDate) => {
  const currentTasks = computed(() => {
    return Task.tasksByDate(selectedDate.value)
  })

  const hasCurrentTasks = computed(() => {
    return currentTasks.value.exists()
  })

  const areTaskedDayCompleted = computed(() => {
    return TaskedDay.hasAllTasksCompleted(selectedDate.value)
  })

  const hasRemainingTask = computed(() =>
    Task.query()
      .where(({ date, completed }) => isBeforeToday(date) && !completed)
      .exists(),
  )

  const getTasksWithOffsetFromDate = (filter, selectedTags, activeSort) => {
    const sort = Array.isArray(activeSort) ? activeSort : [activeSort]

    const filterTasks = (task) => {
      switch (filter) {
        case FILTER_TAG:
          return selectedTags.includes(task.tagId)
        case FILTER_STATUS_TODO:
          return !task.completed
        case FILTER_STATUS_COMPLETED:
          return task.completed
        default:
          return true
      }
    }

    return [
      TaskedDay.getTasksByDate(decrementDay(selectedDate.value)),
      TaskedDay.getTasksByDate(selectedDate.value, sort, filterTasks),
      TaskedDay.getTasksByDate(incrementDay(selectedDate.value)),
    ]
  }

  // @TODO: refactor this part to use taskedDays
  const tasksStatusByDays = (previewDate) =>
    Task.query()
      .where(
        'date',
        (date) =>
          new Date(date).getMonth() === new Date(previewDate).getMonth(),
      )
      .get()
      .reduce((acc, { date, completed }) => {
        return Object.keys(acc).some((item) => item === date)
          ? acc
          : {
              ...acc,
              [formatDate(new Date(date))]: { completed },
            }
      }, {})

  const addTask = async (name, tagId, date) => {
    const taskedDayId = await TaskedDay.findOrCreateByDate(date)

    Task.insert({
      data: {
        name,
        tagId,
        date: date.toISOString(),
        taskedDayId,
      },
    })
  }

  const updateTask = (newTask) => {
    Task.update({
      where: newTask.id,
      data: newTask,
    })
  }

  const deleteTask = (id) => Task.delete(id)

  const updateTasks = (tasks) =>
    Task.update({
      data: tasks,
    })

  const toggleAllCurrentTasksCompleted = () => {
    Task.update({
      where: ({ date }) => {
        return areDatesEqual(new Date(date), new Date(selectedDate.value))
      },
      data: {
        completed: !areTaskedDayCompleted.value,
      },
    })
  }

  const setRemainingTasksToCurrentDay = async () => {
    let oldTaskedDayId = null
    const newTaskedDayId = await TaskedDay.findOrCreateByDate(
      selectedDate.value,
    )

    Task.update({
      where: ({ date, completed }) => isBeforeToday(date) && !completed,
      data: (task) => {
        if (!oldTaskedDayId) {
          oldTaskedDayId = task.taskedDayId
        }

        // eslint-disable-next-line no-param-reassign
        task.taskedDayId = newTaskedDayId
        // eslint-disable-next-line no-param-reassign
        task.date = new Date().toISOString()
      },
    })

    const oldTaskedDayHasTasks = TaskedDay.query()
      .whereId(oldTaskedDayId)
      .with('tasks')
      .first().tasks.length

    if (oldTaskedDayHasTasks) {
      return
    }

    TaskedDay.delete(oldTaskedDayId)
  }

  return {
    getTasksWithOffsetFromDate,
    updateTasks,
    hasRemainingTask,
    addTask,
    deleteTask,
    tasksStatusByDays,
    updateTask,
    toggleAllCurrentTasksCompleted,
    setRemainingTasksToCurrentDay,
    areTaskedDayCompleted,
    hasCurrentTasks,
  }
}

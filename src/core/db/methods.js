import { getTimeStampFromDate, areDatesEqual } from '../utils'

import db from './datastore'

const getColor = () => db.getState().color

const addColor = (color) => db.set('color', color).write()

const getTasks = () => db.getState().todos

const getUserId = () => db.getState().userId

const setUserId = (userId) => db.set('userId', userId).write()

const setRemainingTasksToday = () =>
  db
    .get('todos')
    .filter(
      ({ completed, date }) =>
        getTimeStampFromDate(new Date(date)) <
          getTimeStampFromDate(new Date()) && !completed,
    )
    .each((task) => {
      // eslint-disable-next-line no-param-reassign
      task.date = new Date()
    })
    .write()

const toggleTaskCompleted = (id) => {
  const task = db.get('todos').find({ id }).value()

  return db
    .get('todos')
    .find({ id })
    .assign({ ...task, completed: !task.completed })
    .write()
}

const addTask = (task) => db.get('todos').push(task).write()

const deleteTask = (taskId) => db.get('todos').remove({ id: taskId }).write()

const editTask = (editedTask) => {
  db.get('todos').find({ id: editedTask.id }).assign(editedTask).write()
}

const editTasks = (editedTasks) => {
  db.get('todos')
    .each((task) => {
      const editedTask = editedTasks.find(({ id }) => id === task.id) || false

      if (!editedTask) {
        return
      }

      Object.keys(editedTask).forEach((key) => {
        // eslint-disable-next-line no-param-reassign
        task[key] = editedTask[key]
      })
    })
    .write()
}

const toggleAllTaskCompleted = (selectedDate, allDone) => {
  if (!selectedDate) {
    db.get('todos')
      .each((task) => {
        // eslint-disable-next-line no-param-reassign
        task.completed = allDone
      })
      .write()
    return
  }

  db.get('todos')
    .filter(({ date }) => areDatesEqual(new Date(date), selectedDate))
    .each((todo) => {
      // eslint-disable-next-line no-param-reassign
      todo.completed = allDone
    })
    .write()
}

export {
  getColor,
  getUserId,
  setUserId,
  addColor,
  getTasks,
  addTask,
  editTask,
  editTasks,
  deleteTask,
  toggleTaskCompleted,
  toggleAllTaskCompleted,
  setRemainingTasksToday,
}

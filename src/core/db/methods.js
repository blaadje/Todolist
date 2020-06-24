import moment from 'moment'
import db from './datastore'

const getColor = () => db.getState().color

const addColor = color => db.set('color', color).write()

const getTasks = () => db.getState().todos

const getUserId = () => db.getState().userId

const setUserId = userId => db.set('userId', userId).write()

const setRemainingTasksToday = () =>
  db
    .get('todos')
    .filter(
      ({ completed, date }) =>
        moment(date).unix() < moment().unix() && !completed,
    )
    .each(task => {
      task.date = moment()
    })
    .write()

const toggleTaskCompleted = id => {
  const task = db
    .get('todos')
    .find({ id })
    .value()

  return db
    .get('todos')
    .find({ id })
    .assign({ ...task, completed: !task.completed })
    .write()
}

const addTask = task =>
  db
    .get('todos')
    .push(task)
    .write()

const deleteTask = taskId =>
  db
    .get('todos')
    .remove({ id: taskId })
    .write()

const editTask = editedTask => {
  db.get('todos')
    .find({ id: editedTask.id })
    .assign(editedTask)
    .write()
}

const editTasks = editedTasks => {
  db.get('todos')
    .each(task => {
      const editedTask = editedTasks.find(({ id }) => id === task.id) || false

      Object.keys(task).forEach(key => {
        task[key] = editedTask ? editedTask[key] : task[key]
      })
    })
    .write()
}

const toggleAllTaskCompleted = (selectedDate, allDone) => {
  if (!selectedDate) {
    db.get('todos')
      .each(task => {
        task.completed = allDone
      })
      .write()
    return
  }

  db.get('todos')
    .filter(
      ({ date }) =>
        moment(date).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD'),
    )
    .each(todo => {
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

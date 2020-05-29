import moment from 'moment'
import db from './datastore'

const getColor = () => db.getState().color

const addColor = color => db.set('color', color).write()

const getTodos = () => db.getState().todos

const getUserId = () => db.getState().userId

const setUserId = userId => db.set('userId', userId).write()

const setRemainingTasksToday = () =>
  db
    .get('todos')
    .filter(({ completed }) => !completed)
    .each(todo => {
      todo.date = moment()
    })
    .write()

const setTodoCompleted = id => {
  const todo = db
    .get('todos')
    .find({ id })
    .value()

  return db
    .get('todos')
    .find({ id })
    .assign({ ...todo, completed: !todo.completed })
    .write()
}

const addTodos = todo =>
  db
    .get('todos')
    .push(todo)
    .write()

const deleteTodos = todo =>
  db
    .get('todos')
    .remove(todo)
    .write()

const editTodo = (id, newName) => {
  const todo = db
    .get('todos')
    .find({ id })
    .value()

  db.get('todos')
    .find({ id })
    .assign({ ...todo, name: newName })
    .write()
}

const toggleAllCompleted = (selectedDate, allDone) => {
  if (!selectedDate) {
    db.get('todos')
      .each(todo => {
        todo.completed = allDone
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

const deleteCompleted = _ => {
  db.get('todos')
    .remove({ completed: true })
    .write()
}

export {
  getColor,
  getUserId,
  setUserId,
  addColor,
  getTodos,
  addTodos,
  setTodoCompleted,
  editTodo,
  deleteTodos,
  toggleAllCompleted,
  deleteCompleted,
  setRemainingTasksToday,
}

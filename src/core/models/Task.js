import { Model } from '@vuex-orm/core'

import {
  ACTION_CREATE,
  ACTION_DELETE,
  ACTION_EDIT,
  CATEGORY_TASK,
} from '@core/constants'
import { uuid, areDatesEqual } from '@core/utils'

import TaskedDay from './TaskedDay'
import User from './User'

export default class Task extends Model {
  static beforeCreate(model) {
    const [highestOrderIndexTask = {}] = Task.tasksByDate(model.date)
      .get()
      .slice()
      .sort((a, b) => b.orderIndex - a.orderIndex)

    // eslint-disable-next-line no-param-reassign
    model.date = areDatesEqual(new Date(), new Date(model.date))
      ? new Date().toISOString()
      : model.date
    // eslint-disable-next-line no-param-reassign
    model.orderIndex =
      (highestOrderIndexTask && highestOrderIndexTask.orderIndex + 1) || 0
  }

  // This is the name used as module name of the Vuex Store.
  static entity = 'tasks'

  static primaryKey = 'id'

  static tasksByDate(selectedDate) {
    return Task.query().where('date', (date) =>
      areDatesEqual(new Date(date), new Date(selectedDate)),
    )
  }

  static afterCreate() {
    const { analyticSession } = User.query().first()

    analyticSession.event(CATEGORY_TASK, ACTION_CREATE).send()
  }

  static afterUpdate() {
    const { analyticSession } = User.query().first()

    analyticSession.event(CATEGORY_TASK, ACTION_EDIT).send()
  }

  static afterDelete(model) {
    const { tasks } = TaskedDay.query()
      .whereId(model.taskedDayId)
      .with('tasks')
      .first()
    const taskedDayTasksAmount = tasks.length

    if (!taskedDayTasksAmount) {
      TaskedDay.delete(model.taskedDayId)
    }

    const { analyticSession } = User.query().first()

    analyticSession.event(CATEGORY_TASK, ACTION_DELETE).send()
  }

  static fields() {
    return {
      id: this.uid(() => uuid()),
      name: this.string(''),
      date: this.attr(() => new Date().toISOString()),
      orderIndex: this.attr(0),
      tagId: this.attr(null),
      completed: this.boolean(false),
      taskedDayId: this.attr(null),
    }
  }
}

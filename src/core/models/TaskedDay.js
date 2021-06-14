import { Model } from '@vuex-orm/core'

import { areDatesEqual, uuid } from '@core/utils'

import Task from './Task'

export default class TaskedDay extends Model {
  static entity = 'taskedDays'

  static findByDate(date) {
    return TaskedDay.query().where('date', (value) =>
      areDatesEqual(new Date(value), new Date(date)),
    )
  }

  static hasAllTasksCompleted(date) {
    const { tasks = [] } =
      TaskedDay.findByDate(date).with('tasks').first() || {}

    return tasks.every(({ completed }) => completed)
  }

  static getTasksByDate(date, sort, filter) {
    const { tasks = [] } =
      TaskedDay.findByDate(date)
        .with('tasks', (query) => {
          // @TODO: improve this part
          if (sort && filter) {
            query.orderBy(...sort).where(filter)
          }
        })
        .first() || {}

    return tasks
  }

  static async findOrCreateByDate(date) {
    const taskedDay = TaskedDay.findByDate(date).first() || null

    if (!taskedDay) {
      const {
        taskedDays: [taskeDays],
      } = await TaskedDay.insert({
        data: { date: date.toISOString() },
      })

      return taskeDays.id
    }

    return taskedDay.id
  }

  static fields() {
    return {
      id: this.uid(() => uuid()),
      date: this.attr(() => new Date().toISOString()),
      tasks: this.hasMany(Task, 'taskedDayId'),
    }
  }
}

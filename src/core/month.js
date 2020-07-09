import Moment from 'moment'
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment)

export default class month {
  constructor(month, year) {
    this.start = moment([year, month])
    this.end = this.start.clone().endOf('month')
    this.month = month
    this.year = year
  }

  getWeekStart() {
    return this.start.weekday()
  }

  getRange() {
    return moment.range(this.start, this.end)
  }

  getDays() {
    return Array.from(this.getRange().by('day', { exlusive: true }))
  }

  getFormatted() {
    return this.start.format('MMMM YYYY')
  }
}

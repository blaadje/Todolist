import { remote } from 'electron'

import { Model } from '@vuex-orm/core'
import ua from 'universal-analytics'

import { CATEGORY_SYSTEM, ACTION_VERSION, DEFAULT_COLOR } from '@core/constants'
import { uuid } from '@core/utils'

export default class User extends Model {
  static entity = 'user'

  static beforeCreate(model) {
    const analyticSession = ua(process.env.GOOGLE_ANALYTICS_ID, model.id)

    analyticSession
      .event(CATEGORY_SYSTEM, ACTION_VERSION, remote.app.getVersion())
      .send()

    // eslint-disable-next-line no-param-reassign
    model.analyticSession = analyticSession
  }

  static fields() {
    return {
      id: this.uid(() => uuid()),
      color: this.attr(() => DEFAULT_COLOR),
      analyticSession: this.attr(null),
    }
  }
}

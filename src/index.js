import dotenv from 'dotenv'

import * as Sentry from '@sentry/browser'
import vClickOutside from 'v-click-outside'
import Vue from 'vue'

import App from './components/App'

Vue.use(vClickOutside)

dotenv.config()

Sentry.init({
  dsn:
    'https://5a61b511b9df49f28eacbd267bbe3b28@o412957.ingest.sentry.io/5294690',
  release: `todolist@${process.env.npm_package_version}`,
  beforeSend(event) {
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id })
    }

    return event
  },
})

// eslint-disable-next-line global-require
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  render: h => h(App),
}).$mount('#app')

import dotenv from 'dotenv'

import * as Sentry from '@sentry/browser'
import { createApp } from 'vue'
import vClickOutside from 'vue3-click-outside'

import App from './components/App'

dotenv.config()

const app = createApp(App)

app.use(vClickOutside)
app.mount('#app')

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

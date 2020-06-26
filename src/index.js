import Vue from 'vue'
import * as Sentry from '@sentry/browser'
import { Vue as VueIntegration } from '@sentry/integrations'
import App from './components/App'
import dotenv from 'dotenv'
import vClickOutside from 'v-click-outside'

Vue.use(vClickOutside)

dotenv.config()

Sentry.init({
  dsn:
    'https://5a61b511b9df49f28eacbd267bbe3b28@o412957.ingest.sentry.io/5294690',
  integrations: [new VueIntegration({ Vue, attachProps: true })],
  release: `todolist@${process.env.npm_package_version}`,
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  render: h => h(App),
}).$mount('#app')

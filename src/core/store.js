import VuexORM from '@vuex-orm/core'
import localForage from 'localforage'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import Task from '@core/models/Task'
import TaskedDay from '@core/models/TaskedDay'
import User from '@core/models/User'

const database = new VuexORM.Database()

const getOrmSession = () =>
  database.entities.reduce((acc, { name, model }) => {
    return {
      ...acc,
      [name]: model,
    }
  }, {})

database.register(Task)
database.register(TaskedDay)
database.register(User)

const vuexLocal = new VuexPersistence({
  storage: localForage,
  asyncStorage: true,
  reducer: (state) => JSON.parse(JSON.stringify(state)),
})

const store = new Vuex.Store({
  plugins: [VuexORM.install(database), vuexLocal.plugin],
})

if (process.env.NODE_ENV === 'development') {
  global.session = getOrmSession()

  store.subscribe(() => {
    global.session = getOrmSession()
  })
}

export default store

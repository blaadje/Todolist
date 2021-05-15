import { computed, onBeforeMount } from 'vue'

import store from '@core/store'

import User from '../models/User'

export default () => {
  onBeforeMount(async () => {
    await store.restored

    const user = User.query().first() || {}

    User.create({
      data: { id: user.id, color: user.color },
    })
  })

  const getUser = computed(() => User.query().first())

  const updateUserColor = (color) => {
    User.update({
      where: getUser.value.id,
      data: { color: { hex8: color } },
    })
  }

  return { user: getUser, updateUserColor }
}

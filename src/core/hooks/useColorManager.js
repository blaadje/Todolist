import { watch } from 'vue'

import { DEFAULT_COLOR } from '@core/constants'
import useState from '@core/hooks/useState'

export default (user) => {
  const [color, setStateColor] = useState(DEFAULT_COLOR.hex8)

  watch(user, () => {
    setStateColor(user.value.color.hex8)
  })

  const setColor = (updatedColor) => {
    setStateColor(updatedColor)
  }

  return [color, setColor]
}

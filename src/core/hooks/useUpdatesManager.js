import { ipcRenderer } from 'electron'

import { reactive, toRefs } from 'vue'

export default () => {
  const state = reactive({
    available: false,
    downloaded: false,
    progressObj: {},
    informations: {},
  })

  ipcRenderer.on('update-available', (event, { state: value, information }) => {
    state.available = value
    state.information = information
  })
  ipcRenderer.on('download-progress', (event, progressObj) => {
    state.progressObj = progressObj
  })
  ipcRenderer.on('update-downloaded', () => {
    state.downloaded = true
  })

  return toRefs(state)
}

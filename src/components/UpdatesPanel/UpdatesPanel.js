import { ipcRenderer } from 'electron'

import { defineComponent, toRefs } from 'vue'

import DownloadIcon from '@assets/download.svg'
import useState from '@core/hooks/useState'

import Button from '../Button'
import ProgressBar from '../ProgressBar'

import style from './style.module.scss'

export default defineComponent({
  name: 'UpdatesPanel', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    updates: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { updates } = toRefs(props)

    const [isVisible, setIsVisible] = useState(false)

    const handleInstall = () => ipcRenderer.send('install-update')

    const handleClickReleaseLink = () => {
      const url = `https://github.com/blaadje/Todo-list/releases/tag/${updates.value.information.value.releaseName}`

      ipcRenderer.send('open-release-link', url)
    }

    return () => (
      <div class={style.updatesWrapper}>
        <div
          class={style.downloadIconWrapper}
          onClick={() => setIsVisible(!isVisible.value)}
        >
          <DownloadIcon class={style.downloadIcon} />
          {isVisible.value && (
            <div
              v-click-outside={() => setIsVisible(false)}
              class={style.updatesPanel}
            >
              <ProgressBar
                class={style.progressBar}
                width={`${updates.value.progressObj.value.percent}%`}
              />
              <div class={style.updateText}>
                {updates.value.informations.value && (
                  <a
                    class={style.updateReleaseLink}
                    href="#"
                    onClick={handleClickReleaseLink}
                  >
                    {updates.value.informations.value.version}
                  </a>
                )}
                <div class={style.isAvailableText}>is available !</div>
                {updates.value.downloaded.value && (
                  <Button onClick={handleInstall}>Install</Button>
                )}
                {!updates.value.downloaded.value && <span>Downloading...</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  },
})

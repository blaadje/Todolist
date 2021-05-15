<script>
import { ipcRenderer } from 'electron'

import { defineComponent, toRefs, useCssModule } from 'vue'

import DownloadIcon from '@assets/download.svg'
import useState from '@core/hooks/useState'

import Button from './Button'
import ProgressBar from './ProgressBar'

export default defineComponent({
  props: {
    updates: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { updates } = toRefs(props)
    const style = useCssModule()
    const [isVisible, setIsVisible] = useState(false)

    const handleInstall = () => ipcRenderer.send('install-update')

    const handleClickReleaseLink = () => {
      const url = `https://github.com/blaadje/Todo-list/releases/tag/${updates.value.information.releaseName}`

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
                width={`${updates.value.progressObj.percent}%`}
              />
              <div class={style.updateText}>
                {updates.value.information && (
                  <a
                    class={style.updateReleaseLink}
                    href="#"
                    onClick={handleClickReleaseLink}
                  >
                    {updates.value.information.version}
                  </a>
                )}
                <div class={style.isAvailableText}>is available !</div>
                {updates.value.downloaded && (
                  <Button onClick={handleInstall}>Install</Button>
                )}
                {!updates.value.downloaded && <span>Downloading...</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  },
})
</script>

<style lang="scss" module>
.updatesWrapper {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
}

.updateNotification {
  position: absolute;
  height: 10px;
  width: 10px;
  background: red;
}

.downloadIcon {
  fill: white;
  height: 100%;
  width: 100%;
}

.downloadIconWrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 35px;
  width: 35px;
  padding: 0.6rem;
  position: relative;
  border-radius: 100%;
  transition: background 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(white, 0.2);
  }
}

.downloadIconWrapper:before {
  position: absolute;
  top: 3px;
  right: 3px;
  content: '';
  background: #ff685d;
  height: 8px;
  width: 8px;
  border-radius: 50%;
}

.updatesPanel {
  z-index: 3;
  position: absolute;
  top: calc(100% + 5px);
  right: 3px;
  width: 300px;
  height: 50px;
  display: flex;
  padding: 0 1rem;
  align-items: center;
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
  border-radius: 0.2rem;
  background: white;
  font-weight: 100;
  color: white;
  cursor: initial;
}

.progressBar {
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.isAvailableText {
  margin: 0 0.4rem;
}

.updateText {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 10;
}

.updateReleaseLink {
  color: #0266d6;
}
</style>

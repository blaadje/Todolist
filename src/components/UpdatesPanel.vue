<template>
  <div :class="$style.updatesWrapper">
    <div :class="$style.downloadIconWrapper" @click="toggleUpdatesPanel">
      <DownloadIcon :class="$style.downloadIcon" />
      <div
        v-if="updatesPanelVisible"
        :class="$style.updatesPanel"
        @click.stop
        v-click-outside="hideUpdatesPanel"
      >
        <ProgressBar
          :class="$style.progressBar"
          :width="`${updates.progressObj.percent}%`"
        />
        <div :class="$style.updateText">
          <a
            v-if="updates.information"
            :class="$style.updateReleaseLink"
            @click.prevent="
              handleClickReleaseLink(
                `https://github.com/blaadje/Todo-list/releases/tag/${updates.information.releaseName}`,
              )
            "
            href="#"
          >
            {{ updates.information && updates.information.version }}
          </a>
          <div :class="$style.isAvailableText">is available !</div>
          <div
            v-if="updates.downloaded"
            :class="$style.installUpdate"
            @click="handleInstall"
          >
            Install
          </div>
          <span v-if="!updates.downloaded">
            Downloading...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import DownloadIcon from '@assets/download.svg'
import ProgressBar from './ProgressBar'

export default {
  components: {
    DownloadIcon,
    ProgressBar,
  },
  props: {
    updates: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      updatesPanelVisible: false,
    }
  },
  methods: {
    handleInstall() {
      ipcRenderer.send('install-update')
    },
    handleClickReleaseLink(url) {
      ipcRenderer.send('open-release-link', url)
    },
    hideUpdatesPanel() {
      this.updatesPanelVisible = false
    },
    toggleUpdatesPanel() {
      this.updatesPanelVisible = !this.updatesPanelVisible
    },
  },
}
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

.installUpdate {
  display: inline-block;
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: bold;
  margin-left: auto;
  text-transform: uppercase;
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
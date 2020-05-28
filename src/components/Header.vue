<template>
  <header :class="$style.wrapper" :style="{ background: colors.hex }">
    <div :class="$style.menu">
      <div v-if="updates.available" :class="$style.updatesWrapper">
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
      <span :class="$style.dateFormatted">
        {{ selectedDate.format('YYYY-MM-DD') }}
      </span>
      <div :class="$style.icons">
        <CalendarIcon
          :class="$style.calendar"
          @click="datePickerVisible = true"
        />
        <ColorPickerIcon
          :class="$style.picker"
          @click="colorPickerVisible = true"
        />
      </div>
      <DatePicker
        v-if="datePickerVisible"
        v-click-outside="hideDatePicker"
        :colors="colors"
        :selected-date="selectedDate"
        :tasked-days="taskedDays"
        @close="datePickerVisible = false"
        @selectedDate="handleSelectedDate"
      />
    </div>
    <Transition name="slideUp">
      <div
        v-if="colorPickerVisible"
        v-click-outside="hideColorPicker"
        :class="$style.pickerContent"
      >
        <Sketch :class="$style.sketch" :value="colors" @input="handleSketch" />
        <button
          :style="{
            background: colors.hex,
            border: '1px solid' + colors.hex,
          }"
          :class="$style.sketchButton"
          @click="
            () => {
              colorPickerVisible = false
              $emit('saveColor')
            }
          "
        >
          Ok
        </button>
      </div>
    </Transition>
    <div v-if="isInputAvailable" :class="$style.inputWrapper">
      <input
        v-model="newTodoName"
        :class="$style.newTodo"
        type="text"
        placeholder="Create a task"
        @keyup.enter="createTodo"
      />
      <div :class="$style.tagSelector" v-click-outside="hideTagSelector">
        <div :class="$style.topWrapper" @click="toggleTagSelector">
          <span
            :class="[
              $style.currentTag,
              $style.tag,
              { [$style.hasNoTag]: !selectedTag },
            ]"
            :style="{ background: selectedTag && selectedTag.color }"
          />
          <DownArrowIcon :class="$style.downArrowIcon" />
        </div>
        <div v-if="tagSelectorVisible" :class="$style.tagsWrapper">
          <span
            v-for="tag in tags"
            :key="tag.id"
            :class="$style.tag"
            @click="setSelectedTag(tag)"
            :style="{ background: tag.color }"
          />
          <span
            :class="[$style.tag, $style.hasNoTag]"
            @click="setSelectedTag()"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ipcRenderer } from 'electron'
import { autoUpdater } from 'electron-updater'
import moment from 'moment'
import { Sketch } from 'vue-color'

import DatePicker from './DatePicker'

import ProgressBar from '@components/ProgressBar'

import ColorPickerIcon from '@assets/color-picker.svg'
import CalendarIcon from '@assets/calendar.svg'
import DownArrowIcon from '@assets/downArrow.svg'
import DownloadIcon from '@assets/download.svg'

export default {
  components: {
    DatePicker,
    Sketch,
    ColorPickerIcon,
    CalendarIcon,
    DownArrowIcon,
    DownloadIcon,
    ProgressBar,
  },
  props: {
    updates: {
      type: Object,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    colors: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Object,
      required: true,
    },
    taskedDays: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      newTodoName: '',
      updatesPanelVisible: false,
      colorPickerVisible: false,
      datePickerVisible: false,
      tagSelectorVisible: false,
      selectedTag: null,
    }
  },
  computed: {
    isInputAvailable() {
      return (
        this.selectedDate.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
      )
    },
  },
  methods: {
    createTodo() {
      if (!this.newTodoName) {
        return
      }

      this.$emit(
        'createTodo',
        this.newTodoName,
        this.selectedTag && this.selectedTag.id,
      )
      this.newTodoName = ''
    },
    hideColorPicker() {
      this.colorPickerVisible = false
    },
    hideDatePicker() {
      this.datePickerVisible = false
    },
    hideTagSelector() {
      this.tagSelectorVisible = false
    },
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
    toggleTagSelector() {
      this.tagSelectorVisible = !this.tagSelectorVisible
    },
    setSelectedTag(tag) {
      this.selectedTag = tag
    },
    handleSketch(color) {
      return this.$emit('selectedColor', color)
    },
    handleSelectedDate(date) {
      return this.$emit('selectedDate', date)
    },
  },
}
</script>

<style lang="scss" module>
.wrapper {
  width: 100%;
  margin: 0;
  top: 0;
  position: sticky;
  padding: 0;
  z-index: 2;
  -webkit-app-region: drag;
}

.icons {
  flex: 5;
}

.hasNoTag {
  border: 1px solid #ededed;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: 180%;
    width: 1px;
    background: red;
    transform: rotate(45deg) translate(-50%, -50%);
    transform-origin: 0% 0%;
  }
}

.inputWrapper {
  display: flex;
  position: relative;
}

.tagsWrapper {
  display: flex;
  margin-top: 0.5rem;
  padding: 0.5rem;
  flex-direction: column;
  border-radius: 0.2rem;
  align-items: center;
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
}

.tagSelector {
  position: absolute;
  top: 25px;
  border-radius: 0.2rem;
  right: 20px;
  background: white;
}

.downArrowIcon {
  height: 15px;
  width: 15px;
  margin-left: 5px;
}

.topWrapper {
  display: flex;
  cursor: pointer;
  align-items: center;
}

.calendar {
  margin: 0 2rem;
}

.sketch {
  box-shadow: none !important;
  position: absolute;
  left: 0;
  border: none !important;
  box-shadow: none;
  border-radius: 0 !important;
  right: 0;
  margin: auto;
  background: transparent !important;
}

.sketchButton {
  position: absolute;
  right: 1em;
  bottom: 1em;
  cursor: pointer;
  outline: none;
  padding: 0.6em 1em;
  border-radius: 0.2em;
  color: white;
  text-transform: uppercase;
}

.tag {
  cursor: pointer;
  height: 20px;
  width: 20px;
  margin: 0.3rem;
  border-radius: 0.2rem;
  display: block;
}

.pickerContent {
  position: absolute;
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.8);
  width: 230px;
  height: 350px;
  border-radius: 0.2rem;
  text-align: right;
  left: 0;
  display: inline-block;
  right: 0;
  margin: auto;
  z-index: 5;
}

.calendar,
.picker {
  -webkit-app-region: no-drag;
  width: 20px;
  height: 20px;
  fill: black;
  transition: 0.8s all cubic-bezier(0, 0.54, 0.5, 1);
  cursor: pointer;
}

.calendar.calendar,
.picker.calendar {
  left: 69%;
  top: 40%;
}

.calendar.picker,
.picker.picker {
  left: 75%;
}

.calendar:hover,
.picker:hover {
  transform: scale(1.3) rotate(5deg);
}

.menu {
  position: relative;
  padding: 2.5em 1em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu:before {
  content: '';
  width: 100%;
  flex: 5;
}

.dateFormatted {
  white-space: nowrap;
  flex: 1;
  word-wrap: none;
  font-size: 1.7em;
  font-weight: 100;
  color: white;
}

.newTodo {
  -webkit-app-region: no-drag;
  border: none;
  font-size: 1.5em;
  font-weight: 200;
  padding: 1em;
  width: 100%;
  margin: 0;
  outline: none;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.06);
}

.updatesWrapper {
  position: absolute;
  top: 15px;
  right: 15px;
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

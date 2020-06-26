<template>
  <header :class="$style.wrapper" :style="{ background: colors.hex }">
    <div :class="$style.menu">
      <span :class="$style.dateFormatted" @click="datePickerVisible = true">
        {{ selectedDate.format('YYYY-MM-DD') }}
      </span>
      <div :class="$style.icons">
        <ColorPickerIcon
          :class="$style.icon"
          @click="colorPickerVisible = true"
        />
        <ClipboardIcon
          v-if="!isExported"
          :class="$style.icon"
          @click="handleExportTask"
        />
        <div v-if="isExported" :class="$style.checkIconWrapper">
          <CheckIcon
            :class="[$style.icon, $style.checkIcon]"
            @click="handleExportTask"
          />
        </div>
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
  </header>
</template>

<script>
import moment from 'moment'
import { Sketch } from 'vue-color'

import DatePicker from './DatePicker'

import ColorPickerIcon from '@assets/color-picker.svg'
import ClipboardIcon from '@assets/clipboard.svg'
import CheckIcon from '@assets/check.svg'

export default {
  components: {
    DatePicker,
    Sketch,
    ColorPickerIcon,
    ClipboardIcon,
    CheckIcon,
  },
  props: {
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
      colorPickerVisible: false,
      datePickerVisible: false,
      isExported: false,
      timeout: null,
    }
  },
  methods: {
    hideColorPicker() {
      this.colorPickerVisible = false
    },
    hideDatePicker() {
      this.datePickerVisible = false
    },
    handleExportTask() {
      clearTimeout(this.timeout)
      this.isExported = true
      this.$emit('exportTasks')
      this.timeout = setTimeout(() => {
        this.isExported = false
      }, 2000)
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
  z-index: 4;
  -webkit-app-region: drag;
}

.icons {
  flex: 5;
  display: flex;
  align-items: center;
  margin-left: 1rem;
}

.icon {
  margin: 0 0.4rem;
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

.pickerContent {
  position: absolute;
  box-shadow: 2px 6px 8px 3px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  width: 230px;
  height: 350px;
  text-align: right;
  left: 0;
  display: inline-block;
  right: 0;
  margin: auto;
  z-index: 5;
}

.icon {
  -webkit-app-region: no-drag;
  width: 20px;
  height: 20px;
  fill: white;
  transition: 0.8s all cubic-bezier(0, 0.54, 0.5, 1);
  cursor: pointer;
}

.icon:hover {
  transform: scale(1.1) rotate(2deg);
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
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  word-wrap: none;
  font-size: 1.7em;
  font-weight: 100;
  color: white;
}

.checkIconWrapper {
  position: relative;
}

.checkIconWrapper::after {
  white-space: nowrap;
  content: 'Copied in clipboard!';
  padding: 0.3rem 0.6rem;
  color: #757575;
  background: white;
  border-radius: 0.2rem;
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
}

.checkIcon {
  fill: none;
  position: relative;
}
</style>

<template>
  <header :class="$style.wrapper" :style="{ background: colors.hex }">
    <div :class="$style.menu">
      <span :class="$style.dateFormatted" @click="datePickerVisible = true">
        {{ selectedDate.format('YYYY-MM-DD') }}
      </span>
      <div :class="$style.icons">
        <ColorPickerIcon :class="$style.icon" @click="sketchVisible = true" />
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
        :class="$style.datePicker"
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
        v-if="sketchVisible"
        v-click-outside="hideSketchPicker"
        :class="$style.sketchWrapper"
      >
        <Sketch :class="$style.sketch" :value="colors" @input="handleSketch" />
        <Button filled :color="colors.hex" @click="handleColorSave">
          Save
        </Button>
      </div>
    </Transition>
  </header>
</template>

<script>
import moment from 'moment'
import { Sketch } from 'vue-color'

import ColorPickerIcon from '@assets/color-picker.svg'
import ClipboardIcon from '@assets/clipboard.svg'
import CheckIcon from '@assets/check.svg'

import DatePicker from './DatePicker'
import Button from './Button'

export default {
  components: {
    DatePicker,
    Sketch,
    ColorPickerIcon,
    ClipboardIcon,
    CheckIcon,
    Button,
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
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      sketchVisible: false,
      datePickerVisible: false,
      isExported: false,
      timeout: null,
    }
  },
  methods: {
    hideSketchPicker() {
      this.sketchVisible = false
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
    handleColorSave() {
      this.sketchVisible = false
      this.$emit('saveColor')
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

.sketch.sketch {
  box-shadow: none;
  border: none;
  width: auto;
  border-radius: 0;
  padding: 0;
  background: transparent;
}

.sketchWrapper {
  position: absolute;
  box-shadow: 2px 6px 8px 3px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  width: 230px;
  text-align: right;
  padding: 1rem;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.datePicker {
  position: absolute;
  left: 0;
  top: 133px;
  right: 0;
  width: 392px;
  margin: auto;
  z-index: 6;
}
</style>

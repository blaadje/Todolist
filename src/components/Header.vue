<template>
  <header :class="$style.wrapper" :style="{ background: colors.hex }">
    <Tooltip>
      <template #trigger>
        <span :class="$style.dateFormatted" @click="datePickerVisible = true">
          {{ formattedSelectedDate }}
        </span>
      </template>
      <template #content>
        <span>Calendar</span>
      </template>
    </Tooltip>
    <div :class="$style.icons">
      <Tooltip>
        <template #trigger>
          <ColorPickerIcon :class="$style.icon" @click="sketchVisible = true" />
        </template>
        <template #content>
          <span>Color picker</span>
        </template>
      </Tooltip>
      <Tooltip :disabled="isExported">
        <template #trigger>
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
        </template>
        <template #content>
          <span>Export tasks</span>
        </template>
      </Tooltip>
    </div>
    <keep-alive>
      <DatePicker
        v-if="datePickerVisible"
        v-click-outside="hideDatePicker"
        :class="$style.datePicker"
        :colors="colors"
        :selected-date="selectedDate"
        :tasked-days="taskedDays"
        @close="datePickerVisible = false"
        @selectedDate="handleSelectedDate"
      />
    </keep-alive>
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
import { Sketch } from 'vue-color'

import CheckIcon from '@assets/check.svg'
import ClipboardIcon from '@assets/clipboard.svg'
import ColorPickerIcon from '@assets/color-picker.svg'
import { formatDate } from '@core/utils'

import Button from './Button'
import DatePicker from './DatePicker'
import Tooltip from './Tooltip'

export default {
  components: {
    DatePicker,
    Sketch,
    ColorPickerIcon,
    ClipboardIcon,
    CheckIcon,
    Button,
    Tooltip,
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
      type: Date,
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
  computed: {
    formattedSelectedDate() {
      return formatDate(this.selectedDate, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    },
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
      return this.$emit('setSelectedColor', color)
    },
    handleColorSave() {
      this.sketchVisible = false
      this.$emit('saveColor')
    },
    handleSelectedDate(date) {
      return this.$emit('setSelectedDate', date)
    },
  },
}
</script>

<style lang="scss" module>
$height: 115px;

.wrapper {
  width: 100%;
  height: $height;
  position: relative;
  padding: 2.5em 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  -webkit-app-region: drag;
}

.wrapper:before {
  content: '';
  width: 100%;
  flex: 5;
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
  top: $height;
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

.dateFormatted {
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  word-wrap: none;
  font-size: 1.7em;
  font-weight: 100;
  color: white;
  user-select: none;
}

.checkIconWrapper {
  position: relative;
}

.checkIconWrapper::after {
  white-space: nowrap;
  content: 'Copied in clipboard!';
  padding: 0.3rem 0.6rem;
  color: white;
  font-size: 0.8rem;
  background: rgba(#2ec685, 0.7);
  border-radius: 0.2rem;
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
}

.checkIcon {
  color: white;
  fill: none;
  position: relative;
}

.datePicker {
  position: absolute;
  left: 0;
  top: $height + 17px;
  right: 0;
  width: 392px;
  margin: auto;
  z-index: 6;
}
</style>

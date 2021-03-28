<template>
  <header :class="$style.wrapper">
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
            <Tooltip appearance="success">
              <template #trigger>
                <CheckIcon
                  :class="[$style.icon, $style.checkIcon]"
                  @click="handleExportTask"
                />
              </template>
              <template #content>
                <span>Copied in clipboard!</span>
              </template>
            </Tooltip>
          </div>
        </template>
        <template #content>
          <span>Export tasks</span>
        </template>
      </Tooltip>
    </div>
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
    <Transition name="slideUp">
      <div
        v-if="sketchVisible"
        v-click-outside="hideSketchPicker"
        :class="$style.sketchWrapper"
      >
        <Sketch v-model="stateColors" :class="$style.sketch" />
        <Button filled :color="colors.hex" @click="handleColorSave">
          Save
        </Button>
      </div>
    </Transition>
  </header>
</template>

<script>
import { Sketch } from '@ckpack/vue-color'
import { defineComponent } from 'vue'

import CheckIcon from '@assets/check.svg'
import ClipboardIcon from '@assets/clipboard.svg'
import ColorPickerIcon from '@assets/color-picker.svg'
import { formatDate } from '@core/utils'

import Button from './Button'
import DatePicker from './DatePicker'
import Tooltip from './Tooltip'

export default defineComponent({
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
      stateColors: null,
    }
  },
  watch: {
    colors: {
      handler(value) {
        this.stateColors = value
      },
      immediate: true,
    },
    stateColors(value) {
      this.$emit('setSelectedColor', value)
    },
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
    handleColorSave() {
      this.sketchVisible = false
      this.$emit('saveColor')
    },
    handleSelectedDate(date) {
      return this.$emit('setSelectedDate', date)
    },
  },
})
</script>

<style lang="scss" module>
$height: 85px;

.wrapper {
  width: 100%;
  position: relative;
  padding: 2em 1em;
  display: flex;
  align-items: center;
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
  border-radius: 0.6rem;
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
  white-space: nowrap;
  color: white;
  font-size: 0.8rem;
}

.checkIcon {
  color: white;
  fill: none;
  position: relative;
}

.datePicker {
  position: absolute;
  left: 0;
  top: $height;
  right: 0;
  width: 392px;
  margin: auto;
  z-index: 6;
}
</style>

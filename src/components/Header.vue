<template>
  <header :class="$style.wrapper" :style="{ background: colors.hex }">
    <div :class="$style.menu">
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
  </header>
</template>

<script>
import moment from 'moment'
import { Sketch } from 'vue-color'

import DatePicker from './DatePicker'

import ColorPickerIcon from '@assets/color-picker.svg'
import CalendarIcon from '@assets/calendar.svg'

export default {
  components: {
    DatePicker,
    Sketch,
    ColorPickerIcon,
    CalendarIcon,
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
    }
  },
  methods: {
    hideColorPicker() {
      this.colorPickerVisible = false
    },
    hideDatePicker() {
      this.datePickerVisible = false
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
</style>

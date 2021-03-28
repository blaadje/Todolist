<template>
  <div>
    <div :class="$style.month">
      <LeftArrowIcon :class="$style.leftArrowIcon" @click="setPreviousMonth" />
      <LeftArrowIcon :class="$style.rightArrowIcon" @click="setNextMonth" />
      {{ formattedMonth }}
    </div>
    <div :class="$style.calendar">
      <div :class="$style.daysNameBackground">
        <div :class="$style.daysNameWrapper">
          <div
            v-for="dayName in daysName"
            :key="`${dayName}-daysName`"
            :class="$style.day"
            :style="{ width: `${daySize}px`, height: `${daySize}px` }"
          >
            {{ dayName }}
          </div>
        </div>
      </div>
      <div ref="calendar" :class="$style.sliderWrapper">
        <Slider
          :class="$style.slider"
          @increment="setNextMonth"
          @decrement="setPreviousMonth"
        >
          <div
            v-for="({ previousDays, days }, index) in getDisplayedMonths"
            :key="index"
            :class="$style.daysLabels"
          >
            <div
              v-for="previousDay in previousDays"
              :key="`${previousDay}-${index}-previousDays`"
              :class="[$style.day, $style.previous]"
              :style="{ width: `${daySize}px`, height: `${daySize}px` }"
            >
              {{ previousDay.getDate() }}
            </div>
            <div
              v-for="day in days"
              :key="`${day}-${index}-days`"
              :class="[
                $style.day,
                $style.selectableDay,
                { [$style.isSelected]: isSelectedDay(day) },
              ]"
              :style="{ width: `${daySize}px`, height: `${daySize}px` }"
              @click="selectDay(day)"
            >
              <span
                :class="[$style.overlay, $style.hoverOverlay]"
                :style="{ background: colors.hex }"
              />
              <span
                v-if="isToday(day)"
                :class="[$style.overlay, $style.todayOverlay]"
              />
              <span
                v-if="dayHasLabel(day)"
                :class="[
                  $style.dayHasLabelOverlay,
                  {
                    [$style.isCompleted]: dayHasLabel(day).completed,
                  },
                ]"
              />
              <span
                v-if="isSelectedDay(day)"
                :class="[$style.overlay, $style.selectedOverlay]"
                :style="{ background: colors.hex }"
              />
              <span :class="$style.label">{{ day.getDate() }}</span>
            </div>
          </div>
        </Slider>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

import LeftArrowIcon from '@assets/leftArrow.svg'
import {
  formatDate,
  areDatesEqual,
  decrementDay,
  incrementDay,
  incrementMonth,
  decrementMonth,
  isToday,
} from '@core/utils'

import Slider from './Slider'

export default defineComponent({
  name: 'App',
  components: {
    Slider,
    LeftArrowIcon,
  },
  props: {
    colors: {
      type: Object,
      required: true,
    },
    labelsByDay: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Date,
      required: true,
    },
  },
  data() {
    return {
      daysName: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      previewDate: new Date(),
      localSelectedDate: new Date(),
      daySize: 0,
    }
  },
  computed: {
    isToday: () => isToday,
    getDisplayedMonths() {
      return [
        this.getDays(this.getMonth - 1),
        this.getDays(this.getMonth),
        this.getDays(this.getMonth + 1),
      ]
    },
    formattedMonth() {
      return formatDate(this.previewDate, {
        month: 'long',
        year: 'numeric',
      })
    },
    getMonth() {
      return this.previewDate.getMonth() + 1
    },
    getYear() {
      return this.previewDate.getFullYear()
    },
  },
  watch: {
    selectedDate: {
      handler(newValue) {
        this.localSelectedDate = newValue
        this.previewDate = newValue

        this.$emit('isTodayDisabled', isToday(newValue))
      },
      immediate: true,
    },
    previewDate(newPreviewDate, oldPreviewDate) {
      if (newPreviewDate.getMonth() === oldPreviewDate.getMonth()) {
        return
      }

      const currentMonth = new Date().getMonth()

      this.$emit('isTodayDisabled', currentMonth === newPreviewDate.getMonth())
    },
  },
  mounted() {
    this.setDaySize()
  },
  methods: {
    dayHasLabel(day) {
      return this.labelsByDay[formatDate(day)]
    },
    getDays(month) {
      const daysInMonth = new Date(this.getYear, month, 0).getDate()
      const endDate = new Date(this.getYear, month - 1, 0)
      const startDate = incrementDay(new Date(this.getYear, month - 1, 0))

      return {
        previousDays: Array.from({ length: endDate.getDay() }, (_, index) => {
          return decrementDay(endDate, index)
        }).reverse(),
        days: Array.from({ length: daysInMonth }, (_, index) => {
          return incrementDay(startDate, index)
        }),
      }
    },
    isSelectedDay(day) {
      return areDatesEqual(day, this.localSelectedDate)
    },
    setNextMonth() {
      this.previewDate = incrementMonth(this.previewDate)
    },
    setPreviousMonth() {
      this.previewDate = decrementMonth(this.previewDate)
    },
    selectDay(day) {
      const updatedDay = isToday(day) ? new Date() : day

      this.localSelectedDate = updatedDay
      this.$emit('setSelectedDate', updatedDay)
    },
    setDaySize() {
      const daysInWeek = 7

      const element = this.$refs.calendar
      const padding = Number(
        getComputedStyle(element).paddingLeft.split('px')[0],
      )

      this.daySize = (element.clientWidth - padding * 2) / daysInWeek
    },
  },
})
</script>

<style lang="scss" module>
.daysLabels {
  display: flex;
  flex-wrap: wrap;
}

.day {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.previous {
  color: #b6c1d6;
}

.label {
  z-index: 2;
}

.selectedOverlay {
  z-index: 1;
}

.daysNameWrapper {
  flex-wrap: wrap;
  display: flex;
}

.buttonWrapper {
  position: fixed;
  top: 50%;
  right: 50px;
}

.slider {
  height: 100%;
  width: 100%;
}

.sliderWrapper {
  padding: 2rem;
  padding-top: 1rem;
}

.daysNameBackground {
  padding: 0.2rem 0;
  background: #f5f7fc;
  display: flex;
  justify-content: center;
  color: #b6c1d6;
}

.selectableDay {
  cursor: pointer;
  font-weight: bold;
  color: #757575;

  &.isSelected {
    color: white;
  }

  &:hover {
    color: white;
    .hoverOverlay {
      transform: scale(0.8);
      opacity: 0.6;
    }
  }
}

.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transform: scale(0.8);
  border-radius: 50%;
}

.todayOverlay {
  background: #ededed;
}

.hoverOverlay {
  transform-origin: center;
  transition: transform 0.3s ease;
  opacity: 0;
  z-index: 0;
  color: white;
  transform: scale(0.4);
}

.month {
  padding: 1rem 2.8rem;
  display: block;
  display: flex;
  align-items: center;
}

.rightArrowIcon,
.leftArrowIcon {
  width: 35px;
  height: 35px;
  border-radius: 0.2rem;
  padding: 0.7rem 0.5rem;
  cursor: pointer;
  &:hover {
    background: #f6f7fc;
  }
}

.rightArrowIcon {
  transform: rotate(180deg);
  margin: 0.2rem;
  margin-right: 1rem;
}

.dayHasLabelOverlay {
  z-index: 3;
  height: 5px;
  width: 5px;
  background: #ed687b;
  transform-origin: center;
  position: absolute;
  top: 6px;
  right: 6px;
  border-radius: 50%;

  &.isCompleted {
    background: #2ec684;
  }
}
</style>

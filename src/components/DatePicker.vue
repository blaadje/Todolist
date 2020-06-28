<template>
  <div>
    <div
      :class="$style.triangle"
      :style="{
        borderColor: `transparent transparent ${colors.hex} transparent`,
      }"
    />
    <div :class="$style.agenda">
      <div :class="$style.header" :style="{ background: colors.hex }">
        <span :class="$style.year">{{ selectedDate.format('YYYY') }}</span>
        <span :class="$style.date">
          {{ selectedDate.format('dddd DD MMMM') }}
        </span>
      </div>
      <div :class="$style.days">
        <div :class="$style.shortcuts">
          <Button
            :color="colors.hex"
            :class="$style.button"
            :disabled="isToday(selectedDate)"
            @click="handleToday"
          >
            Today
          </Button>
          <Button
            :color="colors.hex"
            :class="$style.button"
            @click="handleTomorrow"
          >
            Tomorrow
          </Button>
          <Button
            :color="colors.hex"
            :class="$style.button"
            @click="handleNextWeek"
          >
            Next Week
          </Button>
        </div>
        <label :class="$style.month">{{ month.getFormatted() }}</label>
        <div :class="$style.weekdaysBackground">
          <div :class="$style.weekdaysWrapper">
            <div
              v-for="(day, index) in days"
              :key="index"
              :style="{ width: `${daySize}px`, height: `${daySize}px` }"
              :class="$style.weekdays"
            >
              {{ day }}
            </div>
          </div>
        </div>
        <div ref="calendar" :class="$style.slidingElement">
          <Slider @increment="handleIncrement" @decrement="handleDecrement">
            <div
              v-for="(month, index) in sliderMonths"
              :class="$style.daysWrapper"
              :key="index"
            >
              <div
                v-for="(day, index) in previousMonthDays(month)"
                :class="$style.spacer"
                :key="`weekday${index}`"
                :style="{ width: `${daySize}px`, height: `${daySize}px` }"
              >
                {{ day.format('D') }}
              </div>
              <div
                v-for="(day, index) in month.getDays()"
                :key="`day${index}`"
                :class="[$style.day, { [$style.selected]: isSelected(day) }]"
                :style="{ width: `${daySize}px`, height: `${daySize}px` }"
                @click="selectDate(day)"
              >
                <span
                  :class="$style.overlay"
                  :style="{ background: colors.hex }"
                />
                <span
                  v-if="dayHasTask(day)"
                  :class="[
                    $style.dayHasTaskOverlay,
                    {
                      [$style.isCompleted]: dayHasTask(day).completed,
                    },
                  ]"
                />
                <span v-if="isToday(day)" :class="$style.todayOverlay" />
                <span :class="$style.text">{{ day.format('D') }}</span>
              </div>
            </div>
          </Slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

import Month from '@core/month.js'
import Next from '@assets/next.svg'
import Previous from '@assets/previous.svg'

import Button from './Button'
import Slider from './Slider'

export default {
  components: {
    Next,
    Previous,
    Button,
    Slider,
  },
  props: {
    taskedDays: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Object,
      required: true,
    },
    colors: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      daySize: 0,
      calendarSlidingDirection: 'left',
      localSelectedDate: this.selectedDate,
      days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      month: new Month(this.selectedDate.month(), this.selectedDate.year()),
    }
  },
  mounted() {
    this.setDaySize()
  },
  computed: {
    previousMonth() {
      return new Month(this.month.month - 1, this.selectedDate.year())
    },
    nextMonth() {
      return new Month(this.month.month + 1, this.selectedDate.year())
    },
    sliderMonths() {
      return [this.previousMonth, this.month, this.nextMonth]
    },
  },
  watch: {
    selectedDate(value) {
      this.month = new Month(value.month(), this.month.year)
    },
  },
  methods: {
    previousMonthDays(currentMonth) {
      let month = currentMonth.month - 1
      let year = currentMonth.year
      if (month < 0) {
        year -= 1
        month = 11
      }
      const previousMonthDaysAmount = currentMonth.getWeekStart() - 2

      if (previousMonthDaysAmount <= 0) {
        return []
      }

      const previousMonth = new Month(month, year)
      const start = moment(previousMonth.end).subtract(
        previousMonthDaysAmount,
        'days',
      )
      const end = previousMonth.end

      const range = moment.range(start, end)

      return Array.from(range.by('day'))
    },
    handleIncrement() {
      this.setNextMonth()
    },
    handleDecrement() {
      this.setPrevMonth()
    },
    handleToday() {
      const today = moment()
      if (
        moment(this.selectedDate).format('YYYY-MM-DD') ===
        today.format('YYYY-MM-DD')
      ) {
        return
      }

      this.selectDate(today)
    },
    handleTomorrow() {
      const tomorrow = moment().add(1, 'day')

      if (
        moment(this.selectedDate).format('YYYY-MM-DD') ===
        tomorrow.format('YYYY-MM-DD')
      ) {
        return
      }

      this.selectDate(tomorrow)
    },
    handleNextWeek() {
      const nextWeek = moment().add(1, 'week')

      if (
        moment(this.selectedDate).format('YYYY-MM-DD') ===
        nextWeek.format('YYYY-MM-DD')
      ) {
        return
      }

      this.selectDate(nextWeek)
    },
    setDaySize() {
      const daysInWeek = 7

      const element = this.$refs.calendar
      const padding = Number(
        getComputedStyle(element).paddingLeft.split('px')[0],
      )

      this.daySize = (element.clientWidth - padding * 2) / daysInWeek
    },
    dayHasTask(day) {
      const formattedDay = moment(day).format('YYYY-MM-DD')

      return this.taskedDays[formattedDay]
    },
    isToday(day) {
      return moment().format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
    },
    setPrevMonth() {
      let month = this.month.month - 1
      let year = this.month.year
      if (month < 0) {
        year -= 1
        month = 11
      }

      this.month = new Month(month, year)
    },
    setNextMonth() {
      let month = this.month.month + 1
      let year = this.month.year
      if (month > 11) {
        year += 1
        month = 0
      }

      this.month = new Month(month, year)
    },
    getMonth() {
      let mm = this.month.month + 1
      let yy = this.month.year

      mm = mm < 10 ? '0' + mm : mm
      return yy + '-' + mm
    },
    isSelected(day) {
      return (
        this.localSelectedDate.format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
      )
    },
    selectDate(day) {
      this.localSelectedDate = day
      this.$emit('selectedDate', day)
    },
  },
}
</script>

<style lang="scss" module>
.shortcuts {
  padding: 1rem 2.8rem;
  border-bottom: 1px solid #ededed;
}

.weekdaysBackground {
  padding: 0.2rem 0;
  background: #f5f7fc;
  display: flex;
  justify-content: center;
  color: #b6c1d6;
}

.daysWrapper {
  width: 100%;
  display: inline-flex;
  flex-wrap: wrap;
  align-self: flex-start;
}

.agenda {
  overflow: hidden;
  border-radius: 0.2rem;
  box-shadow: 0px 0px 19px rgba(0, 0, 0, 0.12);
}

.triangle {
  content: '';
  position: absolute;
  top: -17px;
  left: 0;
  right: 0;
  margin: auto;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 17.5px 17px 17.5px;
}

.header {
  color: white;
  padding: 1.5em;
}

.year {
  display: block;
  opacity: 0.7;
}

.date {
  font-size: 1.5em;
}

.controls {
  position: relative;
  display: flex;
  align-items: center;
  height: 70px;
  justify-content: center;
  line-height: 56px;
  cursor: pointer;
}

.arrows {
  flex: 3;
  width: 24px;
  height: 24px;
  fill: rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}

.controls label {
  white-space: nowrap;
  flex: 2;
  color: #757575;
}

.weekdaysWrapper {
  display: flex;
}

.weekdays {
  display: flex;
  justify-content: center;
  align-items: center;
}
.calendar {
  padding: 2rem;
}

.spacer {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #b6c1d6;
}

.day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  font-weight: bold;
}

.days {
  background: white;
}

.agenda .days .day.selected .text {
  color: white;
}

.agenda .days .day.selected .overlay {
  opacity: 1;
  position: absolute;
  transform: translate(-50%, -50%) scale(1);
  top: 50%;
  left: 50%;
}

.agenda .days .day:hover .text {
  color: white;
}

.agenda .days .day:hover .overlay {
  transform: translate(-50%, -50%) scale(1);
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0.6;
}

.overlay {
  transform-origin: center;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1);
  position: absolute;
  opacity: 0;
  z-index: 0;
  top: 50%;
  left: 50%;
  color: white;
  height: 80%;
  width: 80%;
  transform: translate(-50%, -50%) scale(0);
  border-radius: 50%;
}

.dayHasTaskOverlay {
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

.todayOverlay {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  background: #ededed;
  z-index: 1;
  top: 50%;
  left: 50%;
  height: 80%;
  width: 80%;
  border-radius: 50%;
}

.text {
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  color: #757575;
  z-index: 2;
}

.month {
  padding: 1.5rem 2.8rem;
  display: block;
}

.slidingElement {
  padding: 2rem;
  padding-top: 1rem;
}

.button {
  margin-right: 0.5rem;
}
</style>

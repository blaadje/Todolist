<template>
  <div :class="$style.wrapper">
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
          {{ selectedDate.format('dddd DD MMM') }}
        </span>
      </div>
      <div :class="$style.days">
        <div :class="$style.controls">
          <Next :class="$style.arrows" @click="prevMonth()" />
          <label>{{ month.getFormatted() }}</label>
          <Previous :class="$style.arrows" @click="nextMonth()" />
        </div>
        <div v-for="(day, index) in days" :key="index" :class="$style.weekdays">
          {{ day }}
        </div>
        <div :class="$style.daysWrapper">
          <div
            :class="$style.spacer"
            :style="{ width: month.getWeekStart() * 52 + 'px' }"
          />
          <div
            v-for="(day, index) in month.getDays()"
            :key="`day${index}`"
            :class="[$style.day, { [$style.selected]: isSelected(day) }]"
            @click="selectDate(day)"
          >
            <span
              :class="$style.overlay"
              :style="{ background: colors.hex }"
            ></span>
            <span v-if="dayHasTodos(day)" :class="$style.taskedOverlay" />
            <span v-if="isToday(day)" :class="$style.todayOverlay" />
            <span :class="$style.text">{{ day.format('D') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Month from '@core/month.js'
import Next from '@assets/next.svg'
import Previous from '@assets/previous.svg'
import moment from 'moment'

export default {
  components: {
    Next,
    Previous,
  },
  props: {
    taskedDays: {
      type: Array,
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
      localSelectedDate: this.selectedDate,
      days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      month: new Month(this.selectedDate.month(), this.selectedDate.year()),
    }
  },
  methods: {
    dayHasTodos(day) {
      return this.taskedDays.some(item => item === day.format('YYYY-MM-DD'))
    },
    isToday(day) {
      return moment().format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
    },
    nextMonth() {
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
    prevMonth() {
      let month = this.month.month - 1
      let year = this.month.year
      if (month < 0) {
        year -= 1
        month = 11
      }
      this.month = new Month(month, year)
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
.daysWrapper {
  display: inline-flex;
  flex-wrap: wrap;
}

.wrapper {
  position: absolute;
  left: 0;
  top: 130px;
  right: 0;
  width: 392px;
  margin: auto;
  z-index: 2;
}

.agenda {
  overflow: hidden;
  background: rgba(white, 0.8);
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

.days {
  width: 392px;
  padding: 0 14px 14px 14px;
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

.weekdays {
  border-bottom: 1px solid #ededed;
  text-align: center;
  color: #757575;
  padding: 14px;
  padding-top: 0;
  width: 52px;
  display: inline-block;
}

.spacer {
  height: 52px;
  vertical-align: top;
  text-align: center;
  display: inline-block;
}

.day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  height: 52px;
  width: 52px;
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

.taskedOverlay {
  transform-origin: center;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1);
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: -1;
  box-shadow: 0px 0px 0px 1px #c2c2c2;
  top: 50%;
  left: 50%;
  height: 80%;
  width: 80%;
  border-radius: 50%;
}

.todayOverlay {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  background: #ededed;
  z-index: -1;
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
}
</style>

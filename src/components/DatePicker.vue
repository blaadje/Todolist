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
        <span :class="$style.year">{{ year }}</span>
        <span :class="$style.date">
          {{ day }}
        </span>
        <span>(week {{ weekNumber }})</span>
      </div>
      <div :class="$style.days">
        <div :class="$style.shortcuts">
          <Button
            :color="colors.hex"
            :class="$style.button"
            :disabled="isTodayDisabled"
            @click="setToday"
          >
            Today
          </Button>
          <Button
            :color="colors.hex"
            :class="$style.button"
            @click="setTomorrow"
          >
            Tomorrow
          </Button>
          <Button
            :color="colors.hex"
            :class="$style.button"
            @click="setNextWeek"
          >
            Next Week
          </Button>
        </div>
        <Calendar
          :colors="colors"
          :labels-by-day="taskedDays"
          :selected-date="selectedDate"
          @isTodayDisabled="setIsTodayDisabled"
          @setSelectedDate="setSelectedDate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getWeekFromDate, formatDate, incrementDay } from '@core/utils'

import Button from './Button'
import Calendar from './Calendar'

export default {
  components: {
    Calendar,
    Button,
  },
  props: {
    taskedDays: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Date,
      required: true,
    },
    colors: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isTodayDisabled: true,
    }
  },
  computed: {
    weekNumber() {
      return getWeekFromDate(this.selectedDate)
    },
    day() {
      return formatDate(this.selectedDate, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    },
    year() {
      return formatDate(this.selectedDate, {
        year: 'numeric',
      })
    },
  },
  methods: {
    setIsTodayDisabled(value) {
      this.isTodayDisabled = value
    },
    setSelectedDate(date) {
      this.$emit('selectedDate', date)
    },
    setToday() {
      this.$emit('selectedDate', new Date())
    },
    setTomorrow() {
      const today = new Date()

      this.$emit('selectedDate', incrementDay(today))
    },
    setNextWeek() {
      const today = new Date()

      this.$emit('selectedDate', incrementDay(today, 8 - today.getDay()))
    },
  },
}
</script>

<style lang="scss" module>
.wrapper {
  background: white;
}

.shortcuts {
  padding: 1rem 2.8rem;
  border-bottom: 1px solid #ededed;
}

.agenda {
  overflow: hidden;
  user-select: none;
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
  margin-bottom: 0.6rem;
}

.date {
  font-size: 1.5em;
}

.button {
  margin-right: 0.5rem;
}
</style>
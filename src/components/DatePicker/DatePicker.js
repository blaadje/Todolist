import { defineComponent, toRefs, computed, watch } from 'vue'

import useState from '@core/hooks/useState'
import {
  getWeekFromDate,
  formatDate,
  incrementDay,
  isToday,
  defineEvents,
} from '@core/utils'

import Button from '../Button'
import Calendar from '../Calendar'
import Paper from '../Paper'

import style from './style.module.scss'

export default defineComponent({
  name: 'DatePicker', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    taskedDays: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Object,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const events = defineEvents(['selectedDate', 'previewDate'])
    const { taskedDays, selectedDate, color } = toRefs(props)
    const [isTodayDisabled, setIsTodayDisabled] = useState(
      isToday(selectedDate.value),
    )

    watch(
      () => props.selectedDate,
      (date) => setIsTodayDisabled(isToday(date)),
    )

    const handleSelectedDateUpdate = (date) => {
      emit(events.selectedDate, date)
    }
    const handlePreviewDateUpdate = (date) => {
      emit(events.previewDate, date)
      setIsTodayDisabled(date.getMonth() === selectedDate.value.getMonth())
    }
    const setToday = () => {
      emit(events.selectedDate, new Date())
    }
    const setTomorrow = () => {
      const today = new Date()

      emit(events.selectedDate, incrementDay(today))
    }
    const setNextWeek = () => {
      const today = new Date()
      const weekDaysAmount = 8

      emit(
        events.selectedDate,
        incrementDay(today, weekDaysAmount - today.getDay()),
      )
    }

    const weekNumber = computed(() => getWeekFromDate(selectedDate.value))
    const day = computed(() =>
      formatDate(selectedDate.value, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    )
    const year = computed(() =>
      formatDate(selectedDate.value, {
        year: 'numeric',
      }),
    )

    return () => {
      return (
        <div>
          <div
            class={style.triangle}
            style={{
              borderColor: `transparent transparent ${color.value} transparent`,
            }}
          />
          <Paper class={style.agenda}>
            <div class={style.header} style={{ background: color.value }}>
              <span class={style.year}>{year.value}</span>
              <span class={style.date}>{day.value}</span>
              <span>(week {weekNumber.value})</span>
            </div>
            <div class={style.days}>
              <div class={style.shortcuts}>
                <Button
                  color={color}
                  class={style.button}
                  disabled={isTodayDisabled.value}
                  onClick={setToday}
                >
                  Today
                </Button>
                <Button
                  color={color}
                  class={style.button}
                  onClick={setTomorrow}
                >
                  Tomorrow
                </Button>
                <Button
                  color={color}
                  class={style.button}
                  onClick={setNextWeek}
                >
                  Next Week
                </Button>
              </div>
              <Calendar
                color={color}
                labels-by-day={taskedDays.value}
                selected-date={selectedDate.value}
                onSelectedDateUpdate={handleSelectedDateUpdate}
                onPreviewDateUpdate={handlePreviewDateUpdate}
              />
            </div>
          </Paper>
        </div>
      )
    }
  },
})

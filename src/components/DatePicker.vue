<script>
import { defineComponent, toRefs, useCssModule, computed, watch } from 'vue'

import useState from '@core/hooks/useState'
import { getWeekFromDate, formatDate, incrementDay, isToday } from '@core/utils'

import Button from './Button'
import Calendar from './Calendar'
import Paper from './Paper'

export default defineComponent({
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
  setup(props, { emit }) {
    const style = useCssModule()
    const { taskedDays, selectedDate, colors } = toRefs(props)
    const [isTodayDisabled, setIsTodayDisabled] = useState(true)

    watch(
      () => props.selectedDate,
      (date) => setIsTodayDisabled(isToday(date)),
    )

    const handleSelectedDateUpdate = (date) => {
      emit('selectedDate', date)
    }

    const handlePreviewDateUpdate = (date) => {
      setIsTodayDisabled(date.getMonth() === selectedDate.value.getMonth())
    }
    const setToday = () => {
      emit('selectedDate', new Date())
    }
    const setTomorrow = () => {
      const today = new Date()

      emit('selectedDate', incrementDay(today))
    }
    const setNextWeek = () => {
      const today = new Date()

      emit('selectedDate', incrementDay(today, 8 - today.getDay()))
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
              borderColor: `transparent transparent ${colors.value.hex} transparent`,
            }}
          />
          <Paper class={style.agenda}>
            <div class={style.header} style={{ background: colors.value.hex }}>
              <span class={style.year}>{year.value}</span>
              <span class={style.date}>{day.value}</span>
              <span>(week {weekNumber.value})</span>
            </div>
            <div class={style.days}>
              <div class={style.shortcuts}>
                <Button
                  color={colors.value.hex}
                  class={style.button}
                  disabled={isTodayDisabled.value}
                  onClick={setToday}
                >
                  Today
                </Button>
                <Button
                  color={colors.value.hex}
                  class={style.button}
                  onClick={setTomorrow}
                >
                  Tomorrow
                </Button>
                <Button
                  color={colors.value.hex}
                  class={style.button}
                  onClick={setNextWeek}
                >
                  Next Week
                </Button>
              </div>
              <Calendar
                colors={colors.value}
                labels-by-day={taskedDays.value}
                selected-date={selectedDate.value}
                onIsTodayDisabled={(value) => setIsTodayDisabled(value)}
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
</script>

<style lang="scss" module>
.shortcuts {
  padding: 1rem 2.8rem;
  border-bottom: 1px solid #ededed;
}

.agenda {
  overflow: hidden;
  user-select: none;
  padding: 0;
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

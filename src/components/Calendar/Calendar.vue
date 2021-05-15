<script>
import {
  computed,
  defineComponent,
  ref,
  onMounted,
  toRefs,
  useCssModule,
  watch,
} from 'vue'

import LeftArrowIcon from '@assets/leftArrow.svg'
import useState from '@core/hooks/useState'
import {
  formatDate,
  areDatesEqual,
  decrementDay,
  incrementDay,
  incrementMonth,
  decrementMonth,
  isToday,
} from '@core/utils'

import Slider from '../Slider'

export default defineComponent({
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
  setup(props, { emit }) {
    const calendarRef = ref(null)
    const { colors, labelsByDay, selectedDate } = toRefs(props)
    const style = useCssModule()
    const daysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

    const [previewDate, setPreviewDate] = useState(selectedDate.value)
    const [localSelectedDate, setLocalSelectedDate] = useState(
      selectedDate.value,
    )
    const [daySize, setDaySize] = useState(0)

    const getMonth = computed(() => previewDate.value.getMonth() + 1)
    const getYear = computed(() => previewDate.value.getFullYear())
    const getDays = (month) => {
      const daysInMonth = new Date(getYear.value, month, 0).getDate()
      const endDate = new Date(getYear.value, month - 1, 0)
      const startDate = incrementDay(new Date(getYear.value, month - 1, 0))

      return {
        previousDays: Array.from({ length: endDate.getDay() }, (_, index) =>
          decrementDay(endDate, index),
        ).reverse(),
        days: Array.from({ length: daysInMonth }, (_, index) =>
          incrementDay(startDate, index),
        ),
      }
    }
    const getDisplayedMonths = computed(() => [
      getDays(getMonth.value - 1),
      getDays(getMonth.value),
      getDays(getMonth.value + 1),
    ])
    const formattedMonth = computed(() =>
      formatDate(previewDate.value, {
        month: 'long',
        year: 'numeric',
      }),
    )

    const dayHasLabel = (day) =>
      computed(() => labelsByDay.value[formatDate(day)])
    const isSelectedDay = (day) =>
      computed(() => areDatesEqual(day, localSelectedDate.value))

    const setNextMonth = () => {
      const date = incrementMonth(previewDate.value)

      setPreviewDate(date)
      emit('previewDateUpdate', date)
    }

    const setPreviousMonth = () => {
      const date = decrementMonth(previewDate.value)

      setPreviewDate(date)
      emit('previewDateUpdate', date)
    }

    const selectDay = (day) => {
      const updatedDay = isToday(day) ? new Date() : day

      setLocalSelectedDate(updatedDay)
      emit('selectedDateUpdate', updatedDay)
    }

    watch(
      () => props.selectedDate,
      (value) => {
        setLocalSelectedDate(value)
        setPreviewDate(value)
      },
    )

    onMounted(() => {
      const daysInWeek = 7

      const element = calendarRef.value
      const padding = Number(
        getComputedStyle(element).paddingLeft.split('px')[0],
      )

      setDaySize((element.clientWidth - padding * 2) / daysInWeek)
    })

    return () => (
      <div>
        <div class={style.month}>
          <LeftArrowIcon
            class={style.leftArrowIcon}
            onClick={setPreviousMonth}
          />
          <LeftArrowIcon class={style.rightArrowIcon} onClick={setNextMonth} />
          {formattedMonth.value}
        </div>
        <div class={style.calendar}>
          <div class={style.daysNameBackground}>
            <div class={style.daysNameWrapper}>
              {daysName.map((dayName) => {
                return (
                  <div
                    key={`${dayName}-daysName`}
                    class={style.day}
                    style={{
                      width: `${daySize.value}px`,
                      height: `${daySize.value}px`,
                    }}
                  >
                    {dayName}
                  </div>
                )
              })}
            </div>
          </div>
          <div ref={calendarRef} class={style.sliderWrapper}>
            <Slider
              class={style.slider}
              onIncrement={setNextMonth}
              onDecrement={setPreviousMonth}
            >
              {getDisplayedMonths.value.map(({ previousDays, days }, index) => {
                return (
                  <div key={index} class={style.daysLabels}>
                    {previousDays.map((previousDay) => {
                      return (
                        <div
                          key={`${previousDay}-${index}-previousDays`}
                          class={[style.day, style.previous]}
                          style={{
                            width: `${daySize.value}px`,
                            height: `${daySize.value}px`,
                          }}
                        >
                          {previousDay.getDate()}
                        </div>
                      )
                    })}
                    {days.map((day) => {
                      return (
                        <div
                          key={`${day}-${index}-days`}
                          class={[
                            style.day,
                            style.selectableDay,
                            { [style.isSelected]: isSelectedDay(day).value },
                          ]}
                          style={{
                            width: `${daySize.value}px`,
                            height: `${daySize.value}px`,
                          }}
                          onClick={() => selectDay(day)}
                        >
                          <span
                            class={[style.overlay, style.hoverOverlay]}
                            style={{ background: colors.value.hex }}
                          />
                          {isToday(day) && (
                            <span class={[style.overlay, style.todayOverlay]} />
                          )}
                          {dayHasLabel(day).value && (
                            <span
                              class={[
                                style.dayHasLabelOverlay,
                                {
                                  [style.isCompleted]: dayHasLabel(day).value
                                    .completed,
                                },
                              ]}
                            />
                          )}
                          {isSelectedDay(day).value && (
                            <span
                              class={[style.overlay, style.selectedOverlay]}
                              style={{ background: colors.value.hex }}
                            />
                          )}
                          <span class={style.label}>{day.getDate()}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </Slider>
          </div>
        </div>
      </div>
    )
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

import {
  computed,
  defineComponent,
  ref,
  onMounted,
  toRefs,
  watch,
  defineAsyncComponent,
} from 'vue'

import LeftArrowIcon from '@assets/leftArrow.svg'
import useState from '@core/hooks/useState'
import {
  formatDate,
  decrementDay,
  incrementDay,
  incrementMonth,
  decrementMonth,
  isToday,
  defineEvents,
} from '@core/utils'

import Slider from '../Slider'

import DaysConstructor from './components/DaysConstructor'
import style from './style.module.scss'

export default defineComponent({
  name: 'Calendar', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    color: {
      type: Object,
      required: true,
    },
    labelsByDay: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const AsyncDaysConstructor = defineAsyncComponent(() =>
      import('./components/DaysConstructor'),
    )

    const events = defineEvents(['previewDateUpdate', 'selectedDateUpdate'])
    const calendarRef = ref(null)
    const { color, labelsByDay, selectedDate } = toRefs(props)

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

    const setNextMonth = () => {
      const date = incrementMonth(previewDate.value)

      setPreviewDate(date)
      emit(events.previewDateUpdate, date)
    }

    const setPreviousMonth = () => {
      const date = decrementMonth(previewDate.value)

      setPreviewDate(date)
      emit(events.previewDateUpdate, date)
    }

    const selectDay = (day) => {
      const updatedDay = isToday(day) ? new Date() : day

      setLocalSelectedDate(updatedDay)
      emit(events.selectedDateUpdate, updatedDay)
    }

    watch(
      () => props.selectedDate,
      (value) => {
        setLocalSelectedDate(value)
        setPreviewDate(value)
      },
    )

    const calculateDaySize = computed(() => {
      const daysInWeek = 7

      const element = calendarRef.value
      const padding = Number(
        getComputedStyle(element).paddingLeft.split('px')[0],
      )

      return (element.clientWidth - padding * 2) / daysInWeek
    })

    onMounted(() => {
      setDaySize(calculateDaySize.value)
    })

    return () => {
      const [previousMonth, currentMonth, nextMonth] = getDisplayedMonths.value

      return (
        <div>
          <div class={style.month}>
            <LeftArrowIcon
              class={style.leftArrowIcon}
              onClick={setPreviousMonth}
            />
            <LeftArrowIcon
              class={style.rightArrowIcon}
              onClick={setNextMonth}
            />
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
                <AsyncDaysConstructor
                  days={previousMonth}
                  daySize={daySize}
                  selectedDate={selectedDate}
                  labelsByDay={labelsByDay}
                  onSelectDay={selectDay}
                  localSelectedDate={localSelectedDate}
                  color={color}
                />
                <DaysConstructor
                  days={currentMonth}
                  daySize={daySize}
                  selectedDate={selectedDate}
                  labelsByDay={labelsByDay}
                  onSelectDay={selectDay}
                  localSelectedDate={localSelectedDate}
                  color={color}
                />
                <AsyncDaysConstructor
                  days={nextMonth}
                  daySize={daySize}
                  selectedDate={selectedDate}
                  labelsByDay={labelsByDay}
                  onSelectDay={selectDay}
                  localSelectedDate={localSelectedDate}
                  color={color}
                />
              </Slider>
            </div>
          </div>
        </div>
      )
    }
  },
})

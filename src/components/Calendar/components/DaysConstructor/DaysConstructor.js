import {
  isToday,
  defineEvents,
  formatDate,
  areDatesEqual,
  isObjectEmpty,
} from '@core/utils'

import style from './style.module.scss'

export default function DaysConstructor(props, { emit }) {
  const events = defineEvents(['selectDay'])
  const { days, daySize, selectedDate, color, labelsByDay } = props

  return (
    <div class={style.daysLabels}>
      {days.previousDays.map((previousDay, index) => {
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
      {days.days.map((day, index) => {
        const getDayLabel = labelsByDay.value[formatDate(day)] || {}
        const dayHasLabel = !isObjectEmpty(getDayLabel)
        const isSelectedDay = areDatesEqual(selectedDate.value, day)

        return (
          <div
            key={`${day}-${index}-days`}
            class={[
              style.day,
              style.selectableDay,
              { [style.isSelected]: isSelectedDay },
            ]}
            style={{
              width: `${daySize.value}px`,
              height: `${daySize.value}px`,
            }}
            onClick={() => emit(events.selectDay, day)}
          >
            <span
              class={[style.overlay, style.hoverOverlay]}
              style={{ background: color.value }}
            />
            <span
              v-show={isToday(day)}
              class={[style.overlay, style.todayOverlay]}
            />
            <span
              v-show={dayHasLabel}
              class={[
                style.dayHasLabelOverlay,
                {
                  [style.isCompleted]: getDayLabel.completed,
                },
              ]}
            />
            <span
              v-show={isSelectedDay}
              class={[style.overlay, style.selectedOverlay]}
              style={{ background: color.value }}
            />

            <span class={style.label}>{day.getDate()}</span>
          </div>
        )
      })}
    </div>
  )
}

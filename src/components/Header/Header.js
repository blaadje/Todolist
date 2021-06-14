import { Sketch } from '@ckpack/vue-color'
import {
  defineComponent,
  toRefs,
  watch,
  Transition,
  computed,
  defineAsyncComponent,
  ref,
} from 'vue'

import CheckIcon from '@assets/check.svg'
import ClipboardIcon from '@assets/clipboard.svg'
import ColorPickerIcon from '@assets/color-picker.svg'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import useState from '@core/hooks/useState'
import { defineEvents, formatDate } from '@core/utils'

import style from './style.module.scss'

export default defineComponent({
  name: 'Header', // @TODO: remove name when vue-devtools handles it automatically
  props: {
    color: {
      type: String,
      default: '',
    },
    selectedDate: {
      type: Object,
      required: true,
    },
    tasksStatusByDays: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const AsyncDatePicker = defineAsyncComponent(() =>
      import('@components/DatePicker'),
    )

    let timeout = null
    const events = defineEvents([
      'setSelectedColor',
      'exportTasks',
      'saveColor',
      'setSelectedDate',
    ])
    const datePickerTriggerRef = ref(null)
    const { color, selectedDate, tasksStatusByDays } = toRefs(props)
    const [isSketchVisible, setSketchVisible] = useState(false)
    const [stateColor, setStateColor] = useState(color.value)
    const [isExported, setExported] = useState(false)
    const [isDatePickerVisible, setDatePickerVisible] = useState(false)
    const [previewDate, setPreviewDate] = useState(selectedDate.value)

    // @TODO: update to dumb event emit from sketch
    // we're storing color in state because sketch will need v-model
    watch(
      () => props.color,
      (value) => setStateColor(value),
    )

    const taskedDays = computed(() =>
      tasksStatusByDays.value(previewDate.value),
    )
    const handlePreviewDate = (date) => {
      setPreviewDate(date)
    }
    const handleColorUpdate = (value) => emit(events.setSelectedColor, value)
    const handleExportTask = () => {
      clearTimeout(timeout)

      setExported(true)
      emit(events.exportTasks)

      timeout = setTimeout(() => setExported(false), 2000)
    }
    const handleColorSave = () => {
      setSketchVisible(false)
      emit(events.saveColor)
    }
    const handleSelectedDate = (date) => emit(events.setSelectedDate, date)

    const formattedSelectedDate = computed(() => {
      return formatDate(selectedDate.value, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    })

    const handleDatePickerClickOutside = (event) => {
      if (event.target === datePickerTriggerRef.value) {
        return
      }

      setDatePickerVisible(false)
    }

    return () => {
      return (
        <header class={style.wrapper}>
          <Tooltip>
            {{
              trigger: () => (
                <span
                  ref={datePickerTriggerRef}
                  class={style.dateFormatted}
                  onClick={() =>
                    setDatePickerVisible(!isDatePickerVisible.value)
                  }
                >
                  {formattedSelectedDate.value}
                </span>
              ),
              content: () => <span>Calendar</span>,
            }}
          </Tooltip>
          <div class={style.icons}>
            <Tooltip>
              {{
                trigger: () => (
                  <ColorPickerIcon
                    class={style.icon}
                    onClick={() => setSketchVisible(true)}
                  />
                ),
                content: () => <span>Color picker</span>,
              }}
            </Tooltip>
            <Tooltip disabled={isExported.value}>
              {{
                trigger: () => (
                  <div>
                    {!isExported.value && (
                      <ClipboardIcon
                        class={style.icon}
                        onClick={handleExportTask}
                      />
                    )}
                    {isExported.value && (
                      <div class={style.checkIconWrapper}>
                        <Tooltip appearance="success">
                          {{
                            trigger: () => (
                              <CheckIcon
                                class={[style.icon, style.checkIcon]}
                                onClick={handleExportTask}
                              />
                            ),
                            content: () => <span>Copied in clipboard!</span>,
                          }}
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ),
                content: () => <span>Export tasks</span>,
              }}
            </Tooltip>
          </div>
          <AsyncDatePicker
            v-click-outside={handleDatePickerClickOutside}
            class={[
              style.datePicker,
              { [style.isHidden]: !isDatePickerVisible.value },
            ]}
            color={color.value}
            selected-date={selectedDate.value}
            tasked-days={taskedDays.value}
            onClose={() => setDatePickerVisible(false)}
            onSelectedDate={handleSelectedDate}
            onPrieviewDate={handlePreviewDate}
          />
          <Transition name="slideUp">
            {isSketchVisible.value && (
              <div
                v-click-outside={() => setSketchVisible(false)}
                class={style.sketchWrapper}
              >
                <Sketch
                  modelValue={stateColor.value}
                  onUpdate:modelValue={handleColorUpdate}
                  class={style.sketch}
                />
                <Button filled color={color} onClick={handleColorSave}>
                  Save
                </Button>
              </div>
            )}
          </Transition>
        </header>
      )
    }
  },
})

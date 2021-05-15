<script>
import { Sketch } from '@ckpack/vue-color'
import {
  defineComponent,
  toRefs,
  watch,
  useCssModule,
  Transition,
  computed,
} from 'vue'

import CheckIcon from '@assets/check.svg'
import ClipboardIcon from '@assets/clipboard.svg'
import ColorPickerIcon from '@assets/color-picker.svg'
import useState from '@core/hooks/useState'
import { formatDate } from '@core/utils'

import Button from '../Button'
import DatePicker from '../DatePicker'
import Tooltip from '../Tooltip'

export default defineComponent({
  props: {
    colors: {
      type: Object,
      required: true,
    },
    selectedDate: {
      type: Date,
      required: true,
    },
    taskedDays: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    let timeout = null
    const { colors, selectedDate, taskedDays } = toRefs(props)
    const [isSketchVisible, setSketchVisible] = useState(false)
    const [stateColors, setStateColors] = useState(colors.value)
    const [isExported, setExported] = useState(false)
    const [isDatePickerVisible, setDatePickerVisible] = useState(false)
    const style = useCssModule()

    watch(
      () => colors,
      (value) => setStateColors(value),
    )

    const handleColorUpdate = (value) => emit('setSelectedColor', value)
    const handleExportTask = () => {
      clearTimeout(timeout)

      setExported(true)
      emit('exportTasks')

      timeout = setTimeout(() => setExported(false), 2000)
    }
    const handleColorSave = () => {
      setSketchVisible(false)
      emit('saveColor')
    }
    const handleSelectedDate = (date) => emit('setSelectedDate', date)

    const formattedSelectedDate = computed(() => {
      return formatDate(selectedDate.value, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    })

    return () => (
      <header class={style.wrapper}>
        <Tooltip>
          {{
            trigger: () => (
              <span
                class={style.dateFormatted}
                onClick={() => setDatePickerVisible(true)}
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
        {isDatePickerVisible.value && (
          <DatePicker
            v-click-outside={() => setDatePickerVisible(false)}
            class={style.datePicker}
            colors={colors.value}
            selected-date={selectedDate.value}
            tasked-days={taskedDays.value}
            oncClose={() => setDatePickerVisible(false)}
            onSelectedDate={handleSelectedDate}
          />
        )}
        <Transition name="slideUp">
          {isSketchVisible.value && (
            <div
              v-click-outside={() => setSketchVisible(false)}
              class={style.sketchWrapper}
            >
              <Sketch
                modelValue={stateColors.value}
                onUpdate:modelValue={handleColorUpdate}
                class={style.sketch}
              />
              <Button filled color={colors.value.hex} onClick={handleColorSave}>
                Save
              </Button>
            </div>
          )}
        </Transition>
      </header>
    )
  },
})
</script>

<style lang="scss" module>
$height: 85px;

.wrapper {
  width: 100%;
  position: relative;
  padding: 2em 1em;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
}

.wrapper:before {
  content: '';
  width: 100%;
  flex: 5;
}

.icons {
  flex: 5;
  display: flex;
  margin-left: 1rem;
}

.icon {
  margin: 0 0.4rem;
}

.sketch.sketch {
  box-shadow: none;
  border: none;
  width: auto;
  border-radius: 0;
  padding: 0;
  background: transparent;
}

.sketchWrapper {
  position: absolute;
  box-shadow: 2px 6px 8px 3px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  width: 230px;
  text-align: right;
  padding: 1rem;
  left: 0;
  display: flex;
  top: $height;
  flex-direction: column;
  align-items: center;
  right: 0;
  margin: auto;
  z-index: 5;
  border-radius: 0.6rem;
}

.icon {
  -webkit-app-region: no-drag;
  width: 20px;
  height: 20px;
  fill: white;
  transition: 0.8s all cubic-bezier(0, 0.54, 0.5, 1);
  cursor: pointer;
}

.icon:hover {
  transform: scale(1.1) rotate(2deg);
}

.dateFormatted {
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  word-wrap: none;
  font-size: 1.7em;
  font-weight: 100;
  color: white;
  user-select: none;
}

.checkIconWrapper {
  white-space: nowrap;
  color: white;
  font-size: 0.8rem;
}

.checkIcon {
  color: white;
  fill: none;
  position: relative;
}

.datePicker {
  position: absolute;
  left: 0;
  top: $height;
  right: 0;
  width: 392px;
  margin: auto;
  z-index: 6;
}
</style>

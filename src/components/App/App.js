import { defineComponent, computed } from 'vue'

import Filters from '@components/Filters'
import Header from '@components/Header'
import TaskGenerator from '@components/TaskGenerator'
import TaskHeader from '@components/TaskHeader'
import UpdatesPanel from '@components/UpdatesPanel'
import {
  useColorManager,
  useState,
  useTaskManager,
  useUpdatesManager,
  useUserManager,
} from '@core/hooks'
import store from '@core/store'
import {
  copyClipBoardFromString,
  decrementDay,
  formatDate,
  incrementDay,
  isBeforeToday,
  isToday,
} from '@core/utils'

import TaskList from './components/TaskList'
import { FILTER_TAG, FILTER_ALL, SORT_ORDER, SORT_BY } from './constants'
import style from './style.module.scss'

export default defineComponent({
  name: 'App', // @TODO: remove name when vue-devtools handles it automatically
  setup() {
    const { user, updateUserColor } = useUserManager()
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [filter, setFilter] = useState(FILTER_ALL)
    const [selectedTags, setSelectedTags] = useState([])
    const [color, setColor] = useColorManager(user)
    const [activeSort, setActiveSort] = useState({
      label: 'Priority',
      value: SORT_ORDER,
    })
    const updateState = useUpdatesManager()

    const {
      addTask,
      updateTasks,
      updateTask,
      deleteTask,
      tasksStatusByDays,
      getTasksWithOffsetFromDate,
      hasRemainingTask,
      toggleAllCurrentTasksCompleted,
      setRemainingTasksToCurrentDay,
      areTaskedDayCompleted,
      hasCurrentTasks,
    } = useTaskManager(selectedDate)

    const [isStoreLoaded, setIsStoreLoaded] = useState(false)

    ;(async () => {
      await store.restored

      setIsStoreLoaded(true)
    })()

    const tags = [
      { color: '#FF675D', id: 1, name: null },
      { color: '#F9A74D', id: 2, name: null },
      { color: '#F5CE53', id: 3, name: null },
      { color: '#72CC57', id: 4, name: null },
      { color: '#57B9F4', id: 5, name: null },
      { color: '#D289E2', id: 6, name: null },
      { color: '#A5A5A7', id: 7, name: null },
    ]

    const handleSaveColor = () => {
      updateUserColor(color.value)
    }
    const handleSelectedColor = (updatedColor) => {
      setColor(updatedColor.hex8)
    }

    const getSelectedTags = (tagId) => {
      if (!tagId) {
        return []
      }

      const withoutselectedTags = selectedTags.value.filter(
        (item) => item !== tagId,
      )
      const tagToAdd = selectedTags.value.find((tag) => tag === tagId)

      return !tagToAdd ? [...withoutselectedTags, tagId] : withoutselectedTags
    }

    const handleFilter = (value, tagId) => {
      if (value === FILTER_TAG) {
        const newSelectedTags = getSelectedTags(tagId)

        setSelectedTags(newSelectedTags)
        setFilter(newSelectedTags.length ? value : FILTER_ALL)
        return
      }

      setFilter(value)
      setSelectedTags([])
    }

    const tasksWithOffset = computed(() =>
      getTasksWithOffsetFromDate(
        filter.value,
        selectedTags.value,
        activeSort.value.value,
      ),
    )

    const handleExportTasks = () => {
      // eslint-disable-next-line no-unused-vars
      const [_, currentTasks] = tasksWithOffset.value

      const formattedTaskList = `
        ${currentTasks.map(({ completed, name, date }) => {
          const completedStatus = completed ? 'x' : ' '

          return `- [${completedStatus}] ${name} - ${formatDate(
            new Date(date),
          )}\n`
        })}`
        .trim()
        .split(',')
        .join('')

      const string = `Here is my task list: \n${formattedTaskList}`

      copyClipBoardFromString(string)
    }

    const shouldShowTaskGenerator = computed(
      () => !isBeforeToday(selectedDate.value),
    )

    const shouldDisableDraggableList = computed(() => {
      return activeSort.value.value[0] !== SORT_ORDER[0]
    })

    return () => (
      // @TODO: Add transitions
      <div class={style.wrapper} style={{ background: color.value }}>
        {updateState.available.value && <UpdatesPanel updates={updateState} />}
        <Header
          selected-date={selectedDate.value}
          color={color.value}
          tasksStatusByDays={tasksStatusByDays}
          onSaveColor={handleSaveColor}
          onSetSelectedDate={(date) => setSelectedDate(date)}
          onSetSelectedColor={handleSelectedColor}
          onExportTasks={handleExportTasks}
        />
        {shouldShowTaskGenerator.value && (
          <TaskGenerator
            tags={tags}
            onCreateTask={(taskName, selectedTagId) =>
              addTask(taskName, selectedTagId, selectedDate.value)
            }
          />
        )}
        <div class={style.taskWrapper}>
          <TaskHeader
            hasRemainingTask={hasRemainingTask.value}
            activeSort={activeSort.value}
            sortBy={SORT_BY}
            isToday={isToday(selectedDate.value)}
            areTasksAllDone={areTaskedDayCompleted.value}
            hasDailyTasks={hasCurrentTasks.value}
            onTransferRemainingTasks={() => setRemainingTasksToCurrentDay()}
            onSortBy={(value) => setActiveSort(value)}
            onToggleAllCompleted={toggleAllCurrentTasksCompleted}
          />
          {isStoreLoaded.value && (
            <TaskList
              class={style.taskList}
              shouldDisableDraggableList={shouldDisableDraggableList.value}
              tasksWithOffset={tasksWithOffset.value}
              tags={tags}
              onOrderedTasks={(tasks) => updateTasks(tasks)}
              onDeleteTask={(taskId) => deleteTask(taskId)}
              onUpdateTask={(newTask) => updateTask(newTask)}
              onIncrementDay={() =>
                setSelectedDate(incrementDay(selectedDate.value))
              }
              onDecrementDay={() =>
                setSelectedDate(decrementDay(selectedDate.value))
              }
            />
          )}
        </div>
        <Filters
          remaining={tasksWithOffset.value[1].length}
          tags={tags}
          selectedTags={selectedTags.value}
          color={color.value}
          filter={filter.value}
          onFilter={handleFilter}
        />
      </div>
    )
  },
})

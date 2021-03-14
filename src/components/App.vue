<template>
  <div :class="$style.wrapper" :style="{ background }">
    <TransitionGroup
      :class="$style.transition"
      tag="div"
      :enter-active-class="$style['slide-enter-active']"
      :leave-active-class="$style['slide-leave-active']"
      :enter-class="$style['slide-enter']"
      :leave-to-class="$style['slide-leave-to']"
      :move-class="$style['slide-move']"
    >
      <div key="topWrapper" :class="$style.topWrapper">
        <UpdatesPanel v-if="updates.available" :updates="updates" />
        <Header
          :selected-date="selectedDate"
          :colors="colors"
          :tasked-days="taskedDays"
          :tags="tags"
          @saveColor="saveColor"
          @setSelectedDate="setDate"
          @setSelectedColor="setColor"
          @exportTasks="handleExportTasks"
        />
        <TaskGenerator
          v-if="isInputAvailable"
          key="taskGenerator"
          :tags="tags"
          @createTask="createTask"
        />
      </div>
      <TaskHeader
        key="taskHeader"
        :class="$style.taskHeader"
        :has-remaining-task="hasRemainingTask"
        :active-sort="activeSort"
        :sort-by="sortBy"
        :is-today="isToday"
        :are-tasks-all-done="areTasksAllDone"
        :has-task="hasTask"
        @transferRemainingTasks="transferRemainingTasks"
        @sortBy="handleSortBy"
        @toggleAllCompleted="toggleAllCompleted"
      />
      <Slider
        key="slider"
        @increment="handleIncrement"
        @decrement="handleDecrement"
      >
        <div
          v-for="(currentTasks, index) in sliderTasks"
          :key="index"
          :class="$style.taskList"
        >
          <h2
            v-if="
              !currentTasks.uncompleted.length && !currentTasks.completed.length
            "
            :class="$style.emptyState"
          >
            There's no task
          </h2>
          <DraggableList
            v-if="status === 'all' || status === 'todo'"
            :class="$style.draggableList"
            :list="currentTasks.uncompleted"
            :disabled="disableDrag"
            @orderedTasks="handleOrderedTasks"
          >
            <template #default="{ task }">
              <Task
                :class="$style.task"
                :task="task"
                :tags="tags"
                :task-date-format="getFormat"
                @setTaskCompleted="toggleTaskCompleted"
                @deleteTask="deleteTask"
                @editTask="editTask"
              />
            </template>
          </DraggableList>
          <div
            v-if="currentTasks.completed.length && (status === 'all' || status === 'done')"
            :class="$style.completedTasksWrapper"
          >
            <Divider>Done</Divider>
            <Task
              v-for="task in currentTasks.completed"
              :key="task.id"
              :class="$style.completedTask"
              :task="task"
              :tags="tags"
              :task-date-format="getFormat"
              @setTaskCompleted="toggleTaskCompleted"
              @deleteTask="deleteTask"
              @editTask="editTask"
            />
          </div>
        </div>
      </Slider>
    </TransitionGroup>
    <Filters
      key="filters"
      :remaining="remainingTasksAmount"
      :colors="colors"
      :selected-tags="selectedTags"
      :tags="tags"
      :filter="filter"
      :status="status"
      @filterByTag="handleFilterTag"
      @filterByAll="handleFilterAll"
      @filterByDate="handleFilterDate"
      @statusByAll="handleStatusAll"
      @statusByTodo="handleStatusTodo"
      @statusByCompleted="handleStatusCompleted"
    />
  </div>
</template>

<script>
import { ipcRenderer, remote } from 'electron'

import ua from 'universal-analytics'

import * as database from '@core/db/methods'
import {
  formatDate,
  areDatesEqual,
  decrementDay,
  incrementDay,
  getTimeStampFromDate,
  isToday,
} from '@core/utils'

import Divider from './Divider'
import DraggableList from './DraggableList'
import Filters from './Filters'
import Header from './Header'
import Slider from './Slider'
import Task from './Task'
import TaskGenerator from './TaskGenerator'
import TaskHeader from './TaskHeader'
import UpdatesPanel from './UpdatesPanel'

const FILTER_DATE = 'date'
const FILTER_ALL = 'all'
const STATUS_TODO = 'todo'
const STATUS_DONE = 'done'
const CATEGORY_TASK = 'category-task'
const CATEGORY_SYSTEM = 'category-system'
const ACTION_VERSION = 'action-version'
const ACTION_CREATE = 'action-create'
const ACTION_DELETE = 'action-delete'
const ACTION_EDIT = 'action-edit'

export default {
  components: {
    Header,
    Filters,
    TaskHeader,
    TaskGenerator,
    Task,
    UpdatesPanel,
    DraggableList,
    Slider,
    Divider,
  },
  data() {
    return {
      user: null,
      updates: {
        available: false,
        downloaded: false,
        progressObj: {},
        informations: null,
      },
      tasks: [],
      colors: database.getColor() || {
        hex: '#5CBCE9',
        rgb: {
          r: 44,
          g: 190,
          b: 238,
        },
      },
      sortBy: [
        { label: 'Priority', value: 'orderIndex' },
        { label: 'Name', value: 'name' },
        { label: 'Ascending date', value: 'date_asc' },
        { label: 'Descending date', value: 'date_desc' },
      ],
      activeSort: { label: 'Priority', value: 'orderIndex' },
      tags: [
        { color: '#FF675D', id: 1, name: null },
        { color: '#F9A74D', id: 2, name: null },
        { color: '#F5CE53', id: 3, name: null },
        { color: '#72CC57', id: 4, name: null },
        { color: '#57B9F4', id: 5, name: null },
        { color: '#D289E2', id: 6, name: null },
        { color: '#A5A5A7', id: 7, name: null },
      ],
      selectedDate: new Date(),
      selectedTags: [],
      filter: FILTER_DATE,
      status: FILTER_ALL,
    }
  },
  computed: {
    background() {
      return this.colors.hex8 || this.colors.hex
    },
    isManualPriorization() {
      return this.activeSort.value === 'orderIndex'
    },
    isToday() {
      return isToday(this.selectedDate)
    },
    today() {
      return new Date(new Date().setHours(0, 0, 0))
    },
    disableDrag() {
      return (
        !this.isManualPriorization ||
        this.filter === FILTER_ALL ||
        this.status !== FILTER_ALL ||
        this.selectedTags.length > 0
      )
    },
    isInputAvailable() {
      return (
        getTimeStampFromDate(this.selectedDate) >=
        getTimeStampFromDate(this.today)
      )
    },
    hasTask() {
      return Boolean(this.currentDayTasks.uncompleted.length !== 0)
    },
    selectedDateView() {
      return this.filter !== FILTER_ALL && this.selectedDate
    },
    getFormat() {
      return this.selectedDateView
        ? { hour: 'numeric', minute: 'numeric', second: 'numeric' }
        : { day: 'numeric', month: 'numeric', year: 'numeric' }
    },
    hasRemainingTask() {
      return this.tasks.some(task => {
        return (
          new Date(formatDate(new Date(task.date))) <
            new Date(formatDate(this.today)) && !task.completed
        )
      })
    },
    remainingTasksAmount() {
      return this.currentDayTasks.uncompleted.length
    },
    taskedDays() {
      return this.tasks.reduce((acc, { date }) => {
        if (Object.keys(acc).some(item => item === date)) {
          return acc
        }

        const hasCompleted = this.tasks
          .filter(task => task.date === date)
          .every(task => task.completed)

        return {
          ...acc,
          [formatDate(new Date(date))]: { completed: hasCompleted },
        }
      }, {})
    },
    areTasksAllDone() {
      return Boolean(this.remainingTasksAmount === 0)
    },
    previousDayTasks() {
      return {
        completed: this.getFilteredTasks(
          this.getTasksByDate(
            this.getSortedTasks(this.tasks),
            decrementDay(this.selectedDate),
          ),
          STATUS_DONE,
        ),
        uncompleted: this.getFilteredTasks(
          this.getTasksByDate(
            this.getSortedTasks(this.tasks),
            decrementDay(this.selectedDate),
          ),
          STATUS_TODO,
        ),
      }
    },
    currentDayTasks() {
      return {
        completed: this.getFilteredTasks(
          this.getTasksByDate(
            this.getSortedTasks(this.tasks, this.activeSort.value),
          ),
          STATUS_DONE,
        ),
        uncompleted: this.getFilteredTasks(
          this.getTasksByDate(
            this.getSortedTasks(this.tasks, this.activeSort.value),
          ),
          STATUS_TODO,
        ),
      }
    },
    nextDayTasks() {
      return {
        completed: this.getFilteredTasks(
          this.getTasksByDate(
            this.getSortedTasks(this.tasks),
            incrementDay(this.selectedDate),
          ),
          STATUS_DONE,
        ),
        uncompleted: this.getFilteredTasks(
          this.getTasksByDate(
            this.getSortedTasks(this.tasks),
            incrementDay(this.selectedDate),
          ),
          STATUS_TODO,
        ),
      }
    },
    sliderTasks() {
      return [this.previousDayTasks, this.currentDayTasks, this.nextDayTasks]
    },
  },
  created() {
    ipcRenderer.on('update-available', (event, { state, information }) => {
      this.updates.available = state
      this.updates.information = information
    })
    ipcRenderer.on('download-progress', (event, progressObj) => {
      this.updates.progressObj = progressObj
    })
    ipcRenderer.on('update-downloaded', () => {
      this.updates.downloaded = true
    })
  },
  async beforeMount() {
    const [tasks, userId] = await Promise.all([
      database.getTasks(),
      database.getUserId(),
    ])
    this.tasks = tasks
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((task, index) => {
        if (task.orderIndex) {
          return task
        }

        return {
          ...task,
          orderIndex: index,
        }
      })
    const generateId = this.generateId()
    const user = ua(process.env.GOOGLE_ANALYTICS_ID, userId || generateId)

    if (!userId) {
      database.setUserId(generateId)
    }

    user.event(CATEGORY_SYSTEM, ACTION_VERSION, remote.app.getVersion()).send()

    this.user = user
  },
  methods: {
    handleIncrement() {
      this.selectedDate = incrementDay(this.selectedDate)
    },
    handleDecrement() {
      this.selectedDate = decrementDay(this.selectedDate)
    },
    getFilteredTasks(tasks, status) {
      const filteredTasks = tasks.filter(task =>
        this.selectedTags.length > 0
          ? task.tagId && this.selectedTags.includes(task.tagId)
          : true,
      )

      switch (status) {
        case STATUS_DONE:
          return filteredTasks.filter(task => task.completed)
        case STATUS_TODO:
          return filteredTasks.filter(task => !task.completed)
        default:
          return filteredTasks
      }
    },
    getSortedTasks(tasks, field = 'orderIndex') {
      switch (field) {
        case 'date_asc':
          return tasks
            .slice()
            .sort(
              (previous, next) => new Date(previous.date) - new Date(next.date),
            )
        case 'date_desc':
          return tasks
            .slice()
            .sort(
              (previous, next) => new Date(next.date) - new Date(previous.date),
            )
        case 'orderIndex':
          return tasks
            .slice()
            .sort((previous, next) => next.orderIndex - previous.orderIndex)
        default:
          return tasks
            .slice()
            .sort((previous, next) =>
              previous[field].localeCompare(next[field]),
            )
      }
    },
    getTasksByDate(tasks, date = this.selectedDate) {
      return tasks.filter(task =>
        this.filter === FILTER_DATE
          ? areDatesEqual(new Date(task.date), date)
          : true,
      )
    },
    handleExportTasks() {
      const textarea = document.createElement('textarea')
      const tasks = [
        ...this.currentDayTasks.uncompleted,
        ...this.currentDayTasks.completed,
      ]
      const exportedString = `
        ${tasks.map(({ completed, name, date }) => {
          const completedStatus = completed ? 'x' : ' '

          return `- [${completedStatus}] ${name} - ${formatDate(
            new Date(date),
            this.getFormat,
          )}\n`
        })}`
        .trim()
        .split(',')
        .join('')

      textarea.value = `Here is my task list: \n${exportedString}`
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    },
    handleOrderedTasks(orderedTasks) {
      this.editTasks(orderedTasks)
    },
    handleSortBy(sort) {
      this.activeSort = this.sortBy.find(({ value }) => value === sort)
    },
    transferRemainingTasks() {
      this.tasks = this.tasks.map(task => {
        if (
          getTimeStampFromDate(new Date(task.date)) >=
            getTimeStampFromDate(this.today) ||
          task.completed
        ) {
          return task
        }

        return {
          ...task,
          date: new Date(),
        }
      })

      database.setRemainingTasksToday()
    },
    handleFilterTag(tagId) {
      if (!tagId) {
        this.selectedTags = []
        return
      }

      const withoutselectedTags = this.selectedTags.filter(
        item => item !== tagId,
      )
      const tagToAdd = this.selectedTags.find(tag => tag === tagId)

      this.selectedTags = !tagToAdd
        ? [...withoutselectedTags, tagId]
        : withoutselectedTags
    },
    handleFilterAll() {
      this.filter = FILTER_ALL
    },
    handleFilterDate() {
      this.filter = FILTER_DATE
    },
    handleStatusAll() {
      this.status = FILTER_ALL
    },
    handleStatusTodo() {
      this.status = STATUS_TODO
    },
    handleStatusCompleted() {
      this.status = STATUS_DONE
    },
    generateId(format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
      let d = getTimeStampFromDate(new Date())

      d += window.performance.now()

      return format.replace(/[xy]/g, c => {
        // eslint-disable-next-line no-bitwise
        const r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)

        // eslint-disable-next-line no-bitwise
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })
    },
    toggleAllCompleted() {
      const getCompletedTasks = () => {
        if (!this.selectedDateView) {
          return this.tasks.map(task => {
            return {
              ...task,
              completed: !this.areTasksAllDone,
            }
          })
        }

        return this.tasks.map(task => {
          if (!areDatesEqual(new Date(task.date), this.selectedDate)) {
            return task
          }

          return {
            ...task,
            completed: !this.areTasksAllDone,
          }
        })
      }
      this.tasks = getCompletedTasks()

      database.toggleAllTaskCompleted(this.selectedDate, this.areTasksAllDone)
    },
    saveColor() {
      database.addColor(this.colors)
    },
    setDate(date) {
      this.selectedDate = date
    },
    setColor(color) {
      this.colors = color
    },
    createTask(newTask, tagId) {
      this.user.event(CATEGORY_TASK, ACTION_CREATE).send()

      const date = isToday(this.selectedDate) ? new Date() : this.selectedDate
      const higherTaskIndex =
        (this.currentDayTasks.uncompleted.length &&
          this.currentDayTasks.uncompleted[0].orderIndex) + 1 || 0

      const task = {
        name: newTask,
        date,
        orderIndex: higherTaskIndex,
        id: `${this.generateId('xxxxxx')}${getTimeStampFromDate(new Date())}`,
        tagId,
        completed: false,
      }
      this.tasks = [...this.tasks, task]
      database.addTask(task)
    },
    deleteTask(taskId) {
      this.user.event(CATEGORY_TASK, ACTION_DELETE).send()
      this.tasks = this.tasks.filter(({ id }) => id !== taskId)
      database.deleteTask(taskId)
    },
    toggleTaskCompleted(taskId) {
      this.tasks = this.tasks.map(task => {
        if (task.id !== taskId) {
          return task
        }

        return {
          ...task,
          completed: !task.completed,
        }
      })
      database.toggleTaskCompleted(taskId)
    },
    editTask(editedTask) {
      this.tasks = this.tasks.map(task =>
        task.id === editedTask.id ? editedTask : task,
      )
      this.user.event(CATEGORY_TASK, ACTION_EDIT).send()
      database.editTask(editedTask)
    },
    editTasks(editedTasks) {
      this.tasks = this.tasks.map(task => {
        const editedTask = editedTasks.find(({ id }) => id === task.id) || false

        return editedTask || task
      })
      this.user.event(CATEGORY_TASK, ACTION_EDIT).send()
      database.editTasks(editedTasks)
    },
  },
}
</script>

<style lang="scss" module>
@import url('https://fonts.googleapis.com/css?family=Nunito:200,300,400');

$clearBlue: #62bafe;
$darkBlue: #6ef1fe;
$grey: #c2c2c2;
$lightGrey: #757575;
$duration: 0.5s;

body {
  position: relative;
  overflow-y: scroll;
  overflow-y: overlay;
}

body,
h1,
h2,
input {
  font-family: 'Nunito', sans-serif;
  padding: 0;
  margin: 0;
  line-height: 100%;
}

* {
  box-sizing: border-box;
}

section {
  margin: 0;
  padding: 0;
}

h2 {
  margin: 2em;
  color: grey;
  font-weight: 100;
  font-size: 1.2em;
}

ul {
  padding: 0;
  margin: 0;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  -webkit-border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: rgba(rgb(118, 115, 129), 0.6);
  -webkit-border-radius: 3px;
  &:window-inactive {
    background: rgba(#f5f7fc, 0.4);
  }
}

.wrapper {
  height: 100%;
  min-height: 100vh;
  display: flex;
  position: relative;
  flex-direction: column;
}

.slideUp-enter-active {
  transition: all 0.5s cubic-bezier(0, 0.54, 0.5, 1);
}

.slideUp-enter {
  opacity: 0;
  transform: translateY(-400px);
}

.slideUp-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.task {
  flex: 1;
}

.completedTask {
  padding: 1rem 1rem;
}

.taskHeader {
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  z-index: 3;
}

.emptyState {
  width: 100%;
  flex-grow: 1;
}

.taskList {
  background: white;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  z-index: 1;
}

.topWrapper {
  position: sticky;
  top: 0;
  z-index: 5;
}

.taskListWrapper {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.draggableList {
  width: 100%;
}

.slide-enter-active,
.slide-leave-active,
.slide-move {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-leave-active {
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  right: 0;
}

.transition {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
</style>

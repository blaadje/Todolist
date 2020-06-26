<template>
  <div>
    <UpdatesPanel v-if="updates.available" :updates="updates" />
    <Header
      :selectedDate="selectedDate"
      :colors="colors"
      :taskedDays="taskedDays"
      :tags="tags"
      @saveColor="saveColor"
      @selectedDate="setDate"
      @selectedColor="setColor"
      @exportTasks="handleExportTasks"
    />
    <TaskGenerator
      v-if="isInputAvailable"
      :tags="tags"
      @createTask="createTask"
    />
    <TaskHeader
      :hasRemainingTask="hasRemainingTask"
      :isToday="isToday"
      :allDone="allDone"
      :hasTask="hasTask"
      @transferRemainingTasks="transferRemainingTasks"
      @toggleAllCompleted="toggleAllCompleted"
    />
    <h2 v-if="!hasTask">
      There's no task
    </h2>
    <DraggableList
      :list="filteredByStatusTasks"
      :disabled="disableDrag"
      @orderedTasks="handleOrderedTasks"
    >
      <template #default="{ task }">
        <Task
          :class="$style.task"
          :task="task"
          :tags="tags"
          :taskDateFormat="getFormat"
          @setTaskCompleted="toggleTaskCompleted"
          @deleteTask="deleteTask"
          @editTask="editTask"
        />
      </template>
    </DraggableList>

    <Filters
      :remaining="remaining"
      :colors="colors"
      :selectedTags="selectedTags"
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

import * as database from '@core/db/methods'
import moment from 'moment'
import Header from './Header'
import Filters from './Filters'
import TaskHeader from './TaskHeader'
import Task from './Task'
import UpdatesPanel from './UpdatesPanel'
import TaskGenerator from './TaskGenerator'
import DraggableList from './DraggableList'

import ua from 'universal-analytics'

const DATE = 'date'
const ALL = 'all'
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
      tags: [
        { color: '#FF675D', id: 1, name: null },
        { color: '#F9A74D', id: 2, name: null },
        { color: '#F5CE53', id: 3, name: null },
        { color: '#72CC57', id: 4, name: null },
        { color: '#57B9F4', id: 5, name: null },
        { color: '#D289E2', id: 6, name: null },
        { color: '#A5A5A7', id: 7, name: null },
      ],
      selectedDate: moment(),
      selectedTags: [],
      filter: DATE,
      status: ALL,
    }
  },
  computed: {
    disableDrag() {
      return (
        this.filter === ALL ||
        this.status !== ALL ||
        this.selectedTags.length > 0
      )
    },
    isInputAvailable() {
      return (
        this.selectedDate.format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')
      )
    },
    hasTask() {
      return this.filteredByStatusTasks.length !== 0
    },
    selectedDateView() {
      return this.filter !== ALL && this.selectedDate
    },
    getFormat() {
      return this.selectedDateView ? 'h:mm:ss a' : 'YYYY-MM-DD'
    },
    isToday() {
      return (
        this.selectedDate.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
      )
    },
    moment: () => moment,
    hasRemainingTask() {
      return (
        this.tasks.filter(
          task =>
            moment(task.date).format('YYYY-MM-DD') <
              moment().format('YYYY-MM-DD') && !task.completed,
        ).length >= 1
      )
    },
    remaining() {
      return this.filteredByStatusTasks.filter(task => !task.completed).length
    },
    filteredByStatusTasks() {
      switch (this.status) {
        case 'completed':
          return this.filteredTasks.filter(task => task.completed)
        case 'todo':
          return this.filteredTasks.filter(task => !task.completed)
        default:
          return this.filteredTasks
      }
    },
    filteredTasks() {
      return this.tasks
        .sort((a, b) => b.orderIndex - a.orderIndex)
        .filter(task =>
          this.filter === DATE
            ? moment(task.date).format('YYYY-MM-DD') ===
              this.selectedDate.format('YYYY-MM-DD')
            : true,
        )
        .filter(task =>
          this.selectedTags.length > 0
            ? task.tagId && this.selectedTags.includes(task.tagId)
            : true,
        )
    },
    taskedDays() {
      return this.tasks.reduce((acc, task) => {
        if (
          acc.length &&
          acc.every(
            item =>
              moment(item).format('YYYY-MM-DD') ===
              moment(task.date).format('YYYY-MM-DD'),
          )
        ) {
          return acc
        }
        return [...acc, moment(task.date).format('YYYY-MM-DD')]
      }, [])
    },
    allDone() {
      return this.remaining === 0
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
    ipcRenderer.on('update-downloaded', event => {
      this.updates.downloaded = true
    })
  },
  async beforeMount() {
    const [tasks, userId] = await Promise.all([
      database.getTasks(),
      database.getUserId(),
    ])
    this.tasks = tasks
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

    if (!userId) {
      const generateId = this.generateId()
      this.user = ua(process.env.GOOGLE_ANALYTICS_ID, userId)
      database.setUserId(generateId)
      return
    }
    this.user = ua(process.env.GOOGLE_ANALYTICS_ID, userId)
    this.user
      .event(CATEGORY_SYSTEM, ACTION_VERSION, remote.app.getVersion())
      .send()
  },
  methods: {
    handleExportTasks() {
      const textarea = document.createElement('textarea')
      const exportedString = `
        ${this.filteredByStatusTasks.map(({ completed, name, date }) => {
          const completedStatus = completed ? 'x' : ' '

          return `- [${completedStatus}] ${name} - ${moment(date).format(
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
    transferRemainingTasks() {
      this.tasks = this.tasks.map(task => {
        if (moment(task.date).unix() >= moment().unix() || task.completed) {
          return task
        }

        return {
          ...task,
          date: moment(),
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
      this.filter = ALL
    },
    handleFilterDate() {
      this.filter = DATE
    },
    handleStatusAll() {
      this.status = ALL
    },
    handleStatusTodo() {
      this.status = 'todo'
    },
    handleStatusCompleted() {
      this.status = 'completed'
    },
    generateId(format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
      let d = moment().unix()

      d += window.performance.now()

      return format.replace(/[xy]/g, c => {
        const r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)

        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })
    },
    toggleAllCompleted() {
      const getCompletedTasks = () => {
        if (!this.selectedDateView) {
          return this.tasks.map(task => {
            return {
              ...task,
              completed: !this.allDone,
            }
          })
        }

        return this.tasks.map(task => {
          if (
            moment(task.date).format('YYYY-MM-DD') !==
            this.selectedDate.format('YYYY-MM-DD')
          ) {
            return task
          }

          return {
            ...task,
            completed: !this.allDone,
          }
        })
      }
      this.tasks = getCompletedTasks()

      database.toggleAllTaskCompleted(selectedDate, this.allDone)
    },
    saveColor() {
      database.addColor(this.colors)
    },
    setDate(date) {
      this.datePickerVisible = false
      this.selectedDate = date
    },
    setColor(color) {
      this.colors = color
    },
    createTask(newTask, tagId) {
      this.user.event(CATEGORY_TASK, ACTION_CREATE).send()
      const date = this.selectedDate
      const higherTaskIndex =
        (this.tasks.length && this.tasks[0].orderIndex) || 0

      const task = {
        name: newTask,
        date,
        orderIndex: higherTaskIndex + 1,
        id: `${this.generateId('xxxxxx')}${moment(date).unix()}`,
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

        return editedTask ? editedTask : task
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

body,
h1,
h2 {
  font-family: 'Nunito', sans-serif;
  background: white;
  padding: 0;
  margin: 0;
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
</style>

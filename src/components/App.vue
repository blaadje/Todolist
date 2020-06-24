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
    <Draggable
      :dragClass="$style.drag"
      :ghostClass="$style.ghost"
      :chosenClass="$style.chosen"
      :sort="false"
      handle=".handle"
    >
      <TransitionGroup
        :appear="false"
        :enter-class="$style.transitionEnter"
        :enter-active-class="$style.transitionEnterActive"
      >
        <div
          v-for="(task, index) in filteredByStatusTasks"
          :key="index"
          ref="draggingItem"
          :class="$style.taskWrapper"
          @drop="event => drop(event, index)"
          @dragstart="dragStart(index)"
          @dragend="dragEnd(index)"
          @dragover="event => dragOver(event, index)"
        >
          <DragIcon
            v-if="selectedDateView"
            class="handle"
            :class="$style.dragIcon"
          />
          <Task
            :class="$style.task"
            :task="task"
            :tags="tags"
            :taskDateFormat="getFormat"
            @setTaskCompleted="toggleTaskCompleted"
            @deleteTask="deleteTask"
            @editTask="editTask"
          />
        </div>
      </TransitionGroup>
    </Draggable>
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
import { ipcRenderer } from 'electron'
import Draggable from 'vuedraggable'

import * as database from '@core/db/methods'
import moment from 'moment'
import Header from './Header'
import Filters from './Filters'
import TaskHeader from './TaskHeader'
import Task from './Task'
import UpdatesPanel from './UpdatesPanel'
import TaskGenerator from './TaskGenerator'
import DragIcon from '@assets/drag.svg'

import ua from 'universal-analytics'

const DATE = 'date'
const ALL = 'all'
const CATEGORY_TASK = 'category-task'
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
    Draggable,
    DragIcon,
  },
  data() {
    return {
      draggingOverElementIndex: null,
      draggingStartElementIndex: null,
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
    isInputAvailable() {
      return (
        this.selectedDate.format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD')
      )
    },
    hasTask() {
      return this.filteredByStatusTasks.length !== 0
    },
    selectedDateView() {
      return this.filter !== 'all' && this.selectedDate
    },
    getFormat() {
      const selectedDate = this.selectedDateView

      return selectedDate ? 'h:mm:ss a' : 'YYYY-MM-DD'
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
    this.user.event('user', 'connect').send()
  },
  methods: {
    drop({ y }, index) {
      if (this.draggingStartElementIndex === index) {
        return
      }

      const isDirectionUp = this.isDirectionUp(
        this.$refs.draggingItem[index],
        y,
      )
      const oldTaskIndex = this.filteredByStatusTasks[
        this.draggingStartElementIndex
      ].orderIndex
      const newTaskIndex = this.filteredByStatusTasks[index].orderIndex
      const newTaskIndexFromDirection = isDirectionUp
        ? newTaskIndex + 1
        : newTaskIndex

      const newIndexPosition = this.filteredByStatusTasks.findIndex(
        ({ orderIndex }) => orderIndex === newTaskIndex,
      )

      const orderedDailyTasks = this.orderTasks(
        this.filteredByStatusTasks,
        oldTaskIndex,
        newTaskIndexFromDirection,
        newIndexPosition,
        isDirectionUp,
      )

      const otherDaysTasks = this.tasks
        .sort((a, b) => b.orderIndex - a.orderIndex)
        .filter(
          task =>
            moment(task.date).format('YYYY-MM-DD') !==
            this.selectedDate.format('YYYY-MM-DD'),
        )

      this.tasks = [...otherDaysTasks, ...orderedDailyTasks]
    },
    orderTasks(tasks, oldIndex, newIndex, newIndexPosition, isDirectionUp) {
      return tasks.map((task, index) => {
        const position = isDirectionUp ? newIndexPosition - 1 : newIndexPosition
        if (task.orderIndex === oldIndex) {
          return {
            ...task,
            orderIndex: newIndex,
          }
        }

        return index <= position
          ? {
              ...task,
              orderIndex: newIndex + 1 + position - index,
            }
          : {
              ...task,
              orderIndex: newIndex + position - index,
            }
      })
    },
    isDirectionUp(hoveringElement, y) {
      const { top, bottom } = hoveringElement.getBoundingClientRect()
      const middleHeight = hoveringElement.offsetHeight / 2
      const middlePosition = bottom - middleHeight

      return y < middlePosition
    },
    dragStart(index) {
      this.draggingStartElementIndex = index
    },
    dragEnd(index) {
      this.$refs.draggingItem.forEach(
        element => (element.style.boxShadow = 'none'),
      )
      this.draggingStartElementIndex = null
    },
    dragOver({ y }, index) {
      const hoveringElement = this.$refs.draggingItem[index]
      const color = '#62bafe'

      if (this.draggingOverElementIndex) {
        const previousElement = this.$refs.draggingItem[
          this.draggingOverElementIndex
        ]

        previousElement.style.boxShadow = 'none'
      }

      this.draggingOverElementIndex = index

      if (this.draggingStartElementIndex === index) {
        hoveringElement.style.boxShadow = 'none'
        return
      }

      hoveringElement.style.boxShadow = `${
        this.isDirectionUp(hoveringElement, y) ? 'inset' : ''
      } 0px 2px 1px 0px ${color}`
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
      this.filter = 'all'
    },
    handleFilterDate() {
      this.filter = 'date'
    },
    handleStatusAll() {
      this.status = 'all'
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
      const selectedDate = this.filter !== 'all' && this.selectedDate
      const getCompletedTasks = () => {
        if (!selectedDate) {
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
      const higherTaskIndex = this.tasks[0].orderIndex

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
    editTodo(task) {
      this.user.event(CATEGORY_TASK, ACTION_EDIT).send()
      this.editing = task
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
    editTask(taskId, taskName) {
      this.tasks = this.tasks.map(task => {
        if (task.id !== taskId) {
          return task
        }

        return {
          ...task,
          name: taskName,
        }
      })
      this.user.event(CATEGORY_TASK, ACTION_EDIT).send()
      database.editTask(taskId, taskName)
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

.transitionEnterActive {
  transition: transform 0.5s cubic-bezier(0, 0.54, 0.5, 1);
  transform: translateX(0);
}

.transitionEnter {
  transform: translateX(-400px);
}

.ghost {
  background: red;
  position: relative;
}

.ghost::after {
  background-image: repeating-linear-gradient(
    45deg,
    #f4f5f7,
    #f4f5f7 10px,
    #f0f1f4 10px,
    #f0f1f4 20px
  );
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.drag {
  background: white;
  border-radius: 0.4rem;
}

.taskWrapper {
  display: flex;
  align-items: center;
}

.taskWrapper:not(:last-child) {
  border-bottom: 1px solid #ededed;
}

.task {
  flex: 1;
}

.dragIcon {
  cursor: grab;
  margin-left: 2.4rem;
  width: 12px;
  height: 12px;
  fill: #ababab;
}

.ghost,
.chosen {
  cursor: grabbing;
}
</style>

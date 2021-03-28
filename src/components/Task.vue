<template>
  <div
    :class="[
      $style.task,
      {
        [$style.editingText]: editingText,
      },
    ]"
    v-on="$listeners"
  >
    <div v-if="editingText === null" :class="$style.view">
      <input
        :id="`toggle-${task.id}`"
        type="checkbox"
        :class="$style.toggle"
        :checked="task.completed"
        @click="$emit('setTaskCompleted', task.id)"
      />
      <label :class="$style.toggleIconsWrapper" :for="`toggle-${task.id}`">
        <CompletedTaskIcon v-if="task.completed" />
        <RunningTaskIcon v-else />
      </label>
      <div :class="$style.textWrapper" @dblclick="editingTaskName">
        <span :class="$style.date">
          {{ formattedTaskDate }}
        </span>
        <label :class="[$style.label, { [$style.completed]: task.completed }]">
          {{ task.name }}
        </label>
      </div>
      <span :class="$style.tag" :style="{ background: getTagColor }" />
      <CrossIcon
        :class="$style.destroy"
        @click.prevent="$emit('deleteTask', task.id)"
      />
    </div>
    <input
      v-if="editingText !== null"
      v-model="editingText"
      v-focus="editingText"
      :class="$style.editingTextInput"
      type="text"
      @keyup.enter="handleEditTask"
      @blur="editingText = null"
    />
  </div>
</template>

<script>
import Vue from 'vue'

import CompletedTaskIcon from '@assets/completedTask.svg'
import CrossIcon from '@assets/cross.svg'
import RunningTaskIcon from '@assets/runningTask.svg'
import { formatDate } from '@core/utils'

export default {
  directives: {
    focus(el, value) {
      if (value) {
        Vue.nextTick(() => {
          el.focus()
        })
      }
    },
  },
  components: {
    RunningTaskIcon,
    CompletedTaskIcon,
    CrossIcon,
  },
  props: {
    taskDateFormat: {
      type: Object,
      required: true,
    },
    task: {
      type: Object,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      editingText: null,
    }
  },
  computed: {
    formattedTaskDate() {
      return formatDate(new Date(this.task.date), this.taskDateFormat)
    },
    getTagColor() {
      const tags = this.tags.find(({ id }) => id === this.task.tagId)

      return tags && tags.color
    },
  },
  methods: {
    handleEditTask() {
      if (!this.editingText) {
        return
      }

      const task = {
        ...this.task,
        name: this.editingText,
      }

      this.$emit('editTask', task)
      this.editingText = null
    },
    editingTaskName() {
      this.editingText = this.task.name
    },
  },
}
</script>

<style lang="scss" module>
.task {
  position: relative;
  margin: 0;
  padding-left: 1rem;
  padding-right: 3rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  &:hover {
    .destroy {
      fill: #ededed;
    }
  }
}

.editingTextInput {
  outline: none;
  padding: 0.5em;
  width: 100%;
  color: #757575;
  border-radius: 0.2rem;
  border: 1px solid #ededed;
  font-weight: 100;
  font-size: 1.2em;
  display: block;
}

.toggle {
  display: none;
  -webkit-appearance: none;
}

.toggleIconsWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.textWrapper {
  margin-left: 1.3rem;
  display: flex;
  width: 100%;
  flex-direction: column;
}

.date {
  color: #c2c2c2;
  display: block;
  margin: 0.8rem 0;
}

.label {
  color: #757575;
  font-size: 1.2rem;
  font-weight: 100;
  line-height: 1.6rem;
  display: inline;
  position: relative;
}

.completed {
  color: #e4e4e4;
  text-decoration: line-through;
}

.tag {
  cursor: pointer;
  height: 20px;
  width: 20px;
  margin: 0.3rem;
  border-radius: 0.2rem;
  display: block;
  flex-shrink: 0;
}

.destroy {
  margin-left: 1rem;
  fill: white;
  background: transparent;
  height: 25px;
  width: 25px;
  cursor: pointer;
}

.view {
  display: flex;
  align-items: center;
}

.editingText .view {
  display: none;
}
</style>

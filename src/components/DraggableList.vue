<template>
  <Draggable
    :drag-class="$style.drag"
    :ghost-class="$style.ghost"
    :chosen-class="$style.chosen"
    :sort="false"
    handle=".handle"
  >
    <div
      v-for="(item, index) in list"
      ref="draggingItem"
      :key="index"
      :class="$style.taskWrapper"
      @drop="event => drop(event, index)"
      @dragstart="dragStart(index)"
      @dragend="dragEnd(index)"
      @dragover="event => dragOver(event, index)"
    >
      <DragIcon v-if="!disabled" class="handle" :class="$style.dragIcon" />
      <slot :task="item" />
    </div>
  </Draggable>
</template>

<script>
import Draggable from 'vuedraggable'

import DragIcon from '@assets/drag.svg'

export default {
  components: {
    Draggable,
    DragIcon,
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      draggedElementIndex: null,
      draggingStartElementIndex: null,
    }
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
      const oldTaskIndex = this.list[this.draggingStartElementIndex].orderIndex
      const newTaskIndex = this.list[index].orderIndex

      const newIndexPosition = this.list.findIndex(
        ({ orderIndex }) => orderIndex === newTaskIndex,
      )
      const newTaskIndexFromDirection = isDirectionUp
        ? newTaskIndex + 1
        : newTaskIndex

      const indexPosition = isDirectionUp
        ? newIndexPosition - 1
        : newIndexPosition

      const orderedDailyTasks = this.orderTasks(
        this.list,
        oldTaskIndex,
        newTaskIndexFromDirection,
        indexPosition,
      )

      this.$emit('orderedTasks', orderedDailyTasks)
    },
    orderTasks(tasks, oldIndex, newIndex, newIndexPosition) {
      return tasks.map((task, index) => {
        if (task.orderIndex === oldIndex) {
          return {
            ...task,
            orderIndex: newIndex,
          }
        }

        return index <= newIndexPosition
          ? {
              ...task,
              orderIndex: newIndex + 1 + newIndexPosition - index,
            }
          : {
              ...task,
              orderIndex: newIndex + newIndexPosition - index,
            }
      })
    },
    isDirectionUp(hoveringElement, y) {
      const { bottom } = hoveringElement.getBoundingClientRect()
      const middleHeight = hoveringElement.offsetHeight / 2
      const middlePosition = bottom - middleHeight

      return y < middlePosition
    },
    dragStart(index) {
      this.draggingStartElementIndex = index
    },
    dragEnd() {
      this.$refs.draggingItem.forEach(element => {
        // eslint-disable-next-line no-param-reassign
        element.style.boxShadow = 'none'
      })
      this.draggingStartElementIndex = null
    },
    dragOver({ y }, index) {
      const hoveredElement = this.$refs.draggingItem[index]
      const color = '#62bafe'

      if (this.draggedElementIndex) {
        const previousElement = this.$refs.draggingItem[
          this.draggedElementIndex
        ]

        previousElement.style.boxShadow = 'none'
      }

      this.draggedElementIndex = index

      if (this.draggingStartElementIndex === index) {
        hoveredElement.style.boxShadow = 'none'
        return
      }

      hoveredElement.style.boxShadow = `${
        this.isDirectionUp(hoveredElement, y) ? 'inset' : ''
      } 0px 2px 1px 0px ${color}`
    },
  },
}
</script>

<style lang="scss" module>
.dragIcon {
  cursor: grab;
  margin-left: 1.4rem;
  width: 12px;
  height: 12px;
  fill: #ababab;
}

.taskWrapper {
  display: flex;
  align-items: center;
}

.taskWrapper:not(:last-child) {
  border-bottom: 1px solid #ededed;
}

.ghost {
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

.ghost,
.chosen {
  cursor: grabbing;
}

.drag {
  background: white;
  border-radius: 0.4rem;
}
</style>

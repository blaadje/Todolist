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
    drop({ y }, hoveringTaskIndex) {
      if (this.draggingStartElementIndex === hoveringTaskIndex) {
        return
      }

      // this can happen with old failing ordering system
      const listHasCorruptedOrderIndex = this.list.some(
        ({ orderIndex }, index, array) => {
          if (index === 0) {
            return false
          }

          return (
            orderIndex === array[index - 1].orderIndex ||
            orderIndex > array[index - 1].orderIndex
          )
        },
      )
      const list = listHasCorruptedOrderIndex
        ? this.list.map((task, index) => {
            return {
              ...task,
              orderIndex: this.list.length - index,
            }
          })
        : this.list
      const draggedTask = list[this.draggingStartElementIndex]
      const hoveringTaskElement = this.$refs.draggingItem[hoveringTaskIndex]
      const hoveringTask = list[hoveringTaskIndex]
      const isHoveringOnUpperPart = this.isDirectionUp(hoveringTaskElement, y)
      const isDirectionUp = hoveringTaskIndex < this.draggingStartElementIndex
      const getNewIndex = () => {
        if (isDirectionUp) {
          if (isHoveringOnUpperPart) {
            return hoveringTask.orderIndex
          }
          return hoveringTask.orderIndex - 1
        }

        if (isHoveringOnUpperPart) {
          return hoveringTask.orderIndex + 1
        }
        return hoveringTask.orderIndex
      }
      const newOrderIndex = getNewIndex()
      const differenceBetween = (a, b) => {
        return Math.abs(a - b)
      }
      const elementsNumberBetweenDraggedAndDropped = differenceBetween(
        draggedTask.orderIndex,
        newOrderIndex,
      )
      const listWithoutDraggedTask = list.filter(
        ({ orderIndex }) => orderIndex !== draggedTask.orderIndex,
      )
      const updatedList = listWithoutDraggedTask
        .splice(
          isDirectionUp ? hoveringTaskIndex : this.draggingStartElementIndex,
          elementsNumberBetweenDraggedAndDropped,
        )
        .map(task => {
          return {
            ...task,
            orderIndex: isDirectionUp
              ? task.orderIndex - 1
              : task.orderIndex + 1,
          }
        })
      const updatedDraggedTask = {
        ...draggedTask,
        orderIndex: newOrderIndex,
      }

      this.$emit('orderedTasks', [
        ...listWithoutDraggedTask,
        ...updatedList,
        updatedDraggedTask,
      ])
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

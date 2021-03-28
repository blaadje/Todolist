<script>
import { defineComponent, toRef, ref, useCssModule, watch } from 'vue'

import DragIcon from '@assets/drag.svg'

let draggingStartElementIndex = null
let draggedElementIndex = null
let currentGhost = null

// @TODO: this component is ugly, it needs to be refactor
export default defineComponent({
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
  setup(props, { emit, slots }) {
    const listRef = toRef(props, 'list')
    const style = useCssModule()
    const itemRefs = ref([])

    watch(listRef, () => {
      itemRefs.value = []
    })
    const setItemRef = (element) => {
      if (!element) {
        return
      }

      itemRefs.value.push(element)
    }
    const isDirectionUp = (hoveringElement, y) => {
      const { bottom } = hoveringElement.getBoundingClientRect()
      const middleHeight = hoveringElement.offsetHeight / 2
      const middlePosition = bottom - middleHeight

      return y < middlePosition
    }
    const drop = ({ y }, hoveringTaskIndex) => {
      document.body.removeChild(currentGhost)

      if (draggingStartElementIndex === hoveringTaskIndex) {
        return
      }

      // this can happen with old failing ordering system
      const listHasCorruptedOrderIndex = listRef.value.some(
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
        ? listRef.value.map((task, index) => {
            return {
              ...task,
              orderIndex: listRef.value.length - index,
            }
          })
        : listRef.value
      const draggedTask = list[draggingStartElementIndex]
      const hoveringTaskElement = itemRefs.value[hoveringTaskIndex]
      const hoveringTask = list[hoveringTaskIndex]
      const isHoveringOnUpperPart = isDirectionUp(hoveringTaskElement, y)
      const directionUp = hoveringTaskIndex < draggingStartElementIndex
      const getNewIndex = () => {
        if (directionUp) {
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
      const differenceBetween = (a, b) => Math.abs(a - b)
      const elementsNumberBetweenDraggedAndDropped = differenceBetween(
        draggedTask.orderIndex,
        newOrderIndex,
      )
      const listWithoutDraggedTask = list.filter(
        ({ orderIndex }) => orderIndex !== draggedTask.orderIndex,
      )
      const updatedList = listWithoutDraggedTask
        .splice(
          directionUp ? hoveringTaskIndex : draggingStartElementIndex,
          elementsNumberBetweenDraggedAndDropped,
        )
        .map((task) => {
          return {
            ...task,
            orderIndex: directionUp ? task.orderIndex - 1 : task.orderIndex + 1,
          }
        })
      const updatedDraggedTask = {
        ...draggedTask,
        orderIndex: newOrderIndex,
      }

      emit('orderedTasks', [
        ...listWithoutDraggedTask,
        ...updatedList,
        updatedDraggedTask,
      ])
    }
    const dragStart = (event, index) => {
      const item = itemRefs.value[index]
      const ghost = item.cloneNode(true)
      const itemHalfHeight = item.offsetHeight / 2

      ghost.style.background = 'white'
      ghost.style.borderRadius = '0.4rem'

      document.body.appendChild(ghost)
      event.dataTransfer.setDragImage(ghost, 0, itemHalfHeight)

      currentGhost = ghost
      draggingStartElementIndex = index

      // hack to send ghost image before the item has the overlay class
      setTimeout(() => item.classList.add(style.overlay))
    }
    const dragEnd = () => {
      const draggedElement = itemRefs.value[draggedElementIndex]
      const draggingStartElement = itemRefs.value[draggingStartElementIndex]

      draggedElement.style.boxShadow = 'none'
      draggingStartElement.classList.remove(style.overlay)

      draggedElementIndex = null
      draggingStartElementIndex = null
    }
    const dragOver = (event, index) => {
      const { y } = event
      const hoveredElement = itemRefs.value[index]

      // eslint-disable-next-line no-param-reassign
      event.dataTransfer.dropEffect = 'move'
      event.preventDefault()

      if (draggedElementIndex !== null) {
        const previousElement = itemRefs.value[draggedElementIndex]

        previousElement.style.boxShadow = 'none'
      }

      draggedElementIndex = index
      hoveredElement.style.boxShadow = `${
        isDirectionUp(hoveredElement, y) ? 'inset' : ''
      } 0px 2px 1px 0px #62bafe`
    }

    return () => (
      <ul class={style.listWrapper}>
        {listRef.value.map((task, index) => {
          return (
            <li
              class={style.item}
              ref={setItemRef}
              key={index}
              onDragover={(event) => dragOver(event, index)}
              onDrop={(event) => drop(event, index)}
              onDragend={dragEnd}
            >
              {!props.disabled && (
                <span
                  draggable="true"
                  onDragstart={(event) => dragStart(event, index)}
                  onMousedown={(event) => event.stopPropagation()}
                >
                  <DragIcon class={style.dragIcon} />
                </span>
              )}
              {slots.default({ task })}
            </li>
          )
        })}
      </ul>
    )
  },
})
</script>

<style lang="scss" module>
.dragIcon {
  cursor: grab;
  margin-left: 1.4rem;
  width: 12px;
  height: 12px;
  fill: #ababab;
}

.listWrapper {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.overlay {
  position: relative;
}

.overlay::after {
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
</style>

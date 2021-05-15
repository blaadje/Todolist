import { defineComponent, toRefs } from 'vue'

import DragIcon from '@assets/drag.svg'
import { defineEvents } from '@core/utils'

import style from './style.module.scss'
import {
  isDirectionUp,
  getNewIndexFromDirection,
  getUpdatedList,
} from './utils'

let dragStartElementOrderIndex = null
let dragStartElementIndex = null
let dragStartElement = null
let currentGhost = null
let startElement = null

export default defineComponent({
  name: 'DraggableList', // @TODO: remove name when vue-devtools handles it automatically
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
    const events = defineEvents(['orderedElements'])

    const { list, disabled } = toRefs(props)

    const handleDragStart = (event, index) => {
      const currentElement = event.target.closest('.draggableElement')
      const ghost = currentElement.cloneNode(true)
      const itemHalfHeight = currentElement.offsetHeight / 2

      dragStartElementIndex = index
      dragStartElement = list.value[index]
      dragStartElementOrderIndex = dragStartElement.orderIndex
      startElement = currentElement
      ghost.style.background = 'white'
      ghost.style.borderRadius = '0.4rem'
      document.body.appendChild(ghost)
      event.dataTransfer.setDragImage(ghost, 0, itemHalfHeight)
      currentGhost = ghost

      // hack to send ghost image before the item has the overlay class
      setTimeout(() => currentElement.classList.add(style.overlay))
    }

    const handleDragOver = (event) => {
      const { y } = event
      const currentElement = event.target.closest('.draggableElement')

      event.preventDefault()
      // eslint-disable-next-line no-param-reassign
      event.dataTransfer.dropEffect = 'move'

      currentElement.style.boxShadow = `${
        isDirectionUp(currentElement, y) ? 'inset' : ''
      } 0px 2px 1px 0px #62bafe`
    }

    const handleDrop = (event, index) => {
      const { y } = event
      const currentElement = event.target.closest('.draggableElement')

      document.body.removeChild(currentGhost)
      currentGhost = null
      startElement.classList.remove(style.overlay)
      currentElement.style.boxShadow = 'none'

      if (dragStartElementIndex === index) {
        return
      }

      const hasDroppedOnUpperPart = isDirectionUp(currentElement, y)
      const droppedElementOrderIndex = list.value[index].orderIndex
      const isDropDirectionUp =
        dragStartElementOrderIndex < droppedElementOrderIndex

      const dragStartElementNewIndex = getNewIndexFromDirection(
        isDropDirectionUp,
        droppedElementOrderIndex,
        hasDroppedOnUpperPart,
      )

      const updatedElement = {
        ...dragStartElement,
        orderIndex: dragStartElementNewIndex,
      }

      emit(events.orderedElements, [
        ...getUpdatedList(
          list.value,
          isDropDirectionUp,
          dragStartElementOrderIndex,
          dragStartElementNewIndex,
        ),
        updatedElement,
      ])
    }

    const handleDragLeave = (event) => {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return
      }

      const currentElement = event.target.closest('.draggableElement')

      currentElement.style.boxShadow = 'none'
    }

    const handleDragEnd = () => {
      if (!currentGhost) {
        return
      }

      document.body.removeChild(currentGhost)
      startElement.classList.remove(style.overlay)
    }

    return () => (
      <ul class={style.listWrapper}>
        {list.value.map((element, index) => {
          return (
            <li
              class={[style.item, 'draggableElement']}
              key={element.id}
              onDrop={(event) => handleDrop(event, index)}
              onDragover={handleDragOver}
              onDragleave={handleDragLeave}
              onDragstart={(event) => handleDragStart(event, index)}
              onDragend={handleDragEnd}
            >
              {!disabled.value && (
                <span
                  draggable="true"
                  onMousedown={(event) => event.stopPropagation()}
                >
                  <DragIcon class={style.dragIcon} />
                </span>
              )}
              {slots.default({ element })}
            </li>
          )
        })}
      </ul>
    )
  },
})

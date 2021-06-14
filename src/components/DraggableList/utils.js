const isDirectionUp = (hoveringElement, y) => {
  const { bottom } = hoveringElement.getBoundingClientRect()
  const middleHeight = hoveringElement.offsetHeight / 2
  const middlePosition = bottom - middleHeight

  return y < middlePosition
}

const getNewIndexFromDirection = (
  isDropDirectionUp,
  droppedElementOrderIndex,
  hasDroppedOnUpperPart,
) => {
  if (isDropDirectionUp) {
    return hasDroppedOnUpperPart
      ? droppedElementOrderIndex
      : droppedElementOrderIndex - 1
  }

  return hasDroppedOnUpperPart
    ? droppedElementOrderIndex + 1
    : droppedElementOrderIndex
}

const getUpdatedList = (
  list,
  isDropDirectionUp,
  dragStartElementOrderIndex,
  dragStartElementNewIndex,
) => {
  return list.reduce((acc, element) => {
    const { orderIndex } = element

    if (isDropDirectionUp) {
      return orderIndex > dragStartElementOrderIndex &&
        orderIndex <= dragStartElementNewIndex
        ? [
            ...acc,
            {
              ...element,
              orderIndex: orderIndex - 1,
            },
          ]
        : acc
    }

    return orderIndex < dragStartElementOrderIndex &&
      orderIndex >= dragStartElementNewIndex
      ? [
          ...acc,
          {
            ...element,
            orderIndex: orderIndex + 1,
          },
        ]
      : acc
  }, [])
}

export { isDirectionUp, getNewIndexFromDirection, getUpdatedList }

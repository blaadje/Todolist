const differenceBetween = (a, b) => Math.abs(a - b)

const sleep = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time))

const getWeekFromDate = (date) => {
  const dayMiliseconds = 86400000
  const onejan = new Date(date.getFullYear(), 0, 1)

  return Math.ceil(((date - onejan) / dayMiliseconds + onejan.getDay() + 1) / 7)
}

const getTimeStampFromDate = (date) => {
  return Date.parse(date) / 1000
}

export const isDateValid = (date) => !Number.isNaN(date.getTime())

const areDatesEqual = (date1, date2) => {
  if (!isDateValid(date1) || !isDateValid(date2)) {
    return false
  }

  return Boolean(
    new Intl.DateTimeFormat('en', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date1) ===
      new Intl.DateTimeFormat('en', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(date2),
  )
}

const isToday = (day) => {
  return areDatesEqual(day, new Date())
}

const isObjectEmpty = (object = {}) => {
  return Boolean(Object.keys(object).length === 0)
}

const incrementDay = (date, amount = 1) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

const decrementDay = (date, amount = 1) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - amount)
}

const incrementMonth = (date, amount = 1) => {
  const incrementedDate = new Date(date)

  incrementedDate.setMonth(date.getMonth() + amount)

  return incrementedDate
}

const decrementMonth = (date, amount = 1) => {
  const incrementedDate = new Date(date)

  incrementedDate.setMonth(date.getMonth() - amount)

  return incrementedDate
}

const formatDate = (date, options) => {
  return new Intl.DateTimeFormat('en', options).format(date)
}

const isBeforeToday = (date) => {
  return new Date(formatDate(new Date(date))) < new Date(formatDate(new Date()))
}

const uuid = (format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') => {
  let d = getTimeStampFromDate(new Date())

  d += window.performance.now()

  return format.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (d + Math.random() * 16) % 16 | 0

    d = Math.floor(d / 16)

    // eslint-disable-next-line no-bitwise
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// @TODO: Remove when vue3 will handle it
const defineEvents = (events) => {
  return events.reduce((acc, event) => {
    return {
      ...acc,
      [event]: event,
    }
  }, {})
}
const copyClipBoardFromString = (string) => {
  const textarea = document.createElement('textarea')

  textarea.value = string
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export {
  defineEvents,
  sleep,
  uuid,
  getWeekFromDate,
  areDatesEqual,
  formatDate,
  incrementDay,
  decrementDay,
  incrementMonth,
  decrementMonth,
  getTimeStampFromDate,
  isToday,
  differenceBetween,
  isBeforeToday,
  copyClipBoardFromString,
  isObjectEmpty,
}

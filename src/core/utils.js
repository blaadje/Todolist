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

const areDatesEqual = (date1, date2) => {
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

export {
  sleep,
  getWeekFromDate,
  areDatesEqual,
  formatDate,
  incrementDay,
  decrementDay,
  incrementMonth,
  decrementMonth,
  getTimeStampFromDate,
  isToday,
}

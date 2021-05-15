export default (delay = 1000) => {
  let timeout = 0

  const resetTimeout = () => clearTimeout(timeout)

  const timeoutDone = () =>
    new Promise((resolve) => {
      timeout = setTimeout(() => resolve(), delay)
    })

  return [timeoutDone, resetTimeout]
}

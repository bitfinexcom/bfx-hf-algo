'use strict'

module.exports = async (instance = {}) => {
  const { state = {} } = instance
  const { interval } = state

  if (interval !== null) {
    clearInterval(interval)
  }
}

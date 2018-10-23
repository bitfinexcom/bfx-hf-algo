'use strict'

module.exports = async (instance = {}) => {
  const { state = {} } = instance
  const { timeout } = state

  if (timeout) {
    clearTimeout(timeout)
  }
}

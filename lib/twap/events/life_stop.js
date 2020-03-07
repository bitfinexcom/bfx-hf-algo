'use strict'

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { interval } = state
  const { debug, updateState } = h

  if (interval !== null) {
    clearInterval(interval)
    await updateState(instance, { interval: null })
    debug('cleared interval')
  }
}

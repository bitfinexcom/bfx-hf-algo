'use strict'

/**
 * Clears the tick interval prior to teardown
 *
 * Mapped to the `life:stop` event.
 *
 * @memberOf module:TWAP
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { interval } = state
  const { debug, updateState } = h

  if (interval !== null) {
    clearInterval(interval)
    await updateState(instance, { interval: null })
    debug('cleared interval')
  }
}

module.exports = onLifeStop

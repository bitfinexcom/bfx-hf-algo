'use strict'

/**
 * Clears the tick interval prior to teardown
 *
 * @memberOf module:TWAP
 * @listens module:bfx-hf-algo.AOHost~lifeStop
 *
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

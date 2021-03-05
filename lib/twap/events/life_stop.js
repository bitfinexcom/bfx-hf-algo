'use strict'

/**
 * Clears the tick interval prior to teardown
 *
 * @memberOf module:TWAP
 * @listens AOHost~lifeStop
 *
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { timeout } = state
  const { debug, updateState } = h

  if (timeout !== null) {
    clearTimeout(timeout)
    await updateState(instance, { timeout: null })
    debug('cleared interval/timeout')
  }
}

module.exports = onLifeStop

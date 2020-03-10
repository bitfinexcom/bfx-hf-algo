'use strict'

/**
 * Clears the tick timeout in preperation for teardown
 *
 * Mapped to the `life:stop` event.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} instance - AO instance state
 */
const onLifeStop = async (instance = {}) => {
  const { state = {} } = instance
  const { timeout } = state

  if (timeout) {
    clearTimeout(timeout)
  }
}

module.exports = onLifeStop

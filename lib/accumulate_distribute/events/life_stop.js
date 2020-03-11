'use strict'

/**
 * Clears the tick timeout in preperation for teardown
 *
 * @memberOf module:AccumulateDistribute
 * @listens AOHost~event:lifeStop
 *
 * @param {AOInstance} instance - AO instance state
 * @returns {Promise} p
 */
const onLifeStop = async (instance = {}) => {
  const { state = {} } = instance
  const { timeout } = state

  if (timeout) {
    clearTimeout(timeout)
  }
}

module.exports = onLifeStop

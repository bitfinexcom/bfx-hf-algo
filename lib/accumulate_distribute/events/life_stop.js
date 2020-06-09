'use strict'

/**
 * Clears the tick timeout in preperation for teardown
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
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

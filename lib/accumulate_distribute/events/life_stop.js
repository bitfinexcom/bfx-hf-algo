'use strict'

/**
 * Clears the tick timeout in preperation for teardown
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @listens module:bfx-hf-algo.AOHost~event:lifeStop
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance state
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

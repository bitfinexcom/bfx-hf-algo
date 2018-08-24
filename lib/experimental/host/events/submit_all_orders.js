'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Submits all provided orders with the specified delay, and adds them to the
 * AO instance state.
 *
 * @param {Object} aoHost
 * @param {string} gid - AO instance gid
 * @param {Object[]|Array[]} orders 
 * @param {number} delay - cancellation delay
 * @return {Object} nextInstanceState
 */
module.exports = async (aoHost, gid, orders, delay) => {
  return withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { submitOrderWithDelay } = h
    let nextState = state

    for (let i = 0; i < orders.length; i += 1) {
      nextState = await submitOrderWithDelay(nextState, delay, orders[i])
    }

    return {
      ...instance,
      state: nextState
    }
  })
}

'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Cancels all provided orders with the specified delay, and removes them from
 * the AO instance state.
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
    const { cancelOrderWithDelay } = h
    let nextState = state

    for (let i = 0; i < orders.length; i += 1) {
      nextState = await cancelOrderWithDelay(nextState, delay, orders[i])
    }

    return {
      ...instance,
      state: nextState
    }
  })
}

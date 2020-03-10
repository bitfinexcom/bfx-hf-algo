'use strict'

const _isObject = require('lodash/isObject')
const withAOUpdate = require('../with_ao_update')

/**
 * Cancels all provided orders with the specified delay, and removes them from
 * the AO instance state.
 *
 * @param {object} aoHost
 * @param {string} gid - AO instance gid
 * @param {Object[]|Array[]} orders
 * @param {number} delay - cancellation delay
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid, orders, delay) => {
  return withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { cancelOrderWithDelay, debug } = h
    const allOrders = _isObject(orders)
      ? Object.values(orders)
      : orders

    // Don't try to cancel market orders
    const _orders = allOrders
      .filter(o => !/MARKET/.test(o.type) && o.id)

    let nextState = state

    for (let i = 0; i < _orders.length; i += 1) {
      const o = _orders[i]

      debug(
        'canceling order %s %f @ %f [cid %s id %s]',
        o.type, o.amount, o.price, o.cid, o.id
      )

      nextState = await cancelOrderWithDelay(nextState, delay, o)
    }

    return nextState
  })
}

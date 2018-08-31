'use strict'

const _isObject = require('lodash/isObject')
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
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { submitOrderWithDelay, debug } = h
    const _orders = _isObject(orders)
      ? Object.values(orders)
      : orders

    let nextState = state

    for (let i = 0; i < _orders.length; i += 1) {
      const o = _orders[i]

      debug(
        'submitting order %s %f @ %f',
        o.type, o.amount, o.price, o.cid
      )

      nextState = await submitOrderWithDelay(nextState, delay, o)
    }

    return nextState
  })
}

'use strict'

const _isObject = require('lodash/isObject')
const withAOUpdate = require('../with_ao_update')
const excludeOrderStatus = ['CANCELED', 'EXECUTED']

/**
 * Cancels all provided orders, and removes them from the AO
 * instance state.
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance gid
 * @param {object[]|Array[]} orders - orders to be cancelled
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid, orders) => {
  return withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { cancelOrder, debug } = h
    const allOrders = _isObject(orders)
      ? Object.values(orders)
      : orders

    const excludeOrderStatusRegex = new RegExp(excludeOrderStatus.join('|'))

    // Don't try to cancel market orders
    const _orders = allOrders
      .filter(o => !/MARKET/.test(o.type) && o.id && !excludeOrderStatusRegex.test(o.status))

    let nextState = state

    for (let i = 0; i < _orders.length; i += 1) {
      const o = _orders[i]

      debug(
        'canceling order %s %f @ %f [cid %s id %s]',
        o.type, o.amount, o.price, o.cid, o.id
      )

      nextState = await cancelOrder(nextState, o)
    }

    return nextState
  })
}

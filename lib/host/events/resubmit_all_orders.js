'use strict'

const _isObject = require('lodash/isObject')
const withAOUpdate = require('../with_ao_update')

/**
 * Re-submits all provided orders with the specified delay, and adds them to the
 * AO instance state. Attaches meta labels if the algo order supports them.
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance gid
 * @param {object[]|Array[]} orders - orders to be submitted
 * @param {number} delay - cancellation delay
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid, orders, delay) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { id } = state
    const { submitOrderWithDelay, debug } = h
    const _orders = _isObject(orders)
      ? Object.values(orders).filter(order => order.status === 'REQUEUE')
      : orders.filter(order => order.status === 'REQUEUE')

    const ao = aoHost.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order type: ${id}`) // should never happen
    }

    let nextState = state

    for (let i = 0; i < _orders.length; i += 1) {
      const o = _orders[i]
      
      debug(
        're-submitting order %s %f @ %s [gid %d]',
        o.type, o.amount, o.price || 'MARKET', o.cid, o.gid
      )

      nextState = await submitOrderWithDelay(nextState, delay, o)
    }

    return nextState
  })
}

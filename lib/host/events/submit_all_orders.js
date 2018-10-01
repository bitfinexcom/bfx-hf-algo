'use strict'

const _isObject = require('lodash/isObject')
const _isFunction = require('lodash/isFunction')
const withAOUpdate = require('../with_ao_update')

/**
 * Submits all provided orders with the specified delay, and adds them to the
 * AO instance state. Attaches meta labels if the algo order supports them.
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
    const { id } = state
    const { submitOrderWithDelay, debug } = h
    const _orders = _isObject(orders)
      ? Object.values(orders)
      : orders

    const ao = aoHost.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order type: ${id}`)
    }

    const { meta = {} } = ao
    const { genOrderLabel } = meta

    let nextState = state

    for (let i = 0; i < _orders.length; i += 1) {
      const o = _orders[i]
      o.gid = +gid

      if (_isFunction(genOrderLabel)) {
        o.meta = {
          label: genOrderLabel(state)
        }
      }

      debug(
        'submitting order %s %f @ %f [gid %d]',
        o.type, o.amount, o.price, o.cid, o.gid
      )

      nextState = await submitOrderWithDelay(nextState, delay, o)
    }

    return nextState
  })
}

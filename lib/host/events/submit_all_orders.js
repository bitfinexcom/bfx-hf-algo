'use strict'

const _isObject = require('lodash/isObject')
const _isFunction = require('lodash/isFunction')
const withAOUpdate = require('../with_ao_update')

/**
 * Submits all provided orders and adds them to the
 * AO instance state. Attaches meta labels if the algo order supports them.
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance gid
 * @param {object[]|Array[]} orders - orders to be submitted
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid, orders) => {
  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {}, h = {} } = instance
    const { id } = state
    const { submitOrder, debug } = h
    const _orders = _isObject(orders)
      ? Object.values(orders)
      : orders

    const ao = aoHost.getAO(id)

    if (!ao) {
      throw new Error(`unknown algo order type: ${id}`) // should never happen
    }

    const { meta = {} } = ao
    const { genOrderLabel } = meta

    let nextState = state

    for (let i = 0; i < _orders.length; i += 1) {
      const o = _orders[i]
      o.gid = +gid

      if (!o.meta) o.meta = {}

      if (_isFunction(genOrderLabel)) {
        o.meta.label = genOrderLabel(state)
      }

      o.meta._HF = 1

      debug(
        'submitting order %s %f @ %s [gid %d]',
        o.type, o.amount, o.price || 'MARKET', o.cid, o.gid
      )

      nextState = await submitOrder(nextState, o)
    }

    return nextState
  })
}

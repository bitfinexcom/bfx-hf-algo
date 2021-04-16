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


    await Promise.all(_orders.map(async order => {
      order.gid = +gid

      if (!order.meta) order.meta = {}

      if (_isFunction(genOrderLabel)) {
        order.meta.label = genOrderLabel(state)
      }

      order.meta._HF = 1

      debug(
        'submitting order %s %f @ %s [gid %d]',
        order.type, order.amount, order.price || 'MARKET', order.cid, order.gid
      )

      await submitOrder(state, order)
    }))

    const orderPatch = _orders.reduce((obj, order) => ({ ...obj, [order.cid + '']: order }), {})


    return {
      ...state,
      allOrders: { // track beyond close
        ...state.allOrders,
        ...orderPatch
      },
      orders: {
        ...state.orders,
        ...orderPatch
      }
    }
  })
}

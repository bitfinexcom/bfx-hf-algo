'use strict'

const _isPlainObject = require('lodash/isPlainObject')
const _omit = require('lodash/omit')
const _isFunction = require('lodash/isFunction')
const _isString = require('lodash/isString')
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
  const { instances } = aoHost
  const instance = instances[gid]
  const _orders = Object.values(orders)

  if (!instance) {
    return
  }

  const { state = {}, h = {} } = instance
  const { id } = state
  const { submitOrder, debug } = h
  const ao = aoHost.getAO(id)

  if (!ao) {
    throw new Error(`unknown algo order type: ${id}`) // should never happen
  }
  const { meta = {} } = ao
  const { genOrderLabel } = meta

  await withAOUpdate(aoHost, gid, async () => {
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

  await Promise.all(_orders.map(async order => {
    order.gid = +gid

    if (!order.meta) order.meta = {}

    if (_isFunction(genOrderLabel)) {
      const label = genOrderLabel(state)

      if (_isString(label)) {
        order.meta.label = label
      } else if (_isPlainObject(label) && _isString(label.origin)) {
        order.meta.label = label.origin
        order.meta.i18n = {
          ...(order.meta.i18n || {}),
          label: label.i18n
        }
      } else {
        order.meta.label = '' // placeholder to prevent runtime errors in UI
      }
    }

    debug(
      'submitting order %s %f @ %s [gid %d]',
      order.type, order.amount, order.price || 'MARKET', order.cid, order.gid
    )

    await submitOrder(state, order, async () => {
      await withAOUpdate(aoHost, gid, async (instance = {}) => {
        const { state = {} } = instance

        return {
          ...state,
          allOrders: _omit(state.allOrders, [order.cid]),
          orders: _omit(state.allOrders, [order.cid])
        }
      })
    })
  }))
}

'use strict'

const genCID = require('../../util/gen_client_id')
const { Order } = require('bfx-api-node-models')
const genOrderAmounts = require('../util/gen_order_amounts')

/**
 * Generates an array of preview orders which show what could be expected if
 * an instance of AccumulateDistribute was executed with the specified
 * parameters.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 *
 * @param {object} args - instance parameters
 * @returns {object[]} previewOrders
 */
const genPreview = (args = {}) => {
  const {
    symbol, sliceInterval, intervalDistortion, _margin, orderType, limitPrice,
    hidden
  } = args

  const orderAmounts = genOrderAmounts(args)
  const orders = []

  orderAmounts.forEach((amount, i) => {
    if (orderType === 'MARKET') {
      orders.push(new Order({
        symbol,
        amount,
        hidden,
        cid: genCID(),
        type: _margin ? 'MARKET' : 'EXCHANGE MARKET'
      }))
    } else if (orderType === 'LIMIT') {
      orders.push(new Order({
        symbol,
        amount,
        hidden,
        price: limitPrice,
        cid: genCID(),
        type: _margin ? 'LIMIT' : 'EXCHANGE LIMIT'
      }))
    } else if (orderType === 'RELATIVE') {
      orders.push(new Order({
        symbol,
        amount,
        hidden,
        price: 'RELATIVE',
        cid: genCID(),
        type: _margin ? 'LIMIT' : 'EXCHANGE LIMIT'
      }))
    } else {
      throw new Error(`unknown order type: ${orderType}`)
    }

    const m = Math.random() > 0.5 ? 1 : -1
    const interval = intervalDistortion === 0
      ? sliceInterval
      : sliceInterval * (1 + (Math.random() * intervalDistortion * m))

    if (i !== orderAmounts.length - 1) {
      orders.push({
        label: `DELAY ${Math.floor(interval / 1000)}s`
      })
    }
  })

  return orders
}

module.exports = genPreview

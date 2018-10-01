'use strict'

const { nonce } = require('bfx-api-node-util')
const { Order } = require('bfx-api-node-models')
const genOrderAmounts = require('../util/gen_order_amounts')

module.exports = (args = {}) => {
  const {
    symbol, sliceInterval, intervalDistortion, _margin, orderType, limitPrice
  } = args

  const orderAmounts = genOrderAmounts(args)
  const orders = []

  orderAmounts.map((amount, i) => {
    if (orderType === 'MARKET') {
      orders.push(new Order({
        symbol,
        amount,
        cid: nonce(),
        type: _margin ? 'MARKET' : 'EXCHANGE MARKET'
      }))
    } else if (orderType === 'LIMIT') {
      orders.push(new Order({
        symbol,
        amount,
        price: limitPrice,
        cid: nonce(),
        type: _margin ? 'LIMIT' : 'EXCHANGE LIMIT'
      }))
    } else if (orderType === 'RELATIVE') {
      orders.push(new Order({
        symbol,
        amount,
        price: 'RELATIVE',
        cid: nonce(),
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

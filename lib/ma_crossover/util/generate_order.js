'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')

module.exports = (instance = {}) => {
  const { state = {} } = instance
  const { args = {} } = state
  const { amount, symbol, orderType, orderPrice, _margin } = args

  if (orderType === 'MARKET') {
    return new Order({
      symbol,
      amount,
      cid: nonce(),
      type: _margin ? 'MARKET' : 'EXCHANGE MARKET'
    })
  } else if (orderType === 'LIMIT') {
    return new Order({
      symbol,
      amount,
      price: +orderPrice,
      cid: nonce(),
      type: _margin ? 'LIMIT' : 'EXCHANGE LIMIT'
    })
  } else {
    throw new Error(`unknown order type: ${orderType}`)
  }
}

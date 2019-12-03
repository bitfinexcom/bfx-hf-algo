'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')

module.exports = (instance = {}) => {
  const { state = {} } = instance
  const { args = {} } = state
  const {
    amount, symbol, orderType, orderPrice, lev, _margin, _futures
  } = args

  const sharedOrderParams = {
    symbol,
    amount
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  if (orderType === 'MARKET') {
    return new Order({
      ...sharedOrderParams,
      cid: nonce(),
      type: _margin || _futures ? 'MARKET' : 'EXCHANGE MARKET'
    })
  } else if (orderType === 'LIMIT') {
    return new Order({
      ...sharedOrderParams,
      price: +orderPrice,
      cid: nonce(),
      type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT'
    })
  } else {
    throw new Error(`unknown order type: ${orderType}`)
  }
}

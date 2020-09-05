'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

/**
 * Generates the atomic order as configured in the execution parameters
 *
 * @memberOf module:MACrossover
 * @name module:MACrossover.generateOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {object} order
 */
const generateOrder = (instance = {}) => {
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
      cid: genCID(),
      type: _margin || _futures ? 'MARKET' : 'EXCHANGE MARKET',
      meta: { _HF: 1 }
    })
  } else if (orderType === 'LIMIT') {
    return new Order({
      ...sharedOrderParams,
      price: +orderPrice,
      cid: genCID(),
      type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
      meta: { _HF: 1 }
    })
  } else {
    throw new Error(`unknown order type: ${orderType}`)
  }
}

module.exports = generateOrder

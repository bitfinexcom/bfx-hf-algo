'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

/**
 * Generates the initial atomic order as configured within the execution
 * parameters.
 *
 * @memberOf module:OCOCO
 * @name module:OCOCO.generateInitialOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {object} order
 */
const generateInitialOrder = (instance = {}) => {
  const { state = {} } = instance
  const { args = {} } = state
  const {
    amount, symbol, orderType, orderPrice, hidden, postonly, lev, _margin,
    _futures, visibleOnHit, meta
  } = args

  const sharedOrderParams = {
    symbol,
    amount,
    hidden,
    visibleOnHit,
    postonly
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  if (orderType === 'MARKET') {
    return new Order({
      ...sharedOrderParams,
      cid: genCID(),
      type: _margin || _futures ? 'MARKET' : 'EXCHANGE MARKET',
      meta
    })
  } else if (orderType === 'LIMIT') {
    return new Order({
      ...sharedOrderParams,
      price: +orderPrice,
      cid: genCID(),
      type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
      meta
    })
  } else {
    throw new Error(`unknown order type: ${orderType}`)
  }
}

module.exports = generateInitialOrder

'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

/**
 * Generates the OCO atomic order as configured within the execution
 * parameters.
 *
 * @memberOf module:Bracket
 * @name module:Bracket.generateOCOOrder
 *
 * @param {AOInstance} instance - AO instance
 * @returns {Order} order
 */
const generateOCOOrder = (instance = {}) => {
  const { state = {} } = instance
  const { args = {} } = state
  const {
    ocoAmount, symbol, limitPrice, stopPrice, hidden, postonly, lev,
    _margin, _futures, visibleOnHit, meta
  } = args

  const cid = genCID()
  const sharedOrderParams = {
    meta,
    amount: ocoAmount,
    symbol
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  return new Order({
    ...sharedOrderParams,
    price: +limitPrice,
    priceAuxLimit: +stopPrice,
    oco: true,
    cid: cid,
    cidOCO: cid,
    type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
    hidden,
    visibleOnHit,
    postonly
  })
}

module.exports = generateOCOOrder

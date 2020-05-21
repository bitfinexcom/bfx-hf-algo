'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

/**
 * Generates the OCO atomic order as configured within the execution
 * parameters.
 *
 * @memberof module:bfx-hf-algo/OCOCO
 * @name module:bfx-hf-algo/OCOCO.generateOCOOrder
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @returns {object} order
 */
const generateOCOOrder = (instance = {}) => {
  const { state = {} } = instance
  const { args = {} } = state
  const {
    ocoAmount, symbol, limitPrice, stopPrice, hidden, postonly, lev,
    _margin, _futures
  } = args

  const cid = genCID()
  const sharedOrderParams = {
    meta: { _HF: 1 },
    amount: ocoAmount,
    symbol
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  const o = new Order({
    ...sharedOrderParams,
    price: +limitPrice,
    priceAuxLimit: +stopPrice,
    oco: true,
    cid: cid,
    cidOCO: cid,
    type: _margin || _futures ? 'LIMIT' : 'EXCHANGE LIMIT',
    hidden,
    postonly
  })

  return o
}

module.exports = generateOCOOrder

'use strict'

const _isFinite = require('lodash/isFinite')
const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')

/**
 * Generates an order based on the execution parameters
 *
 * @memberOf module:OOCC
 * @param {object} state - AO instance state
 * @returns {object} order
 */
const generateOrder = (state = {}) => {
  const { args = {} } = state
  const {
    orderType, orderPrice, stopPrice, distance, amount, hidden, postonly,
    lev, _futures, _margin, tif, oco
  } = args

  const o = new Order({
    cid: genCID(),
    type: orderType,
    price: orderPrice,
    meta: { _HF: 1 },
    amount,
    hidden,
    postonly
  })

  if (orderType === Order.type.STOP_LIMIT || oco) {
    o.priceAuxLimit = stopPrice
  } else if (orderType === Order.type.TRAILING_STOP) {
    o.priceTrailing = distance
  }

  if (!_margin && !_futures) {
    o.type = `EXCHANGE ${o.type}`
  }

  if (_futures) {
    o.lev = lev
  }

  if (_isFinite(tif)) {
    o.tif = tif
  }

  return o
}

module.exports = generateOrder

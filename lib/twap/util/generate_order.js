'use strict'

const _isString = require('lodash/isString')
const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

/**
 * Generates the next slice order for the provided instance, taking into
 * account the remaining amount that needs to be filled.
 *
 * @memberOf module:TWAP
 * @name module:TWAP.generateOrder
 *
 * @param {object} state - instance state
 * @param {number} price - order price
 * @returns {object} order - null if no amount remains
 */
const generateOrder = (state = {}, price) => {
  const { args = {}, remainingAmount } = state
  const {
    sliceAmount, orderType, symbol, amount, lev, _margin, _futures
  } = args

  const m = amount < 0 ? -1 : 1
  const rem = m === 1
    ? Math.min(sliceAmount, remainingAmount)
    : Math.max(sliceAmount, remainingAmount)

  if (Math.abs(rem) < DUST) {
    return null
  }

  const baseOrderParams = {
    symbol,
    price
  }

  if (_futures) {
    baseOrderParams.lev = lev
  }

  return new Order({
    ...baseOrderParams,
    cid: genCID(),
    amount: rem,
    meta: { _HF: 1 },
    type: _isString(orderType)
      ? orderType
      : _margin || _futures
        ? 'MARKET'
        : 'EXCHANGE MARKET'
  })
}

module.exports = generateOrder

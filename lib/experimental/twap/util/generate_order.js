'use strict'

const _isFinite = require('lodash/isFinite')
const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = (state = {}) => {
  const { args = {}, remainingAmount } = state
  const {
    sliceAmount, priceCondition, priceTarget, orderType, symbol, amount
  } = args

  const m = amount < 0 ? -1 : 1
  const rem = m === 1
    ? Math.max(0, remainingAmount - sliceAmount)
    : Math.min(0, remainingAmount - sliceAmount)

  if (Math.abs(rem) < DUST) {
    return []
  }

  // TODO: Handle price conditions (otherwise MARKET)

  return [new Order({
    symbol,
    cid: nonce(),
    type: _margin ? 'MARKET' : 'EXCHANGE MARKET',
    amount: rem,
  })]
}

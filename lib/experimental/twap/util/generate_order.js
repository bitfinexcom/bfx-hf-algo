'use strict'

const _isString = require('lodash/isString')
const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = (state = {}, price) => {
  const { args = {}, remainingAmount } = state
  const { sliceAmount, orderType, symbol, amount, _margin } = args

  const m = amount < 0 ? -1 : 1
  const rem = m === 1
    ? Math.min(sliceAmount, remainingAmount)
    : Math.max(sliceAmount, remainingAmount)

  if (Math.abs(rem) < DUST) {
    return null
  }

  return new Order({
    symbol,
    price,
    cid: nonce(),
    amount: rem,
    type: _isString(orderType)
      ? orderType
      : _margin
        ? 'MARKET'
        : 'EXCHANGE MARKET'
  })
}

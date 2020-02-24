'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = (state = {}) => {
  const { args = {}, remainingAmount } = state
  const {
    sliceAmount, price, excessAsHidden, orderType, symbol, amount, lev, _futures
  } = args

  const m = amount < 0 ? -1 : 1
  const orders = []
  const sliceOrderAmount = m === 1
    ? Math.min(sliceAmount, remainingAmount)
    : Math.max(sliceAmount, remainingAmount)

  if (Math.abs(sliceOrderAmount) <= DUST) {
    return []
  }

  const sharedOrderParams = {
    symbol,
    price
  }

  if (_futures) {
    sharedOrderParams.lev = lev
  }

  if (excessAsHidden) {
    const rem = remainingAmount - sliceAmount

    if (
      (m === 1 && rem >= DUST) ||
      (m === -1 && rem <= DUST)
    ) {
      orders.push(new Order({
        ...sharedOrderParams,
        cid: nonce(),
        type: orderType,
        amount: rem,
        hidden: true
      }))
    }
  }

  orders.push(new Order({
    ...sharedOrderParams,
    cid: nonce(),
    type: orderType,
    amount: sliceOrderAmount
  }))

  return orders
}

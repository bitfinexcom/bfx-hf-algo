'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = (state = {}) => {
  const { args = {}, remainingAmount } = state
  const {
    sliceAmount, price, excessAsHidden, orderType, symbol, amount
  } = args
  const m = amount < 0 ? -1 : 1
  const orders = []
  const sliceOrderAmount = m === 1
    ? Math.min(sliceAmount, remainingAmount)
    : Math.max(sliceAmount, remainingAmount)

  if (Math.abs(sliceOrderAmount) <= DUST) {
    return []
  }

  orders.push(new Order({
    symbol,
    price,
    cid: nonce(),
    type: orderType,
    amount: sliceOrderAmount
  }))

  if (excessAsHidden) {
    const rem = remainingAmount - sliceAmount

    if (Math.abs(rem) >= DUST) {
      orders.push(new Order({
        symbol,
        price,
        cid: nonce(),
        type: orderType,
        amount: rem,
        hidden: true
      }))
    }
  }

  return orders
}

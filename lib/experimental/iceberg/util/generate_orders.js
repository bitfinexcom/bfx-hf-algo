'use strict'

const { Order } = require('bfx-api-node-models')
const { nonce } = require('bfx-api-node-util')

module.exports = (state = {}) => {
  const { args = {}, remainingAmount } = state
  const {
    sliceAmount, price, excessAsHidden, orderType, symbol, amount
  } = args
  const m = amount < 0 ? -1 : 1

  const orders = []
  orders.push(new Order({
    symbol,
    price,
    cid: nonce(),
    type: orderType,
    amount: m === 1
      ? Math.min(sliceAmount, remainingAmount)
      : Math.max(sliceAmount, remainingAmount),
  }))

  if (excessAsHidden && Math.abs(remainingAmount) > Math.abs(sliceAmount)) {
    orders.push(new Order({
      symbol,
      price,
      cid: nonce(),
      type: orderType,
      amount: remainingAmount - sliceAmount,
      hidden: true,
    }))
  }

  return orders
}

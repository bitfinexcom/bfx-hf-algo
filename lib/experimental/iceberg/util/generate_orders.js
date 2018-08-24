'use strict'

const { Order } = require('bfx-api-node-models')

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
    type: orderType,
    amount: m === 1
      ? Math.min(sliceAmount, remainingAmount)
      : Math.max(sliceAmount, remainingAmount),
  }))

  if (excessAsHidden && Math.abs(remainingAmount) > Math.abs(sliceAmount)) {
    orders.push(new Order({
      symbol,
      price,
      type: orderType,
      amount: m === 1
        ? remainingAmount - sliceAmount
        : sliceAmount - remainingAmount,
      hidden: true,
    }))
  }

  return orders
}

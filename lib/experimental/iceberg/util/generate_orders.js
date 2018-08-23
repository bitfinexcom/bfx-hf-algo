'use strict'

const { Order } = require('bfx-api-node-models')

module.exports = (state = {}) => {
  const { args = {}, remainingAmount } = state
  const { sliceAmount, price, excessAsHidden, orderType } = args

  const orders = []
  orders.push(new Order({
    type: orderType,
    amount: Math.min(sliceAmount, remainingAmount),
    price,
  }))

  if (excessAsHidden && remainingAmount > sliceAmount) {
    orders.push(new Order({
      type: orderType,
      amount: remainingAmount - sliceAmount,
      hidden: true,
      price,
    }))
  }

  return orders
}

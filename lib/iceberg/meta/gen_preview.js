'use strict'

const genOrders = require('../util/generate_orders')

module.exports = (args = {}) => {
  const { amount } = args

  return genOrders({
    remainingAmount: amount,
    args,
  })
}

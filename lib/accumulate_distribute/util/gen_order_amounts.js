'use strict'

const _isFinite = require('lodash/isFinite')
const { prepareAmount } = require('bfx-api-node-util')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = (args = {}) => {
  const { amount, sliceAmount, amountDistortion } = args
  let orderAmounts = []

  if (_isFinite(amountDistortion)) {
    let totalAmount = 0

    while (Math.abs(amount - totalAmount) > DUST) {
      const m = Math.random() > 0.5 ? 1 : -1
      const orderAmount = sliceAmount * (1 + (Math.random() * amountDistortion * m))
      const remAmount = amount - totalAmount
      const cappedOrderAmount = +prepareAmount(remAmount < 0
        ? Math.max(remAmount, orderAmount)
        : Math.min(remAmount, orderAmount)
      )

      orderAmounts.push(cappedOrderAmount)
      totalAmount += cappedOrderAmount
    }
  } else {
    const n = Math.ceil(amount / sliceAmount)
    orderAmounts = Array.apply(null, Array(n)).map(() => sliceAmount)
  }

  return orderAmounts
}

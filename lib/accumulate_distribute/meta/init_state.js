'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

const genOrderAmounts = require('../util/gen_order_amounts')

module.exports = (args = {}) => {
  const { amount } = args
  const orderAmounts = genOrderAmounts(args)

  let totalAmount = 0
  orderAmounts.forEach(a => { totalAmount += a })

  if (Math.abs(totalAmount - amount) > DUST) {
    throw new Error(`total order amount is too large: ${totalAmount} > ${amount}`)
  }

  return {
    args,
    orderAmounts,
    currentOrder: 0,
    ordersBehind: 0,
    remainingAmount: amount
  }
}

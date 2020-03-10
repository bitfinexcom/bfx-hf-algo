'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

const genOrderAmounts = require('../util/gen_order_amounts')

/**
 * Creates an initial state object for an AccumulateDistribute instance to
 * begin executing with. Generates randomized order amounts depending on the
 * execution parameters and resets the order timeline (orders behind, etc).
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} args - instance execution parameters
 * @returns {object} initialState
 */
const initState = (args = {}) => {
  const { amount } = args
  const orderAmounts = genOrderAmounts.gen(args)

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

module.exports = initState

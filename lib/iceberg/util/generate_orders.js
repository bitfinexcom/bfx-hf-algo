'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config

/**
 * Returns an order set for the provided Iceberg instance, including a slice
 * order and the remaining amount as a hidden order if configured.
 *
 * @memberof module:bfx-hf-algo/Iceberg
 * @name module:bfx-hf-algo/Iceberg.generateOrders
 * @see module:bfx-hf-algo/Iceberg.onSelfSubmitOrders
 *
 * @param {object} state - instance state
 * @returns {object[]} orders - order array
 */
const generateOrders = (state = {}) => {
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
        cid: genCID(),
        type: orderType,
        amount: rem,
        hidden: true,
        meta: { _HF: 1 }
      }))
    }
  }

  orders.push(new Order({
    ...sharedOrderParams,
    cid: genCID(),
    type: orderType,
    amount: sliceOrderAmount,
    meta: { _HF: 1 }
  }))

  return orders
}

module.exports = generateOrders

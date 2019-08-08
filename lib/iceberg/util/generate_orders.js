'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
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

  if (excessAsHidden) {
    const rem = remainingAmount - sliceAmount

    if (
      (m === 1 && rem >= DUST) ||
      (m === -1 && rem <= DUST)
    ) {
      orders.push(new Order({
        symbol,
        price,
        cid: genCID(),
        type: orderType,
        amount: rem,
        hidden: true
      }))
    }
  }

  orders.push(new Order({
    symbol,
    price,
    cid: genCID(),
    type: orderType,
    amount: sliceOrderAmount
  }))

  return orders
}

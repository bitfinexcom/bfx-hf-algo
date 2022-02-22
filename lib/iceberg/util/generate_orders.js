'use strict'

const { Order } = require('bfx-api-node-models')
const genCID = require('../../util/gen_client_id')
const { Config } = require('bfx-api-node-core')
const { DUST } = Config
const { nBN } = require('@bitfinex/lib-js-util-math')
const { types: { OrderSignal } } = require('bfx-hf-signals')

/**
 * Returns an order set for the provided Iceberg instance, including a slice
 * order and the remaining amount as a hidden order if configured.
 *
 * @memberOf module:Iceberg
 * @name module:Iceberg.generateOrders
 * @see module:Iceberg.onSelfSubmitOrders
 *
 * @param {object} instance - instance state
 * @param {Signal} origin
 * @returns {object[]} orders - order array
 */
const generateOrders = (instance, origin) => {
  const { state, h } = instance
  const { tracer } = h
  const { args = {}, remainingAmount } = state
  const {
    sliceAmount, price, excessAsHidden, orderType, symbol, amount, lev, _futures, meta
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
    const rem = nBN(remainingAmount).minus(sliceAmount).toNumber()

    if (
      (m === 1 && rem >= DUST) ||
      (m === -1 && rem <= DUST)
    ) {
      const order = new Order({
        ...sharedOrderParams,
        cid: genCID(),
        type: orderType,
        amount: rem,
        hidden: true,
        meta
      })

      tracer.collect(new OrderSignal(order, origin))
      orders.push(order)
    }
  }

  const order = new Order({
    ...sharedOrderParams,
    cid: genCID(),
    type: orderType,
    amount: sliceOrderAmount,
    meta
  })

  tracer.collect(new OrderSignal(order, origin))
  orders.push(order)

  return orders
}

module.exports = generateOrders

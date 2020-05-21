'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

/**
 * Called when an order is filled. Cancels any remaining open orders (slice or
 * excess), updates the remaining amount on the instance state, and submits
 * the next order set.
 *
 * @memberof module:bfx-hf-algo/Iceberg
 * @listens module:bfx-hf-algo.AOHost~ordersOrderFill
 *
 * @param {module:bfx-hf-algo.AOInstance} instance - AO instance
 * @param {module:bfx-api-node-models.Order} order - order that filled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit, updateState, debug, debouncedSubmitOrders } = h
  const { cancelDelay, amount } = args
  const m = amount < 0 ? -1 : 1

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)

  const fillAmount = order.getLastFillAmount()
  const remainingAmount = state.remainingAmount - fillAmount
  const absRem = m < 0 ? remainingAmount * -1 : remainingAmount

  order.resetFilledAmount()

  debug('updated remaining amount: %f [filled %f]', remainingAmount, fillAmount)

  await updateState(instance, { remainingAmount })

  if (absRem > DUST) { // continue
    debouncedSubmitOrders() // created in life.start
    return
  }

  if (absRem < 0) {
    debug('warning: overfill! %f', absRem)
  }

  return emit('exec:stop')
}

module.exports = onOrdersOrderFill

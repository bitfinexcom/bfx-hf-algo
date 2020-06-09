'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

/**
 * Triggered when an atomic order fills. Updates the remaining amount on the
 * instance state, and emits the `exec:stop` if the instance is now fully
 * filled.
 *
 * @memberof module:bfx-hf-algo/TWAP
 * @listens AOHost~ordersOrderFill
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - the order that filled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { emit, updateState, debug } = h
  const { amount } = args
  const m = amount < 0 ? -1 : 1

  const fillAmount = order.getLastFillAmount()
  const remainingAmount = state.remainingAmount - fillAmount
  const absRem = m < 0 ? remainingAmount * -1 : remainingAmount

  order.resetFilledAmount()

  debug('updated remaining amount: %f [filled %f]', remainingAmount, fillAmount)

  await updateState(instance, { remainingAmount })

  if (absRem > DUST) { // continue, await next tick
    return
  }

  if (absRem < 0) {
    debug('warning: overfill! %f', absRem)
  }

  return emit('exec:stop')
}

module.exports = onOrdersOrderFill

'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config
const { nBN } = require('@bitfinex/lib-js-util-math')

/**
 * Triggered when an atomic order fills. Updates the remaining amount on the
 * instance state, and emits the `exec:stop` if the instance is now fully
 * filled.
 *
 * @memberOf module:TWAP
 * @listens AOHost~ordersOrderFill
 *
 * @param {AOInstance} instance - AO instance
 * @param {object} order - the order that filled
 * @returns {Promise} p - resolves on completion
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, minDistortedAmount } = state
  const { emit, updateState, debug } = h
  const { amount } = args
  const m = amount < 0 ? -1 : 1

  const fillAmount = order.getLastFillAmount()
  const remainingAmount = nBN(state.remainingAmount).minus(fillAmount).toNumber()
  const absRem = m < 0 ? remainingAmount * -1 : remainingAmount

  order.resetFilledAmount()

  debug('updated remaining amount: %f [filled %f]', remainingAmount, fillAmount)

  await updateState(instance, { remainingAmount })

  if (absRem > DUST && absRem >= minDistortedAmount) { // continue, await next tick
    return
  }

  if (absRem < 0) {
    debug('warning: overfill! %f', absRem)
  }

  return emit('exec:stop')
}

module.exports = onOrdersOrderFill

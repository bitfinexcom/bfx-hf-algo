'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

const scheduleTick = require('../util/schedule_tick')

/**
 * Called when an order fills. Updates the remaining amount & order timeline
 * position (if behind, etc) on the instance state. If the instance is fully
 * filled, the `exec:stop` event is triggered.
 *
 * Otherwise, if `catchUp` is enabled and the instance is behind with order
 * fills the next tick is re-scheduled to occur earlier in order to compensate.
 *
 * @memberof module:bfx-hf-algo/AccumulateDistribute
 * @listens AOHost~event:ordersOrderFill
 * @see module:bfx-hf-algo/AccumulateDistribute.scheduleTick
 *
 * @param {AOInstance} instance - AO instance state
 * @param {object} order - the order that filled
 * @returns {Promise} p
 */
const onOrdersOrderFill = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, ordersBehind, timeout, currentOrder } = state
  const { emit, updateState, debug } = h
  const { catchUp } = args

  const newOrdersBehind = Math.max(0, ordersBehind - 1)
  const fillAmount = order.getLastFillAmount()
  const remainingAmount = state.remainingAmount - fillAmount
  const absRem = Math.abs(remainingAmount)

  order.resetFilledAmount()

  debug('updated remaining amount: %f [filled %f]', remainingAmount, fillAmount)

  await updateState(instance, {
    remainingAmount,
    ordersBehind: newOrdersBehind,
    currentOrder: currentOrder + 1
  })

  if (absRem <= DUST) { // stop if finished
    if (absRem < 0) {
      debug('warning: overfill! %f', absRem)
    }

    clearTimeout(timeout)

    return emit('exec:stop')
  }

  if (catchUp && newOrdersBehind > 0) {
    debug('catching up (behind with %d orders)', newOrdersBehind)

    clearTimeout(timeout)
    await scheduleTick.tick(instance, true) // re-schedule early submit
  } else if (ordersBehind > 0 && newOrdersBehind === 0) {
    debug('caught up!')
  }
}

module.exports = onOrdersOrderFill

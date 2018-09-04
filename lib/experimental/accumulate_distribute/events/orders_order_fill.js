'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

const scheduleTick = require('../util/schedule_tick')

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, ordersBehind, timeout, currentOrder } = state
  const { emit, updateState, debug } = h
  const { amount, catchUp } = args
  const m = amount < 0 ? -1 : 1

  const newOrdersBehind = Math.max(0, ordersBehind - 1)
  const fillAmount = order.getLastFillAmount()
  const remainingAmount = state.remainingAmount - fillAmount
  const absRem = Math.abs(remainingAmount)

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
    await scheduleTick(instance, true) // re-schedule early submit
  } else if (ordersBehind > 0 && newOrdersBehind === 0) {
    debug('caught up!')
  }
}

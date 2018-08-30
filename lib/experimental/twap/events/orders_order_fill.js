'use strict'

const { Config } = require('bfx-api-node-core')
const { DUST } = Config

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {} } = state
  const { emit, updateState, debug } = h
  const { amount } = args
  const m = amount < 0 ? -1 : 1

  const fillAmount = order.getLastFillAmount()
  const remainingAmount = state.remainingAmount - fillAmount
  const absRem = m < 0 ? remainingAmount * -1 : remainingAmount

  debug('updated remaining amount: %f [filled %f]', remainingAmount, fillAmount)

  await updateState(instance, { remainingAmount })

  if (absRem > DUST) { // continue, await next tick
    return
  }

  if (absRem < 0) {
    debug('warning: overfill! %f', absRem)
  }

  await emit('exec:stop')
}

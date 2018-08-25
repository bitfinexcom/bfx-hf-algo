'use strict'

module.exports = async (instance = {}, order) => {
  const { state = {}, h = {} } = instance
  const { args = {}, remainingAmount, orders = {}, gid } = state
  const { emit, emitSelf, updateState, debug } = h
  const { cancelDelay } = args

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)

  await updateState(instance, {
    remainingAmount: remainingAmount - order.getLastFillAmount()
  })

  await emitSelf('submit_orders')
}

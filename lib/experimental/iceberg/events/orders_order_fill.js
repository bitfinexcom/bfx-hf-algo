'use strict'

module.exports = async (state = {}, h = {}, order) => {
  const { args = {}, remainingAmount, orders = {} } = state
  const { emitAsync, emitSelfAsync } = h
  const { cancelDelay } = args

  emitAsync('exec:order:cancel:all', gid, orders, cancelDelay)
  emitSelfAsync('submit_orders')

  return {
    ...nextState,
    remainingAmount: remainingAmount - order.getLastFillAmount()
  }
}

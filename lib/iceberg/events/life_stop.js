'use strict'

module.exports = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { args = {}, orders = {}, gid } = state
  const { emit, debouncedSubmitOrders } = h
  const { cancelDelay } = args

  if (debouncedSubmitOrders) {
    debouncedSubmitOrders.cancel()
  }

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
}

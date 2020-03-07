'use strict'

module.exports = async (instance = {}) => {
  const { h = {} } = instance
  const { debouncedSubmitOrders } = h

  debouncedSubmitOrders.cancel()
}

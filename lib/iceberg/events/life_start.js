'use strict'

const _debounce = require('lodash/debounce')

module.exports = async (instance = {}) => {
  const { h = {} } = instance
  const { emitSelf } = h

  // Needs to be debounced, in case both orders are filled simultaneously,
  // triggering two submits in a row
  h.debouncedSubmitOrders = _debounce(() => {
    emitSelf('submit_orders')
  }, 500)

  await emitSelf('submit_orders')
}
